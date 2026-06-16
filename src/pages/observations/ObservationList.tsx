import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Plus, Search, Tags } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useData } from "@/src/contexts/DataContext"

export function ObservationList() {
  const navigate = useNavigate()
  const { learners, observations, recommendations } = useData()
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    return observations
      .map((observation) => {
        const learner = learners.find(l => l.id === observation.learnerId)
        const recommendation = recommendations.find(r => r.observationId === observation.id)
        return { observation, learner, recommendation }
      })
      .filter(({ observation, learner }) => {
        const haystack = `${learner?.code || ""} ${observation.sessionType} ${observation.behaviorIndicators.join(" ")} ${observation.communicationIndicators.join(" ")} ${observation.concernsObserved.join(" ")} ${observation.nlpTags.join(" ")} ${observation.narrative}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      })
      .sort((a, b) => new Date(b.observation.date).getTime() - new Date(a.observation.date).getTime())
  }, [learners, observations, query, recommendations])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Observation Records</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review structured classroom, therapy, and intervention observations with editable support tags.</p>
        </div>
        <Button onClick={() => navigate("/observations/new")} className="gap-2">
          <Plus size={16} /> New Observation
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search learner code, session type, support tags, or narrative..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rows.map(({ observation, learner, recommendation }) => (
          <Card key={observation.id} className="hover:border-blue-300 dark:hover:border-blue-800">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Eye size={22} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{learner?.code || "Unknown Learner"}</h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{format(new Date(observation.date), "MMM d, yyyy")} | {observation.sessionType}</span>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-300">{observation.learningResponse || observation.narrative}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {observation.nlpTags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                      {observation.nlpTags.length === 0 && <Badge variant="secondary">No NLP tags extracted</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {learner && <Button variant="outline" size="sm" onClick={() => navigate(`/learners/${learner.id}`)}>Learner</Button>}
                  {recommendation && <Button size="sm" onClick={() => navigate(`/recommendations/${recommendation.id}`)}>Recommendation</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <Tags className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <CardTitle>No observations found</CardTitle>
              <CardDescription className="mt-2">Add a structured teacher or therapist observation to support support-tag detection and recommendation review.</CardDescription>
              <Button className="mt-4" onClick={() => navigate("/observations/new")}>New Observation</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
