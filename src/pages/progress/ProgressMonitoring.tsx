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
import { ProgressAction, ProgressRecord, PromptLevel } from "@/src/types"

const promptingLevels: PromptLevel[] = ["Independent", "Minimal prompting", "Moderate prompting", "High prompting"]
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
    currentScore: "7",
    promptingLevel: "Minimal prompting" as PromptLevel,
    taskCompletion: "",
    attentionEngagement: "",
    comprehensionAccuracy: "",
    teacherTherapistNotes: "",
    parentFeedback: "",
    recommendedAction: "Continue" as ProgressAction,
    reason: "",
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
  const previousRecord = learnerProgressRecords[learnerProgressRecords.length - 2]
  const scoreDiff = latestRecord && previousRecord ? latestRecord.currentScore - previousRecord.currentScore : 0

  const progressData = learnerProgressRecords.map((record, index) => ({
    session: `Update ${index + 1}`,
    date: format(new Date(record.progressDate), "MMM d"),
    score: record.currentScore,
  }))

  const currentStatus = linkedRecommendation?.progressStatus || learner?.status || "Stable"

  const saveProgress = () => {
    if (!selectedPlan || !learner || !linkedRecommendation) {
      toast.error("No intervention plan selected", {
        description: "Select an active intervention plan before saving a progress update.",
      })
      return
    }
    if (!form.taskCompletion.trim() || !form.attentionEngagement.trim() || !form.comprehensionAccuracy.trim() || !form.reason.trim()) {
      toast.error("Complete the required progress fields", {
        description: "Task completion, engagement, accuracy, and the reason for action are required.",
      })
      return
    }

    addProgressRecord({
      learnerId: learner.id,
      interventionPlanId: selectedPlan.id,
      progressDate: form.progressDate,
      targetSkill: selectedPlan.targetSkill,
      currentScore: Number(form.currentScore) || 0,
      promptingLevel: form.promptingLevel,
      taskCompletion: form.taskCompletion.trim(),
      attentionEngagement: form.attentionEngagement.trim(),
      comprehensionAccuracy: form.comprehensionAccuracy.trim(),
      teacherTherapistNotes: form.teacherTherapistNotes.trim(),
      parentFeedback: form.parentFeedback.trim(),
      recommendedAction: form.recommendedAction,
      reason: form.reason.trim(),
    })

    updateInterventionPlan(selectedPlan.id, {
      status:
        form.recommendedAction === "Continue"
          ? "Active"
          : form.recommendedAction === "Stop"
            ? "Stopped"
            : "Under review",
      notes: form.reason.trim(),
    })

    updateLearner(learner.id, {
      status:
        form.recommendedAction === "Continue"
          ? "Improving"
          : form.recommendedAction === "Stop"
            ? "Stable"
            : "Needs Modified Support",
    })

    updateRecommendation(linkedRecommendation.id, {
      progressStatus:
        form.recommendedAction === "Continue"
          ? "Improving"
          : form.recommendedAction === "Stop"
            ? "Stable"
            : "Needs Modified Support",
      teacherNotes: form.teacherTherapistNotes.trim() || linkedRecommendation.teacherNotes,
    })

    toast.success("Progress update saved", {
      description: `${learner.code} now has an updated intervention monitoring record.`,
    })

    setForm({
      progressDate: new Date().toISOString().slice(0, 10),
      currentScore: String(Number(form.currentScore) || 0),
      promptingLevel: form.promptingLevel,
      taskCompletion: "",
      attentionEngagement: "",
      comprehensionAccuracy: "",
      teacherTherapistNotes: "",
      parentFeedback: "",
      recommendedAction: "Continue",
      reason: "",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Progress Monitoring</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Monitor intervention-plan effectiveness, update learner status, and document follow-up recommendations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Prototype note:</span> {prototypeAssumptionNote}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Select intervention plan</CardTitle>
            <CardDescription>Choose the active or review-stage plan that needs a progress update.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            >
              {interventionPlans.map((plan) => {
                const planLearner = learners.find((entry) => entry.id === plan.learnerId)
                return (
                  <option key={plan.id} value={plan.id}>
                    {(planLearner?.code || "Learner")} · {plan.targetSkill}
                  </option>
                )
              })}
            </select>

            {selectedPlan && learner ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{learner.code}</h3>
                  <Badge variant={selectedPlan.status === "Active" ? "success" : "warning"}>{selectedPlan.status}</Badge>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{selectedPlan.strategy}</p>
                <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Frequency:</span> {selectedPlan.frequency}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Review date:</span> {format(new Date(selectedPlan.reviewDate), "MMM d, yyyy")}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No intervention plan is available yet. Activate a validated recommendation first.
            </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add progress update</CardTitle>
            <CardDescription>Record performance, prompting, attention, and the recommended next action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Progress date">
                <input
                  type="date"
                  value={form.progressDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, progressDate: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                />
              </Field>
              <Field label="Current score or rating">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.currentScore}
                  onChange={(event) => setForm((prev) => ({ ...prev, currentScore: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                />
              </Field>
              <Field label="Prompting level">
                <select
                  value={form.promptingLevel}
                  onChange={(event) => setForm((prev) => ({ ...prev, promptingLevel: event.target.value as PromptLevel }))}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                >
                  {promptingLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Recommended action">
                <select
                  value={form.recommendedAction}
                  onChange={(event) => setForm((prev) => ({ ...prev, recommendedAction: event.target.value as ProgressAction }))}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                >
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Task completion" value={form.taskCompletion} onChange={(value) => setForm((prev) => ({ ...prev, taskCompletion: value }))} />
              <TextField label="Attention or engagement" value={form.attentionEngagement} onChange={(value) => setForm((prev) => ({ ...prev, attentionEngagement: value }))} />
              <TextField label="Comprehension response accuracy" value={form.comprehensionAccuracy} onChange={(value) => setForm((prev) => ({ ...prev, comprehensionAccuracy: value }))} />
              <TextField label="Parent feedback (optional)" value={form.parentFeedback} onChange={(value) => setForm((prev) => ({ ...prev, parentFeedback: value }))} optional />
            </div>

            <TextAreaField
              label="Teacher or therapist notes"
              value={form.teacherTherapistNotes}
              onChange={(value) => setForm((prev) => ({ ...prev, teacherTherapistNotes: value }))}
              optional
            />
            <TextAreaField
              label="Reason for the recommended action"
              value={form.reason}
              onChange={(value) => setForm((prev) => ({ ...prev, reason: value }))}
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
        <ProgressMetric label="Latest score" value={latestRecord ? `${latestRecord.currentScore}/10` : "No data"} tone="default" />
        <ProgressMetric
          label="Change from previous"
          value={previousRecord ? `${scoreDiff >= 0 ? "+" : ""}${scoreDiff}` : "Not enough data"}
          tone={scoreDiff > 0 ? "success" : scoreDiff < 0 ? "warning" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress trend</CardTitle>
          <CardDescription>Visual summary of recorded progress updates for the selected intervention plan.</CardDescription>
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
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
              No progress records are available yet for the selected plan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>
      {children}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
}) {
  return (
    <Field label={`${label}${optional ? " (Optional)" : ""}`}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
    </Field>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
}) {
  return (
    <Field label={`${label}${optional ? " (Optional)" : ""}`}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[110px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
    </Field>
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
