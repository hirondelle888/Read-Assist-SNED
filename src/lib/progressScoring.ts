import {
  AttentionEngagement,
  ProgressAction,
  ProgressRecord,
  ProgressStatus,
  PromptLevel,
  TaskCompletion,
} from "@/src/types"

export const promptingScoreMap: Record<PromptLevel, number> = {
  Independent: 10,
  "Minimal prompting": 8,
  "Moderate prompting": 5,
  "High prompting": 2,
}

export const taskCompletionScoreMap: Record<TaskCompletion, number> = {
  Completed: 10,
  "Partially completed": 5,
  "Not completed": 0,
}

export const engagementScoreMap: Record<AttentionEngagement, number> = {
  "Sustained engagement": 10,
  "Occasional redirection": 7,
  "Frequent redirection": 4,
  "Unable to sustain": 1,
}

export type ProgressComputationInput = {
  totalItems: number
  correctResponses: number
  promptingLevel: PromptLevel
  taskCompletion: TaskCompletion
  attentionEngagement: AttentionEngagement
  previousScore: number | null
}

export type ProgressComputationResult = {
  comprehensionScore: number
  promptingScore: number
  completionScore: number
  engagementScore: number
  computedAccuracy: number
  computedProgressScore: number
  scoreChangeFromPrevious: number | null
  computedProgressStatus: ProgressStatus
  systemSuggestedAction: ProgressAction
  systemSuggestionReason: string
}

export function getProgressScore(record: Pick<ProgressRecord, "computedProgressScore" | "currentScore">) {
  return Number.isFinite(record.computedProgressScore) && record.computedProgressScore > 0
    ? record.computedProgressScore
    : Number(record.currentScore) || 0
}

export function computeProgress(input: ProgressComputationInput): ProgressComputationResult {
  const totalItems = Math.max(0, Number(input.totalItems) || 0)
  const correctResponses = clamp(Number(input.correctResponses) || 0, 0, totalItems)
  const computedAccuracy = totalItems > 0 ? roundOne((correctResponses / totalItems) * 100) : 0
  const comprehensionScore = totalItems > 0 ? roundOne((correctResponses / totalItems) * 10) : 0
  const promptingScore = promptingScoreMap[input.promptingLevel]
  const completionScore = taskCompletionScoreMap[input.taskCompletion]
  const engagementScore = engagementScoreMap[input.attentionEngagement]
  const computedProgressScore = roundOne(
    comprehensionScore * 0.5 + promptingScore * 0.25 + completionScore * 0.15 + engagementScore * 0.1
  )
  const scoreChangeFromPrevious =
    input.previousScore === null || Number.isNaN(input.previousScore)
      ? null
      : roundOne(computedProgressScore - input.previousScore)
  const { action, reason } = suggestAction({
    score: computedProgressScore,
    change: scoreChangeFromPrevious,
    promptingLevel: input.promptingLevel,
    taskCompletion: input.taskCompletion,
  })

  return {
    comprehensionScore,
    promptingScore,
    completionScore,
    engagementScore,
    computedAccuracy,
    computedProgressScore,
    scoreChangeFromPrevious,
    computedProgressStatus: deriveProgressStatus(action, scoreChangeFromPrevious),
    systemSuggestedAction: action,
    systemSuggestionReason: reason,
  }
}

function suggestAction({
  score,
  change,
  promptingLevel,
  taskCompletion,
}: {
  score: number
  change: number | null
  promptingLevel: PromptLevel
  taskCompletion: TaskCompletion
}) {
  const effectiveChange = change ?? 0

  if (taskCompletion === "Not completed") {
    return {
      action: "Reassess" as ProgressAction,
      reason: "The task was not completed, so the support team should review task fit, materials, and readiness before continuing.",
    }
  }

  if (effectiveChange <= -1 && promptingLevel === "High prompting") {
    return {
      action: "Reassess" as ProgressAction,
      reason: "The score decreased while high prompting was still needed, which suggests the current plan may need a fuller review.",
    }
  }

  if (effectiveChange <= -1) {
    return {
      action: "Change" as ProgressAction,
      reason: "The computed score decreased by at least one point from the previous progress record.",
    }
  }

  if (effectiveChange >= 1 && ["Independent", "Minimal prompting"].includes(promptingLevel)) {
    return {
      action: "Continue" as ProgressAction,
      reason: "The score improved by at least one point and the learner required only independent or minimal prompting.",
    }
  }

  if (score < 7) {
    return {
      action: "Adjust" as ProgressAction,
      reason: "The score is stable or slightly improved but remains below the expected support threshold of 7/10.",
    }
  }

  return {
    action: "Continue" as ProgressAction,
    reason: "The computed score is at or above the support threshold and does not show a concerning decline.",
  }
}

function deriveProgressStatus(action: ProgressAction, change: number | null): ProgressStatus {
  if (action === "Continue" && (change === null || change >= 0)) return "Improving"
  if (action === "Adjust" || action === "Change" || action === "Reassess") return "Needs Modified Support"
  return "Stable"
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
