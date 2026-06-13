import React from "react"
import { useNavigate } from "react-router-dom"
import { Presentation, ChevronRight, BrainCircuit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { useData } from "@/src/contexts/DataContext"
import { format } from "date-fns"

export function RecommendationList() {
  const navigate = useNavigate()
  const { recommendations, learners } = useData()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Intervention Recommendations</h2>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            AI-assisted intervention plans synthesized from reading comprehension assessments and teacher observations. Review, adapt, and approve plans for your learners.
          </p>
        </div>
        <BrainCircuit className="text-blue-500/20 absolute -right-4 -bottom-4 w-40 h-40" />
      </div>

      <div className="grid gap-4">
        {recommendations.length > 0 ? recommendations.map((rec) => {
          const learner = learners.find((l) => l.id === rec.learnerId)
          return (
            <Card key={rec.id} className="hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate(`/recommendations/${rec.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500`}>
                      <Presentation size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        {learner?.code || "Unknown Learner"} 
                        {!rec.reviewedByTeacher && (
                          <Badge variant="warning" className="text-xs">Needs Review</Badge>
                        )}
                        {rec.reviewedByTeacher && (
                          <Badge variant="success" className="text-xs">Approved</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Generated on {format(new Date(rec.date), "MMM d, yyyy")} • Level: <span className="font-medium text-slate-700 dark:text-slate-300">{rec.classifiedSupportLevel}</span>
                      </p>
                      <div className="text-sm mt-3 text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-slate-200">Strategies:</span> {rec.recommendedStrategies.slice(0, 2).join(", ")}
                        {rec.recommendedStrategies.length > 2 && "..."}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                    <ChevronRight />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        }) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <Presentation className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Recommendations Found</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
               Recommendations are generated automatically based on assessment and observation data.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
