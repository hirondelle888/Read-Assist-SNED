import React from "react"
import { useNavigate } from "react-router-dom"
import { CalendarClock, FolderCheck, Users } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { prototypeAssumptionNote } from "@/src/data"
import { useData } from "@/src/contexts/DataContext"

export function InterventionPlans() {
  const navigate = useNavigate()
  const { interventionPlans, learners, recommendations } = useData()

  const sortedPlans = [...interventionPlans].sort(
    (a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Intervention Plans</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Validated recommendations converted into active, reviewable intervention plans.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Prototype note:</span> {prototypeAssumptionNote}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total plans" value={interventionPlans.length} />
        <SummaryCard label="Active plans" value={interventionPlans.filter((plan) => plan.status === "Active").length} />
        <SummaryCard
          label="Reviews due this month"
          value={interventionPlans.filter((plan) => new Date(plan.reviewDate) <= addDays(21)).length}
        />
      </div>

      <div className="grid gap-4">
        {sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => {
            const learner = learners.find((entry) => entry.id === plan.learnerId)
            const recommendation = recommendations.find((entry) => entry.id === plan.recommendationId)

            return (
              <Card key={plan.id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                          {learner?.code || "Unknown learner"} · {plan.targetSkill}
                        </h3>
                        <Badge variant={plan.status === "Active" ? "success" : plan.status === "Under review" ? "warning" : "outline"}>
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.strategy}</p>
                      <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Frequency:</span> {plan.frequency}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Duration:</span> {plan.duration}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Responsible person:</span> {plan.responsiblePerson}</p>
                        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Review date:</span> {format(new Date(plan.reviewDate), "MMM d, yyyy")}</p>
                      </div>
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Materials:</span> {plan.materials.join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3">
                      <Button onClick={() => navigate(`/recommendations/${plan.recommendationId}`)}>
                        <FolderCheck size={16} className="mr-2" /> Open validation record
                      </Button>
                      {recommendation ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                          Recommendation status: <span className="font-semibold text-slate-900 dark:text-slate-100">{recommendation.validationStatus}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <FolderCheck className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">No intervention plans yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Activate a recommendation after expert validation and parent confirmation to create the implementation plan for progress monitoring.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-950 dark:text-slate-50">{value}</div>
      </CardContent>
    </Card>
  )
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
