import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, Plus, Search, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { AssessmentSummaryPanel } from "@/src/components/AssessmentSummaryPanel"
import { useData } from "@/src/contexts/DataContext"

export function AssessmentList() {
  const navigate = useNavigate()
  const { learners, assessments, recommendations } = useData()
  const [query, setQuery] = useState("")
  const [supportFilter, setSupportFilter] = useState("All")

  const rows = useMemo(() => {
    return assessments
      .map((assessment) => {
        const learner = learners.find(l => l.id === assessment.learnerId)
        const recommendation = recommendations.find(r => r.assessmentId === assessment.id)
        return { assessment, learner, recommendation }
      })
      .filter(({ assessment, learner, recommendation }) => {
        const haystack = `${learner?.code || ""} ${assessment.summary} ${assessment.lowestDomains.join(" ")} ${recommendation?.classifiedSupportLevel || ""}`.toLowerCase()
        const matchesQuery = haystack.includes(query.toLowerCase())
        const matchesSupport = supportFilter === "All" || recommendation?.classifiedSupportLevel === supportFilter || learner?.supportNeeds === supportFilter
        return matchesQuery && matchesSupport
      })
      .sort((a, b) => new Date(b.assessment.date).getTime() - new Date(a.assessment.date).getTime())
  }, [assessments, learners, query, recommendations, supportFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Academic Reading Assessment Summaries</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review reading-comprehension profiles, contextual task indicators, and teacher-overridden support estimates.</p>
        </div>
        <Button onClick={() => navigate("/assessments/new")} className="gap-2">
          <Plus size={16} /> New Assessment
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learner code, source, support estimate, or concern..."
              className="pl-9"
            />
          </div>
          <select
            value={supportFilter}
            onChange={(e) => setSupportFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="All">All support levels</option>
            <option value="Low Support Need">Low Support Need</option>
            <option value="Moderate Support Need">Moderate Support Need</option>
            <option value="High Support Need">High Support Need</option>
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rows.map(({ assessment, learner, recommendation }) => (
          <Card key={assessment.id} className="hover:border-blue-300 dark:hover:border-blue-800">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{learner?.code || "Unknown Learner"}</h3>
                      {recommendation && <Badge variant={recommendation.classifiedSupportLevel.includes("High") ? "destructive" : recommendation.classifiedSupportLevel.includes("Moderate") ? "warning" : "success"}>{recommendation.classifiedSupportLevel}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(assessment.date), "MMM d, yyyy")} | {assessment.source} | {assessment.responseMode}
                    </p>
                    <div className="mt-3 max-w-4xl">
                      <AssessmentSummaryPanel
                        summary={assessment.summary}
                        totalScore={assessment.totalScore}
                        percentage={assessment.percentage}
                        lowestDomains={assessment.lowestDomains}
                        compact
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assessment.concernTags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                      {assessment.overrideSupportNeedEstimate && <Badge variant="warning">Teacher override: {assessment.overrideSupportNeedEstimate}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {learner && <Button variant="outline" size="sm" onClick={() => navigate(`/learners/${learner.id}`)}>Learner</Button>}
                  {recommendation && <Button size="sm" onClick={() => navigate(`/recommendations/${recommendation.id}`)}>Explanation</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <TrendingUp className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <CardTitle>No assessments found</CardTitle>
              <CardDescription className="mt-2">Record an adapted reading assessment to begin classification and recommendation generation.</CardDescription>
              <Button className="mt-4" onClick={() => navigate("/assessments/new")}>New Assessment</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
