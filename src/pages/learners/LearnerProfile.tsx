import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, FileText, ClipboardList, AlertCircle, CheckCircle, Clock, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { format } from "date-fns"
import { useData } from "@/src/contexts/DataContext"

export function LearnerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { learners, assessments, observations, recommendations } = useData()
  const learner = learners.find(l => l.id === id) || learners[0]
  const rec = recommendations.find(r => r.learnerId === learner.id)

  const timelineEvents = [
    ...assessments.filter(a => a.learnerId === learner.id).map(a => ({
      title: "Reading Comprehension Assessment",
      dateObj: new Date(a.date),
      date: format(new Date(a.date), "MMM d, yyyy"),
      type: "Assessment",
      icon: ClipboardList,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      id: a.id,
      link: "/assessments"
    })),
    ...observations.filter(o => o.learnerId === learner.id).map(o => ({
      title: "Teacher Observation Recorded",
      dateObj: new Date(o.date),
      date: format(new Date(o.date), "MMM d, yyyy"),
      type: "Observation",
      icon: Eye,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      id: o.id,
      link: "/observations"
    })),
    ...recommendations.filter(r => r.learnerId === learner.id).map(r => ({
      title: "Generated Intervention Recommendation",
      dateObj: new Date(r.date),
      date: format(new Date(r.date), "MMM d, yyyy"),
      type: "Recommendation",
      icon: AlertCircle,
      color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      id: r.id,
      link: `/recommendations/${r.id}`
    }))
  ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Learner: {learner.code}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{learner.gradeLevel} • {learner.age} yrs • IEP Active</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/learners/${learner.id}/edit`)}>
            <Edit size={16} className="mr-2" /> Edit
          </Button>
          <Button onClick={() => navigate("/assessments/new")}>
            <FileText size={16} className="mr-2" /> New Assessment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Current Support Level</p>
                <div className="flex items-center gap-2">
                  <Badge variant={learner.supportNeeds.includes("High") ? "destructive" : "warning"}>
                    {learner.supportNeeds}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Reading Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {learner.readingConcerns.map(c => (
                    <Badge key={c} variant="outline" className="bg-slate-50 dark:bg-slate-800">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Accommodations</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  {learner.accommodations.map(a => (
                    <li key={a} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">IEP Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {learner.iepGoals.map(goal => (
                <div key={goal} className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-100">
                  {goal}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & Actions */}
        <div className="md:col-span-2 space-y-6">
          {rec && (
            <Card className="border-l-4 border-l-blue-600 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                      <LightbulbIcon className="text-blue-600 dark:text-blue-500" /> Active Recommendation
                    </CardTitle>
                    <CardDescription className="mt-1">Generated {format(new Date(rec.date), "MMM d, yyyy")}</CardDescription>
                  </div>
                  {!rec.reviewedByTeacher && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <AlertCircle size={12} /> Pending Review
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {rec.recommendedStrategies.map(s => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/recommendations/${rec.id}`)}>
                  View Full Explanation
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle>Intervention Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {timelineEvents.length > 0 ? timelineEvents.map((event, i) => (
                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`p-2 rounded-full ${event.color}`}>
                      <event.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{event.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.type} • {event.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(event.link)}>View</Button>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500">
                    No timeline events found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LightbulbIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}
