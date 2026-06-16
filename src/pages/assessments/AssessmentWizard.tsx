import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Calculator, Check, CheckCircle2, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { AssessmentSummaryPanel } from "@/src/components/AssessmentSummaryPanel";
import { prototypeAssumptionNote } from "@/src/data";
import { useData } from "@/src/contexts/DataContext";
import { AssessmentSource, ResponseMode, SupportLevel } from "@/src/types";
import { buildAssessmentSummary } from "@/src/lib/decisionSupport";

const assessmentSources: AssessmentSource[] = [
  "Academic Assessment",
  "SPED activity",
  "Teacher-administered reading task",
  "Therapy session",
  "Dev Ped report summary",
];

const responseModes: ResponseMode[] = ["Oral", "Written", "Pointing", "AAC", "Assisted"];
const supportLevels: SupportLevel[] = ["Low Support Need", "Moderate Support Need", "High Support Need"];

export function AssessmentWizard() {
  const navigate = useNavigate();
  const { learners, addAssessment } = useData();
  const [step, setStep] = useState(1);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [scores, setScores] = useState({
    literal: 0,
    inferential: 0,
    vocabulary: 0,
    sequencing: 0,
    mainIdea: 0,
    followingInstructions: 0,
    attentionDuringReading: 0,
    promptingNeeded: 0,
  });
  const [responseMode, setResponseMode] = useState<ResponseMode>("Oral");
  const [source, setSource] = useState<AssessmentSource>("Teacher-administered reading task");
  const [accommodationsUsed, setAccommodationsUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [overrideSupportNeedEstimate, setOverrideSupportNeedEstimate] = useState<SupportLevel | "">("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const assessmentSummary = buildAssessmentSummary({
    literalScore: Number(scores.literal) || 0,
    inferentialScore: Number(scores.inferential) || 0,
    vocabularyScore: Number(scores.vocabulary) || 0,
    sequencingScore: Number(scores.sequencing) || 0,
    mainIdeaScore: Number(scores.mainIdea) || 0,
    followingInstructionsScore: Number(scores.followingInstructions) || 0,
    attentionDuringReadingScore: Number(scores.attentionDuringReading) || 0,
    promptingNeededScore: Number(scores.promptingNeeded) || 0,
  });

  const totalScore = assessmentSummary.totalScore;
  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleNumberInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Tab", "Enter", "Escape"];
    if (event.ctrlKey || event.metaKey) return;
    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      toast.error("Invalid Input", {
        description: "Please enter numbers only. Letters and special characters are not accepted.",
      });
    }
  };

  const handleNumberInputPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = event.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault();
      toast.error("Invalid Input", {
        description: "Please enter numbers only. Letters and special characters are not accepted.",
      });
    }
  };

  const handleSave = () => {
    addAssessment({
      learnerId: selectedLearner,
      date: new Date().toISOString(),
      literalScore: Number(scores.literal) || 0,
      inferentialScore: Number(scores.inferential) || 0,
      vocabularyScore: Number(scores.vocabulary) || 0,
      sequencingScore: Number(scores.sequencing) || 0,
      mainIdeaScore: Number(scores.mainIdea) || 0,
      followingInstructionsScore: Number(scores.followingInstructions) || 0,
      attentionDuringReadingScore: Number(scores.attentionDuringReading) || 0,
      promptingNeededScore: Number(scores.promptingNeeded) || 0,
      responseMode,
      accommodationsUsed: accommodationsUsed.split(",").map((item) => item.trim()).filter(Boolean),
      source,
      notes,
      overrideSupportNeedEstimate: overrideSupportNeedEstimate || undefined,
      overrideReason: overrideReason.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => navigate("/assessments"), 1200);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Academic Reading Assessment Summary</h2>
        <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">
          Record academic reading indicators and contextual task performance for decision support. This is not a Dev Ped assessment.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
        <p>{prototypeAssumptionNote}</p>
      </div>

      <div className="relative mb-8 flex items-center justify-between">
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-600 transition-all dark:bg-blue-500" style={{ width: `${(step - 1) * 50}%` }} />
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white font-bold shadow-sm dark:border-slate-950 ${
              step >= item ? "bg-blue-600 text-white dark:bg-blue-500" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {step > item ? <Check size={16} /> : item}
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Step 1: Session Context</CardTitle>
              <CardDescription>Select the learner and describe how this reading summary was gathered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Learner">
                <select value={selectedLearner} onChange={(event) => setSelectedLearner(event.target.value)} className={selectClassName}>
                  <option value="">Select a learner...</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.code} - {learner.gradeLevel}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Assessment Source">
                  <select value={source} onChange={(event) => setSource(event.target.value as AssessmentSource)} className={selectClassName}>
                    {assessmentSources.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Response Mode">
                  <select value={responseMode} onChange={(event) => setResponseMode(event.target.value as ResponseMode)} className={selectClassName}>
                    {responseModes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Accommodations Used">
                <Input
                  value={accommodationsUsed}
                  onChange={(event) => setAccommodationsUsed(event.target.value)}
                  placeholder="e.g., Graphic organizer, visual timer, oral response option"
                />
              </Field>
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
              <CardTitle>Step 2: Reading and Task Indicators</CardTitle>
              <CardDescription>Use 0 to 10 ratings. Reading comprehension domains contribute to the total score; task indicators guide support-need interpretation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { id: "literal", label: "Literal Comprehension", helper: "0 = unable, 10 = independent" },
                  { id: "inferential", label: "Inferential Comprehension", helper: "0 = unable, 10 = independent" },
                  { id: "vocabulary", label: "Vocabulary", helper: "0 = unable, 10 = independent" },
                  { id: "sequencing", label: "Sequencing", helper: "0 = unable, 10 = independent" },
                  { id: "mainIdea", label: "Main Idea", helper: "0 = unable, 10 = independent" },
                  { id: "followingInstructions", label: "Following Instructions", helper: "Support indicator" },
                  { id: "attentionDuringReading", label: "Attention During Reading Task", helper: "Support indicator" },
                  { id: "promptingNeeded", label: "Prompting Needed", helper: "Higher score means more adult support was needed" },
                ].map((field) => (
                  <div key={field.id}>
                    <Field label={field.label} helper={field.helper}>
                      <Input
                        id={field.id}
                        type="number"
                        min="0"
                        max="10"
                        value={scores[field.id as keyof typeof scores] || ""}
                        onChange={(event) =>
                          setScores((prev) => ({
                            ...prev,
                            [field.id]: Math.min(10, Math.max(0, Number(event.target.value) || 0)),
                          }))
                        }
                        onKeyDown={handleNumberInputKeyDown}
                        onPaste={handleNumberInputPaste}
                      />
                    </Field>
                  </div>
                ))}
              </div>

              <Field label="Assessment Notes">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-[120px]"
                  placeholder="Record reading behaviors, supports used, and anything the team should know before validating recommendations."
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handlePrev}>
                Back
              </Button>
              <Button onClick={handleNext} className="gap-2">
                <Calculator size={16} /> Compute Summary
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Step 3: Review Computed Summary</CardTitle>
              <CardDescription>Check the generated support estimate, concern tags, and any teacher override before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6 dark:border-blue-900/60 dark:bg-blue-950/30">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Reading Comprehension Total</p>
                <div className="mt-1 text-4xl font-bold text-blue-950 dark:text-blue-50">
                  {totalScore} <span className="text-lg text-blue-600/70 dark:text-blue-300/70">/ 50</span>
                </div>
                <p className="mt-2 text-sm text-blue-900 dark:text-blue-100">{assessmentSummary.percentage}% overall reading summary level</p>
              </div>

              <AssessmentSummaryPanel
                summary={assessmentSummary.summary}
                totalScore={assessmentSummary.totalScore}
                percentage={assessmentSummary.percentage}
                lowestDomains={assessmentSummary.lowestDomains}
              />

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Detected Reading Concern Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assessmentSummary.concernTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {tag}
                    </span>
                  ))}
                  {assessmentSummary.concernTags.length === 0 && <span className="text-sm text-slate-500 dark:text-slate-400">No concern tags detected.</span>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Computed Support Need Estimate">
                  <Input value={assessmentSummary.supportNeedEstimate} readOnly className="bg-slate-50 dark:bg-slate-950/70" />
                </Field>
                <Field label="Teacher / Specialist Override">
                  <select value={overrideSupportNeedEstimate} onChange={(event) => setOverrideSupportNeedEstimate(event.target.value as SupportLevel | "")} className={selectClassName}>
                    <option value="">Keep computed estimate</option>
                    {supportLevels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {overrideSupportNeedEstimate && (
                <Field label="Reason for Override">
                  <Textarea
                    value={overrideReason}
                    onChange={(event) => setOverrideReason(event.target.value)}
                    className="min-h-[100px]"
                    placeholder="Explain why professional judgment suggests a different support level than the computed estimate."
                  />
                </Field>
              )}

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>The computed support estimate is advisory only and should remain editable by the teacher or specialist before recommendation validation.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button variant="outline" onClick={handlePrev} disabled={isSaved}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaved} className="gap-2 bg-green-600 text-white hover:bg-green-700">
                {isSaved ? (
                  <>
                    <CheckCircle2 size={16} /> Saved
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Reading Summary
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
