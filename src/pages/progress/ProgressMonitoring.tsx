import React, { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle, ClipboardCheck, RefreshCw, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { prototypeAssumptionNote } from "@/src/data"
import { useTheme } from "@/src/components/ThemeProvider"
import { useData } from "@/src/contexts/DataContext"
import {
  AttentionEngagement,
  ProgressAction,
  PromptLevel,
  ResponseMode,
  TaskCompletion,
} from "@/src/types"
import {
  computeProgress,
  engagementScoreMap,
  getProgressScore,
  promptingScoreMap,
  taskCompletionScoreMap,
} from "@/src/lib/progressScoring"

const responseModes: ResponseMode[] = ["Oral", "Written", "Pointing", "AAC", "Assisted", "Picture choices"]
const promptingLevels: PromptLevel[] = ["Independent", "Minimal prompting", "Moderate prompting", "High prompting"]
const taskCompletions: TaskCompletion[] = ["Completed", "Partially completed", "Not completed"]
const engagementLevels: AttentionEngagement[] = [
  "Sustained engagement",
  "Occasional redirection",
  "Frequent redirection",
  "Unable to sustain",
]
const actions: ProgressAction[] = ["Continue", "Adjust", "Change", "Stop", "Reassess"]

export function ProgressMonitoring() {
  const { theme } = useTheme()
  const {
    learners,
    interventionPlans,
    progressRecords,
    recommendations,
    addProgressRecord,
    updateInterventionPlan,
    updateLearner,
    updateRecommendation,
  } = useData()

  const activePlans = useMemo(
    () => interventionPlans.filter((plan) => ["Active", "Under review", "Planned"].includes(plan.status)),
    [interventionPlans]
  )
  const [selectedPlanId, setSelectedPlanId] = useState(activePlans[0]?.id || interventionPlans[0]?.id || "")
  const [form, setForm] = useState({
    progressDate: new Date().toISOString().slice(0, 10),
    activityMaterialUsed: "",
    totalItems: "5",
    correctResponses: "4",
    responseMode: "Oral" as ResponseMode,
    promptingLevel: "Minimal prompting" as PromptLevel,
    taskCompletion: "Completed" as TaskCompletion,
    attentionEngagement: "Occasional redirection" as AttentionEngagement,
    teacherTherapistNotes: "",
    parentFeedback: "",
    finalAction: "Continue" as ProgressAction,
    finalActionReason: "",
  })

  useEffect(() => {
    if (!selectedPlanId && interventionPlans[0]) {
      setSelectedPlanId(interventionPlans[0].id)
    }
  }, [interventionPlans, selectedPlanId])

  const selectedPlan = interventionPlans.find((plan) => plan.id === selectedPlanId)
  const learner = learners.find((entry) => entry.id === selectedPlan?.learnerId)
  const linkedRecommendation = recommendations.find((entry) => entry.id === selectedPlan?.recommendationId)

  const isDark = theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark"))
  const textColor = isDark ? "#e2e8f0" : "#64748b"
  const tooltipBg = isDark ? "#0f172a" : "#ffffff"
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0"

  const learnerProgressRecords = useMemo(() => {
    if (!selectedPlan) return []
    return progressRecords
      .filter((record) => record.interventionPlanId === selectedPlan.id)
      .sort((a, b) => new Date(a.progressDate).getTime() - new Date(b.progressDate).getTime())
  }, [progressRecords, selectedPlan])

  const latestRecord = learnerProgressRecords[learnerProgressRecords.length - 1]
  const previousScore = latestRecord ? getProgressScore(latestRecord) : null
  const computed = useMemo(
    () =>
      computeProgress({
        totalItems: Number(form.totalItems) || 0,
        correctResponses: Number(form.correctResponses) || 0,
        promptingLevel: form.promptingLevel,
        taskCompletion: form.taskCompletion,
        attentionEngagement: form.attentionEngagement,
        previousScore,
      }),
    [form.attentionEngagement, form.correctResponses, form.promptingLevel, form.taskCompletion, form.totalItems, previousScore]
  )

  useEffect(() => {
    setForm((prev) => {
      if (prev.finalActionReason && prev.finalAction !== computed.systemSuggestedAction) return prev
      return {
        ...prev,
        finalAction: computed.systemSuggestedAction,
        finalActionReason: "",
      }
    })
  }, [computed.systemSuggestedAction])

  const progressData = learnerProgressRecords.map((record, index) => ({
    session: `Update ${index + 1}`,
    date: format(new Date(record.progressDate), "MMM d"),
    score: getProgressScore(record),
    accuracy: record.computedAccuracy || 0,
  }))

  const currentStatus = linkedRecommendation?.progressStatus || learner?.status || "Stable"
  const isOverride = form.finalAction !== computed.systemSuggestedAction
  const totalItems = Number(form.totalItems) || 0
  const correctResponses = Number(form.correctResponses) || 0

  const saveProgress = () => {
    if (!selectedPlan || !learner || !linkedRecommendation) {
      toast.error("No intervention plan selected", {
        description: "Select an active intervention plan before saving a progress update.",
      })
      return
    }

    if (!form.progressDate || !form.activityMaterialUsed.trim()) {
      toast.error("Complete the session details", {
        description: "Progress date and activity or material used are required.",
      })
      return
    }

    if (totalItems <= 0) {
      toast.error("Enter a valid total item count", {
        description: "Total items/questions must be greater than zero so the system can compute accuracy.",
      })
      return
    }

    if (correctResponses < 0 || correctResponses > totalItems) {
      toast.error("Correct responses must fit the total items", {
        description: "Correct responses cannot be negative or greater than the total number of items.",
      })
      return
    }

    if ((isOverride || form.finalAction === "Stop") && !form.finalActionReason.trim()) {
      toast.error("Explain the final action", {
        description: "A reason is required when the teacher overrides the system suggestion or manually stops a plan.",
      })
      return
    }

    const finalReason = form.finalActionReason.trim() || computed.systemSuggestionReason

    addProgressRecord({
      learnerId: learner.id,
      interventionPlanId: selectedPlan.id,
      progressDate: form.progressDate,
      activityMaterialUsed: form.activityMaterialUsed.trim(),
      targetSkill: selectedPlan.targetSkill,
      currentScore: computed.computedProgressScore,
      promptingLevel: form.promptingLevel,
      taskCompletion: form.taskCompletion,
      attentionEngagement: form.attentionEngagement,
      responseMode: form.responseMode,
      totalItems,
      correctResponses,
      comprehensionAccuracy: `${correctResponses}/${totalItems} (${computed.computedAccuracy}%)`,
      computedAccuracy: computed.computedAccuracy,
      computedProgressScore: computed.computedProgressScore,
      scoreChangeFromPrevious: computed.scoreChangeFromPrevious,
      computedProgressStatus: computed.computedProgressStatus,
      systemSuggestedAction: computed.systemSuggestedAction,
      systemSuggestionReason: computed.systemSuggestionReason,
      finalAction: form.finalAction,
      finalActionReason: finalReason,
      teacherTherapistNotes: form.teacherTherapistNotes.trim(),
      parentFeedback: form.parentFeedback.trim(),
      recommendedAction: form.finalAction,
      reason: finalReason,
    })

    updateInterventionPlan(selectedPlan.id, {
      status:
        form.finalAction === "Continue"
          ? "Active"
          : form.finalAction === "Stop"
            ? "Stopped"
            : "Under review",
      notes: finalReason,
    })

    updateLearner(learner.id, {
      status: computed.computedProgressStatus,
    })

    updateRecommendation(linkedRecommendation.id, {
      progressStatus: computed.computedProgressStatus,
      teacherNotes: form.teacherTherapistNotes.trim() || linkedRecommendation.teacherNotes,
    })

    toast.success("Progress update saved", {
      description: `${learner.code} now has a computed progress score of ${computed.computedProgressScore}/10.`,
    })

    setForm({
      progressDate: new Date().toISOString().slice(0, 10),
      activityMaterialUsed: "",
      totalItems: "5",
      correctResponses: "4",
      responseMode: form.responseMode,
      promptingLevel: form.promptingLevel,
      taskCompletion: "Completed",
      attentionEngagement: "Occasional redirection",
      teacherTherapistNotes: "",
      parentFeedback: "",
      finalAction: computed.systemSuggestedAction,
      finalActionReason: "",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Progress Monitoring</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Semi-automated progress tracking based on measurable reading-comprehension session results.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
        <span className="font-semibold">Prototype logic:</span> Teacher inputs raw session results; the system computes progress score,
        accuracy, trend, and suggested next action. Teacher or specialist judgment remains final.
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <StepTitle step="1" title="Select Intervention Plan" />
            <CardDescription>Choose the active or review-stage plan to update.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Intervention plan" htmlFor="interventionPlan">
              <select
                id="interventionPlan"
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
                className={controlClass}
              >
                {interventionPlans.map((plan) => {
                  const planLearner = learners.find((entry) => entry.id === plan.learnerId)
                  return (
                    <option key={plan.id} value={plan.id}>
                      {(planLearner?.code || "Learner")} - {plan.targetSkill}
                    </option>
                  )
                })}
              </select>
            </Field>

            {selectedPlan && learner ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">{learner.code}</h3>
                    <Badge variant={selectedPlan.status === "Active" ? "success" : "warning"}>{selectedPlan.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedPlan.strategy}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><span className="font-semibold text-slate-900 dark:text-slate-100">Frequency:</span> {selectedPlan.frequency}</p>
                    <p><span className="font-semibold text-slate-900 dark:text-slate-100">Review date:</span> {format(new Date(selectedPlan.reviewDate), "MMM d, yyyy")}</p>
                  </div>
                </div>

                <InfoPanel title="Linked target and goal">
                  <p>Target skill: {selectedPlan.targetSkill}</p>
                  <p>IEP-aligned goal: {selectedPlan.linkedGoal}</p>
                </InfoPanel>

                <InfoPanel title="Progress rule used">
                  <p>Progress Score = Comprehension x 50% + Prompting x 25% + Task Completion x 15% + Engagement x 10%.</p>
                  <p className="mt-2 text-amber-700 dark:text-amber-300">Professional judgment can override the suggested action.</p>
                </InfoPanel>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No intervention plan is available yet. Activate a validated recommendation first.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <StepTitle step="2" title="Encode Session Results" />
            <CardDescription>Input measurable performance data from the reading activity or material used.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Progress date" htmlFor="progressDate">
                <input
                  id="progressDate"
                  type="date"
                  value={form.progressDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, progressDate: event.target.value }))}
                  className={controlClass}
                />
              </Field>
              <Field label="Activity / material used" htmlFor="activityMaterialUsed">
                <input
                  id="activityMaterialUsed"
                  value={form.activityMaterialUsed}
                  onChange={(event) => setForm((prev) => ({ ...prev, activityMaterialUsed: event.target.value }))}
                  placeholder="Short story with why/how cards"
                  className={controlClass}
                />
              </Field>
              <Field label="Total items/questions" htmlFor="totalItems" helper="Used as the denominator for comprehension accuracy.">
                <input
                  id="totalItems"
                  type="number"
                  min="1"
                  value={form.totalItems}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalItems: event.target.value }))}
                  className={controlClass}
                />
              </Field>
              <Field label="Correct responses" htmlFor="correctResponses" helper="Cannot exceed total items/questions.">
                <input
                  id="correctResponses"
                  type="number"
                  min="0"
                  max={Math.max(0, totalItems)}
                  value={form.correctResponses}
                  onChange={(event) => setForm((prev) => ({ ...prev, correctResponses: event.target.value }))}
                  className={controlClass}
                />
              </Field>
              <SelectField
                id="responseMode"
                label="Response mode"
                value={form.responseMode}
                options={responseModes}
                onChange={(value) => setForm((prev) => ({ ...prev, responseMode: value as ResponseMode }))}
              />
              <SelectField
                id="promptingLevel"
                label="Prompting level"
                value={form.promptingLevel}
                options={promptingLevels}
                onChange={(value) => setForm((prev) => ({ ...prev, promptingLevel: value as PromptLevel }))}
              />
              <SelectField
                id="taskCompletion"
                label="Task completion"
                value={form.taskCompletion}
                options={taskCompletions}
                onChange={(value) => setForm((prev) => ({ ...prev, taskCompletion: value as TaskCompletion }))}
              />
              <SelectField
                id="attentionEngagement"
                label="Attention / engagement"
                value={form.attentionEngagement}
                options={engagementLevels}
                onChange={(value) => setForm((prev) => ({ ...prev, attentionEngagement: value as AttentionEngagement }))}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Auto-computed from raw inputs</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ScoreChip label="Accuracy" value={`${computed.computedAccuracy}%`} />
                <ScoreChip label="Prompting" value={`${computed.promptingScore}/10`} />
                <ScoreChip label="Completion" value={`${computed.completionScore}/10`} />
                <ScoreChip label="Engagement" value={`${computed.engagementScore}/10`} />
              </div>
            </div>

            <TextAreaField
              label="Teacher / therapist notes"
              value={form.teacherTherapistNotes}
              onChange={(value) => setForm((prev) => ({ ...prev, teacherTherapistNotes: value }))}
              placeholder="Learner answered better when picture clues were shown before why/how questions."
              optional
            />
            <TextAreaField
              label="Parent feedback"
              value={form.parentFeedback}
              onChange={(value) => setForm((prev) => ({ ...prev, parentFeedback: value }))}
              placeholder="Parent reported similar response during home reading follow-up."
              optional
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <StepTitle step="3" title="Review Computed Progress" />
            <CardDescription>System suggests the next action; teacher validation remains final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Computed progress score</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <span className="text-4xl font-bold text-slate-950 dark:text-slate-50">{computed.computedProgressScore}</span>
                <span className="pb-1 text-xl font-semibold text-slate-500 dark:text-slate-400">/10</span>
                <Badge variant={computed.computedProgressStatus === "Improving" ? "success" : computed.computedProgressStatus === "Needs Modified Support" ? "warning" : "outline"}>
                  {computed.computedProgressStatus}
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Compared with previous record</p>
              <p className={`mt-2 text-2xl font-bold ${computed.scoreChangeFromPrevious !== null && computed.scoreChangeFromPrevious < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {computed.scoreChangeFromPrevious === null ? "No previous score" : `${computed.scoreChangeFromPrevious >= 0 ? "+" : ""}${computed.scoreChangeFromPrevious}`}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {previousScore === null ? "This will become the baseline record." : `Previous score: ${previousScore}/10`}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/60 dark:bg-green-950/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">System suggested next action</p>
              <p className="mt-2 text-2xl font-bold text-green-800 dark:text-green-100">{computed.systemSuggestedAction}</p>
              <p className="mt-2 text-sm leading-6 text-green-900 dark:text-green-100">{computed.systemSuggestionReason}</p>
            </div>

            <SelectField
              id="finalAction"
              label="Teacher validation / override"
              value={form.finalAction}
              options={actions}
              onChange={(value) => setForm((prev) => ({ ...prev, finalAction: value as ProgressAction }))}
              helper={isOverride ? "Override selected. A professional reason is required." : "Keeping the system suggestion is allowed after review."}
            />

            <TextAreaField
              label="Reason for final action"
              value={form.finalActionReason}
              onChange={(value) => setForm((prev) => ({ ...prev, finalActionReason: value }))}
              placeholder={isOverride ? "Explain why professional judgment differs from the system suggestion." : computed.systemSuggestionReason}
              optional={!isOverride && form.finalAction !== "Stop"}
            />

            <Button className="w-full" disabled={!selectedPlan || !learner} onClick={saveProgress}>
              <ClipboardCheck size={16} className="mr-2" /> Save Progress Update
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ProgressMetric
          label="Current learner status"
          value={currentStatus}
          tone={currentStatus === "Improving" ? "success" : currentStatus === "Needs Modified Support" ? "warning" : "default"}
          icon={currentStatus === "Improving" ? TrendingUp : currentStatus === "Needs Modified Support" ? AlertTriangle : RefreshCw}
        />
        <ProgressMetric label="Progress records" value={String(learnerProgressRecords.length)} tone="default" />
        <ProgressMetric label="Latest computed score" value={latestRecord ? `${getProgressScore(latestRecord)}/10` : "No data"} tone="default" />
        <ProgressMetric
          label="Latest computed change"
          value={latestRecord?.scoreChangeFromPrevious === null || latestRecord?.scoreChangeFromPrevious === undefined ? "Baseline" : `${latestRecord.scoreChangeFromPrevious >= 0 ? "+" : ""}${latestRecord.scoreChangeFromPrevious}`}
          tone={(latestRecord?.scoreChangeFromPrevious || 0) > 0 ? "success" : (latestRecord?.scoreChangeFromPrevious || 0) < 0 ? "warning" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress trend</CardTitle>
          <CardDescription>Computed progress scores for the selected intervention plan.</CardDescription>
        </CardHeader>
        <CardContent className="h-[380px]">
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: textColor }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: textColor }} />
                <Tooltip
                  labelFormatter={(value, payloads) => (payloads && payloads[0] ? `${payloads[0].payload.session} (${value})` : String(value))}
                  contentStyle={{ borderRadius: "8px", backgroundColor: tooltipBg, borderColor: tooltipBorder, color: textColor }}
                  itemStyle={{ color: textColor }}
                />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
              No progress records are available yet for the selected plan. Save a session result to establish the first baseline.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Prototype note:</span> {prototypeAssumptionNote}
      </div>
    </div>
  )
}

const controlClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"

function StepTitle({ step, title }: { step: string; title: string }) {
  return (
    <CardTitle className="flex items-center gap-3 text-base">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{step}</span>
      {title}
    </CardTitle>
  )
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string
  htmlFor: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>
      {children}
      {helper ? <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{helper}</p> : null}
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  helper,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  helper?: string
}) {
  return (
    <Field label={label} htmlFor={id} helper={helper}>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  optional = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  optional?: boolean
}) {
  return (
    <Field label={`${label}${optional ? " (Optional)" : ""}`} htmlFor={label.replace(/\W+/g, "-").toLowerCase()}>
      <textarea
        id={label.replace(/\W+/g, "-").toLowerCase()}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[96px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500"
      />
    </Field>
  )
}

function ScoreChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
      {label}: {value}
    </span>
  )
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-slate-200">
      <p className="font-semibold text-slate-950 dark:text-slate-50">{title}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  )
}

function ProgressMetric({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: string
  tone: "default" | "success" | "warning"
  icon?: React.ComponentType<{ className?: string }>
}) {
  const toneClass =
    tone === "success"
      ? "text-green-600 dark:text-green-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-950 dark:text-slate-50"

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-2xl font-bold ${toneClass}`}>{value}</span>
          {Icon ? <Icon className={toneClass} /> : null}
        </div>
      </CardContent>
    </Card>
  )
}
