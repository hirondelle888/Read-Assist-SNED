import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronRight, Calculator, Save, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useData } from "@/src/contexts/DataContext"

export function AssessmentWizard() {
  const navigate = useNavigate()
  const { learners, addAssessment } = useData()
  const [step, setStep] = useState(1)
  const [selectedLearner, setSelectedLearner] = useState("")
  const [scores, setScores] = useState({
    literal: 0,
    inferential: 0,
    vocabulary: 0,
    sequencing: 0,
    mainIdea: 0
  })
  const [isSaved, setIsSaved] = useState(false)

  const totalScore = Object.values(scores).reduce<number>((a, b) => a + (Number(b) || 0), 0)

  const handleNext = () => setStep(step + 1)
  const handlePrev = () => setStep(step - 1)
  
  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Tab', 'Enter', 'Escape'];
    if (e.ctrlKey || e.metaKey) return;

    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      toast.error("Invalid Input", {
        description: "Please enter numbers only. Letters and special characters are not accepted.",
      });
    }
  }

  const handleNumberInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) {
      e.preventDefault();
      toast.error("Invalid Input", {
        description: "Please enter numbers only. Letters and special characters are not accepted.",
      });
    }
  }

  const handleSave = () => {
    addAssessment({
      learnerId: selectedLearner,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      literalScore: Number(scores.literal) || 0,
      inferentialScore: Number(scores.inferential) || 0,
      vocabularyScore: Number(scores.vocabulary) || 0,
      sequencingScore: Number(scores.sequencing) || 0,
      mainIdeaScore: Number(scores.mainIdea) || 0,
      totalScore,
      notes: ""
    })
    setIsSaved(true)
    setTimeout(() => {
      navigate("/learners")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Adapted Reading Assessment</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record comprehension scores to update learner profiles.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 rounded-full transition-all" style={{ width: `${(step - 1) * 50}%` }}></div>
        
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white dark:border-slate-950 shadow-sm relative z-10 ${step >= s ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {step > s ? <Check size={16} /> : s}
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Step 1: Select Learner</CardTitle>
              <CardDescription>Choose the learner for this assessment session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="learner">Learner Code</Label>
                <select 
                  id="learner"
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  value={selectedLearner}
                  onChange={(e) => setSelectedLearner(e.target.value)}
                >
                  <option value="">Select a learner...</option>
                  {learners.map(l => (
                    <option key={l.id} value={l.id}>{l.code} - {l.gradeLevel}</option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleNext} disabled={!selectedLearner}>
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-50">Step 2: Assessment Input</CardTitle>
              <CardDescription>Enter the scores for each adapted reading component (Max 10 per category).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { id: "literal", label: "Literal Comprehension" },
                  { id: "inferential", label: "Inferential Questions" },
                  { id: "vocabulary", label: "Vocabulary" },
                  { id: "sequencing", label: "Sequencing" },
                  { id: "mainIdea", label: "Main Idea" },
                ].map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input 
                      id={field.id} 
                      type="number" 
                      min="0" max="10" 
                      value={scores[field.id as keyof typeof scores] || ""}
                      onChange={(e) => setScores({...scores, [field.id]: e.target.value})}
                      onKeyDown={handleNumberInputKeyDown}
                      onPaste={handleNumberInputPaste}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handlePrev}>Back</Button>
              <Button onClick={handleNext} className="gap-2">
                <Calculator size={16} /> Compute Summary
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Step 3: Assessment Summary</CardTitle>
              <CardDescription>Review the computed results before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-6 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">Total Adapted Score</p>
                <div className="text-4xl font-bold text-blue-900 dark:text-blue-50">{totalScore} <span className="text-lg text-blue-600/70 dark:text-blue-400/70">/ 50</span></div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-50 border-b pb-2">Score Breakdown</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Literal:</span> <span className="font-medium text-slate-900 dark:text-slate-50">{scores.literal}/10</span></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Inferential:</span> <span className="font-medium text-slate-900 dark:text-slate-50">{scores.inferential}/10</span></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Vocabulary:</span> <span className="font-medium text-slate-900 dark:text-slate-50">{scores.vocabulary}/10</span></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Sequencing:</span> <span className="font-medium text-slate-900 dark:text-slate-50">{scores.sequencing}/10</span></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Main Idea:</span> <span className="font-medium text-slate-900 dark:text-slate-50">{scores.mainIdea}/10</span></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={handlePrev} disabled={isSaved}>Back</Button>
              <Button onClick={handleSave} disabled={isSaved} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                {isSaved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Record</>}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
