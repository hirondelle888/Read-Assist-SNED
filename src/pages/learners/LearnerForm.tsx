import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Save, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { useData } from "@/src/contexts/DataContext"
import { SupportLevel } from "@/src/types"

export function LearnerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { learners, addLearner, updateLearner } = useData()
  const isEdit = Boolean(id) && id !== "new"
  const [isSaved, setIsSaved] = useState(false)
  
  const [formData, setFormData] = useState({
    code: "",
    gradeLevel: "",
    age: "",
    gender: "Male",
    readingConcerns: "",
    supportNeeds: "Low Support Need" as SupportLevel,
    accommodations: "",
    iepGoals: "",
    status: "Stable" as "Stable" | "Improving" | "Needs Modified Support"
  })

  useEffect(() => {
    if (isEdit && id) {
      const learner = learners.find(l => l.id === id)
      if (learner) {
        setFormData({
          code: learner.code,
          gradeLevel: learner.gradeLevel,
          age: learner.age.toString(),
          gender: learner.gender,
          readingConcerns: learner.readingConcerns.join(", "),
          supportNeeds: learner.supportNeeds,
          accommodations: learner.accommodations.join(", "),
          iepGoals: learner.iepGoals.join("\n"),
          status: learner.status
        })
      }
    }
  }, [id, isEdit, learners])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const parsedData = {
      code: formData.code,
      gradeLevel: formData.gradeLevel,
      age: parseInt(formData.age) || 0,
      gender: formData.gender as any,
      readingConcerns: formData.readingConcerns.split(",").map(s => s.trim()).filter(Boolean),
      supportNeeds: formData.supportNeeds,
      accommodations: formData.accommodations.split(",").map(s => s.trim()).filter(Boolean),
      iepGoals: formData.iepGoals.split("\n").map(s => s.trim()).filter(Boolean),
      status: formData.status
    }

    if (isEdit && id) {
      updateLearner(id, parsedData)
    } else {
      addLearner(parsedData)
    }

    setIsSaved(true)
    setTimeout(() => {
      navigate("/learners")
    }, 1500)
  }

  return (
    <div className="space-y-6 relative">
      {isSaved && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={20} />
            <p className="font-medium">Learner saved successfully!</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} disabled={isSaved}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isEdit ? "Edit Learner" : "Add New Learner"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isEdit ? "Update learner information and IEP goals." : "Enter details for a new learner requiring reading support."}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Learner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Learner Code</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g., RA-2026-004" disabled={isSaved} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <select id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required disabled={isSaved} className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <option value="">Select Grade</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" min="4" max="18" value={formData.age} onChange={handleChange} onKeyDown={handleNumberInputKeyDown} onPaste={handleNumberInputPaste} required disabled={isSaved} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} disabled={isSaved} className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readingConcerns">Reading Concerns (comma separated)</Label>
              <Input id="readingConcerns" name="readingConcerns" value={formData.readingConcerns} onChange={handleChange} placeholder="e.g., Vocabulary, Sequencing" disabled={isSaved} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accommodations">Accommodations (comma separated)</Label>
              <Input id="accommodations" name="accommodations" value={formData.accommodations} onChange={handleChange} placeholder="e.g., Large Print, Extended Time" disabled={isSaved} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iepGoals">IEP Goals (one per line)</Label>
              <Textarea id="iepGoals" name="iepGoals" value={formData.iepGoals} onChange={handleChange} placeholder="Enter IEP goals..." className="min-h-[100px]" disabled={isSaved} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportNeeds">Support Needs</Label>
                <select id="supportNeeds" name="supportNeeds" value={formData.supportNeeds} onChange={handleChange} disabled={isSaved} className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <option value="Low Support Need">Low Support Need</option>
                  <option value="Moderate Support Need">Moderate Support Need</option>
                  <option value="High Support Need">High Support Need</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={isSaved} className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <option value="Stable">Stable</option>
                  <option value="Improving">Improving</option>
                  <option value="Needs Modified Support">Needs Modified Support</option>
                </select>
              </div>
            </div>

          </CardContent>
          <CardFooter className="justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button variant="outline" className="mr-3" type="button" onClick={() => navigate(-1)} disabled={isSaved}>Cancel</Button>
            <Button type="submit" disabled={isSaved}>
              {isSaved ? "Saved!" : <><Save size={16} className="mr-2" /> Save Learner</>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
