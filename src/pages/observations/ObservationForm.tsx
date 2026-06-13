import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { useData } from "@/src/contexts/DataContext"

export function ObservationForm() {
  const navigate = useNavigate()
  const { learners, addObservation } = useData()
  const [selectedLearner, setSelectedLearner] = useState("")
  const [narrative, setNarrative] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [indicators, setIndicators] = useState<Record<string, boolean>>({
    i1: false, i2: false, i3: false, i4: false
  })

  const toggleIndicator = (id: string) => {
    setIndicators(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = () => {
    addObservation({
      learnerId: selectedLearner,
      date: new Date().toISOString(),
      indicators: Object.keys(indicators).filter(k => indicators[k]),
      narrative,
      teacherId: "teacher-alvin"
    })
    setIsSaved(true)
    setTimeout(() => {
      navigate("/learners")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Teacher Observation</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record qualitative reading behaviors to aid AI classification.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observation Record</CardTitle>
          <CardDescription>Select difficulty indicators and provide a narrative.</CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="learner" className="text-base">Target Learner</Label>
              <select 
                value={selectedLearner}
                onChange={e => setSelectedLearner(e.target.value)}
                className="flex h-10 w-full max-w-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">Select a learner...</option>
                {learners.map(l => (
                  <option key={l.id} value={l.id}>{l.code}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base text-slate-900 dark:text-slate-100">Difficulty Indicators</Label>
                <span className="text-xs text-slate-500 dark:text-slate-400">Select all that apply</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: "i1", label: "Difficulty Identifying Details" },
                  { id: "i2", label: "Difficulty Understanding Vocabulary" },
                  { id: "i3", label: "Difficulty Determining Main Idea" },
                  { id: "i4", label: "Difficulty Sequencing Events" },
                  { id: "i5", label: "Difficulty Answering Inferential Questions" },
                  { id: "i6", label: "Requires Frequent Prompts" }
                ].map(indicator => (
                  <label key={indicator.id} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={indicators[indicator.id] || false}
                      onChange={() => toggleIndicator(indicator.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:ring-blue-500 focus:ring-offset-slate-950" 
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{indicator.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="narrative" className="text-base">Narrative Observation</Label>
              <Textarea 
                id="narrative" 
                value={narrative}
                onChange={e => setNarrative(e.target.value)}
                placeholder="Describe the learner's reading behaviors, challenges, and support needs in detail..." 
                className="min-h-[150px] resize-y"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end">
                <span>{narrative.length}/500 characters</span>
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                <strong>Important:</strong> These observations will be processed by the Natural Language Processing module to extract difficulty tags for the decision-support system.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button variant="outline" className="mr-3" type="button" onClick={() => navigate("/dashboard")} disabled={isSaved}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isSaved || !selectedLearner} className={isSaved ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
              {isSaved ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</> : <><Save size={16} className="mr-2" /> Submit Observation</>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
