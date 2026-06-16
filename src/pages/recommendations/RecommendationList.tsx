import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Lightbulb, ShieldCheck, Workflow } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { prototypeAssumptionNote } from "@/src/data"
import { useData } from "@/src/contexts/DataContext"

export function RecommendationList() {
  const navigate = useNavigate()
  const { recommendations, learners, interventionPlans } = useData()

  const pendingValidationCount = recommendations.filter((rec) =>
    ["Draft recommendation", "For expert review", "For parent confirmation"].includes(rec.validationStatus)
  ).length
  const approvedCount = recommendations.filter((rec) =>
    ["Expert approved", "Expert revised", "Parent confirmed", "Active intervention"].includes(rec.validationStatus)
  ).length
  const activePlanCount = interventionPlans.filter((plan) => plan.status === "Active").length

  const sortedRecommendations = [...recommendations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4 p-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300">
              <Lightbulb size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Intervention Recommendations</h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                System suggestions are built from academic reading assessment summaries, teacher or therapist observations,
                learner goals, accommodations, and authorized support records. Every recommendation remains a draft until
                validated by the appropriate expert reviewer and, when required, confirmed with the parent or guardian.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-100">
                <ShieldCheck size={15} /> Validation required before classroom use
              </p>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Workflow size={15} /> Draft → Expert review → Parent confirmation → Intervention plan
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/50 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Prototype Positioning</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{prototypeAssumptionNote}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Generated drafts" value={recommendations.length} tone="default" />
        <MetricCard label="Pending validation" value={pendingValidationCount} tone="warning" />
        <MetricCard label="Active intervention plans" value={activePlanCount || approvedCount} tone="success" />
      </div>

      <div className="grid gap-4">
        {sortedRecommendations.length > 0 ? (
          sortedRecommendations.map((rec) => {
            const learner = learners.find((entry) => entry.id === rec.learnerId)
            const linkedPlan = interventionPlans.find((plan) => plan.recommendationId === rec.id)

            return (
              <Card
                key={rec.id}
                className="cursor-pointer border-slate-200 transition-colors hover:border-blue-400 dark:border-slate-800"
                onClick={() => navigate(`/recommendations/${rec.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        <Lightbulb size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                            {learner?.code || "Unknown Learner"}
                          </h3>
                          <ValidationBadge status={rec.validationStatus} />
                          {linkedPlan ? <Badge variant="success">Plan {linkedPlan.status}</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Generated on {format(new Date(rec.date), "MMM d, yyyy")} · Support estimate{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">{rec.classifiedSupportLevel}</span>
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                          <p>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Target concern:</span> {rec.targetConcern}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Suggested frequency:</span> {rec.editableFrequency}
                          </p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">Suggested interventions:</span>{" "}
                          {rec.recommendedStrategies.slice(0, 3).join(", ")}
                          {rec.recommendedStrategies.length > 3 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-slate-400 hover:text-blue-600"
                      aria-label={`Open recommendation for ${learner?.code || "learner"}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(`/recommendations/${rec.id}`)
                      }}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No recommendations generated yet</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
              Generate an academic reading assessment summary and a structured observation for the same learner to create
              an explainable recommendation draft.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "default" | "warning" | "success"
}) {
  const toneClass =
    tone === "success"
      ? "text-green-600 dark:text-green-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-950 dark:text-slate-50"

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function ValidationBadge({ status }: { status: string }) {
  if (["Expert approved", "Parent confirmed", "Active intervention"].includes(status)) {
    return <Badge variant="success">{status}</Badge>
  }
  if (status === "Expert rejected") {
    return <Badge variant="destructive">{status}</Badge>
  }
  return <Badge variant="warning">{status}</Badge>
}
