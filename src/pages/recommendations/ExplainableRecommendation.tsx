import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShieldAlert, BookOpen, AlertCircle, ArrowLeft, BrainCircuit, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { useData } from "@/src/contexts/DataContext"

export function ExplainableRecommendation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { learners, recommendations } = useData()
  
  const rec = recommendations.find(r => r.id === id) || recommendations[0]
  
  if (!rec) {
    return (
      <div className="p-8 text-center text-slate-500">
        No recommendation found.
      </div>
    )
  }

  const learner = learners.find(l => l.id === rec.learnerId) || learners[0]


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Explainable Decision-Support</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Intervention plan for {learner.code}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Classification Result Panel */}
        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="text-blue-600 dark:text-blue-400" size={20} />
              <CardDescription className="uppercase tracking-wider font-semibold text-blue-900 dark:text-blue-300">AI Classification Result</CardDescription>
            </div>
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-50">
              {rec.classifiedSupportLevel}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">System Confidence</span>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{rec.confidence}%</span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" /> Contributing Assessment Factors
                </h4>
                <ul className="space-y-2">
                  {rec.contributingFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-500" /> NLP Extracted Evidence
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                  {rec.evidence.map((ev, i) => (
                    <li key={i} className="pl-1">{ev}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Panel */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-green-500 shadow-md">
             <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <CardDescription className="uppercase tracking-wider font-semibold text-green-800 dark:text-green-400">IEP-Aligned Strategies</CardDescription>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-50">Recommended Interventions</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="space-y-3">
                 {rec.recommendedStrategies.map((strategy, i) => (
                   <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border border-green-100 dark:border-green-900/40 rounded-lg shadow-sm">
                     <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                     <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{strategy}</span>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5 shadow-sm">
             <div className="flex items-start gap-3">
               <ShieldAlert className="text-amber-600 dark:text-amber-500 shrink-0" size={24} />
               <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Teacher Review Required</h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-1 leading-relaxed">
                    The recommendation is advisory only. AI assists teachers, but educators make the final decisions based on professional judgment.
                  </p>
               </div>
             </div>
             
             <div className="mt-5 pt-4 border-t border-amber-200/50 dark:border-amber-800/50 flex gap-3">
               <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/learners")}>Approve Plan</Button>
               <Button variant="outline" className="w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => navigate("/learners")}>Modify Plan</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
