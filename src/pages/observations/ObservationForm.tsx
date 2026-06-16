import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { prototypeAssumptionNote } from "@/src/data";
import { useData } from "@/src/contexts/DataContext";
import { SessionType, PromptLevel } from "@/src/types";
import { analyzeObservation } from "@/src/lib/decisionSupport";

const behaviorOptions = [
  "Attention shifts away from text without prompt",
  "Needs repeated instruction",
  "Completes task after structured modeling",
  "Needs scheduled break during reading",
  "Shows positive engagement when task is visual",
];

const communicationOptions = [
  "Uses oral response",
  "Uses pointing or picture choices",
  "Needs modeled language before responding",
  "Uses AAC / visual support",
  "Responds best with sentence starters",
];

const concernOptions = [
  "Difficulty Identifying Details",
  "Difficulty Understanding Vocabulary",
  "Difficulty Determining Main Idea",
  "Difficulty Sequencing Events",
  "Difficulty Answering Inferential Questions",
  "Requires Frequent Prompts",
  "Attention During Reading",
];

const sessionTypes: SessionType[] = ["Classroom session", "One-on-one intervention", "Therapy coordination", "Home follow-up", "Assessment review", "Other"];
const promptingLevels: PromptLevel[] = ["Independent", "Minimal prompting", "Moderate prompting", "High prompting"];

export function ObservationForm() {
  const navigate = useNavigate();
  const { learners, addObservation } = useData();
  const [selectedLearner, setSelectedLearner] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("Classroom session");
  const [promptingLevel, setPromptingLevel] = useState<PromptLevel>("Moderate prompting");
  const [behaviorIndicators, setBehaviorIndicators] = useState<string[]>([]);
  const [communicationIndicators, setCommunicationIndicators] = useState<string[]>([]);
  const [concernsObserved, setConcernsObserved] = useState<string[]>([]);
  const [strengthsObserved, setStrengthsObserved] = useState("");
  const [learningResponse, setLearningResponse] = useState("");
  const [accommodationsUsed, setAccommodationsUsed] = useState("");
  const [narrative, setNarrative] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const preview = analyzeObservation(
    [...behaviorIndicators, ...communicationIndicators, ...concernsObserved],
    [strengthsObserved, learningResponse, narrative].join(" ")
  );

  const toggleValue = (value: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSave = () => {
    addObservation({
      learnerId: selectedLearner,
      date: new Date().toISOString(),
      sessionType,
      behaviorIndicators,
      communicationIndicators,
      learningResponse: learningResponse.trim(),
      promptingLevel,
      accommodationsUsed: accommodationsUsed.split(",").map((item) => item.trim()).filter(Boolean),
      strengthsObserved: strengthsObserved.split("\n").map((item) => item.trim()).filter(Boolean),
      concernsObserved,
      narrative: narrative.trim(),
      teacherId: "teacher-alvin",
    });
    setIsSaved(true);
    setTimeout(() => navigate("/observations"), 1200);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Teacher / Therapist Observation</h2>
        <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">
          Record structured observation details that support explainable intervention recommendations. Detected tags are editable support indicators, not final judgments.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
        <p>{prototypeAssumptionNote}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observation Record</CardTitle>
          <CardDescription>Use structured fields first, then add the narrative so the system can draft editable support tags.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Target Learner">
              <select value={selectedLearner} onChange={(event) => setSelectedLearner(event.target.value)} className={selectClassName}>
                <option value="">Select learner...</option>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.code} - {learner.gradeLevel}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Context / Session Type">
              <select value={sessionType} onChange={(event) => setSessionType(event.target.value as SessionType)} className={selectClassName}>
                {sessionTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prompting Level">
              <select value={promptingLevel} onChange={(event) => setPromptingLevel(event.target.value as PromptLevel)} className={selectClassName}>
                {promptingLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <SelectionGroup
            title="Behavior / Attention Indicators"
            helper="Select all that apply to the reading task observed."
            options={behaviorOptions}
            values={behaviorIndicators}
            onToggle={(value) => toggleValue(value, behaviorIndicators, setBehaviorIndicators)}
          />

          <SelectionGroup
            title="Communication Indicators"
            helper="Capture how the learner responded during the session."
            options={communicationOptions}
            values={communicationIndicators}
            onToggle={(value) => toggleValue(value, communicationIndicators, setCommunicationIndicators)}
          />

          <SelectionGroup
            title="Concerns Observed"
            helper="These will contribute to editable support tags."
            options={concernOptions}
            values={concernsObserved}
            onToggle={(value) => toggleValue(value, concernsObserved, setConcernsObserved)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Learning Response">
              <Textarea
                value={learningResponse}
                onChange={(event) => setLearningResponse(event.target.value)}
                className="min-h-[110px]"
                placeholder="Describe how the learner responded to tasks, supports, and feedback."
              />
            </Field>
            <Field label="Strengths Observed">
              <Textarea
                value={strengthsObserved}
                onChange={(event) => setStrengthsObserved(event.target.value)}
                className="min-h-[110px]"
                placeholder="One strength per line"
              />
            </Field>
          </div>

          <Field label="Accommodations Used">
            <Textarea
              value={accommodationsUsed}
              onChange={(event) => setAccommodationsUsed(event.target.value)}
              className="min-h-[90px]"
              placeholder="e.g., Visual timer, graphic organizer, oral response option"
            />
          </Field>

          <Field label="Narrative Notes">
            <Textarea
              value={narrative}
              onChange={(event) => setNarrative(event.target.value)}
              className="min-h-[150px]"
              placeholder="Write the full observation note that should inform later recommendation review."
            />
          </Field>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Detected Support Tags Preview</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Editable support indicators generated from the selected fields and narrative.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {preview.nlpTags.length > 0 ? (
                preview.nlpTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">No support tags detected yet.</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>This system summarizes educational observations for decision support only. It must not be used as a diagnostic conclusion or a substitute for expert review.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
          <Button variant="outline" className="mr-3" type="button" onClick={() => navigate("/observations")} disabled={isSaved}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaved || !selectedLearner || !narrative.trim()}
            className={isSaved ? "bg-green-600 text-white hover:bg-green-700" : ""}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={16} className="mr-2" /> Saved
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Save Observation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function SelectionGroup({
  title,
  helper,
  options,
  values,
  onToggle,
}: {
  title: string;
  helper: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => onToggle(option)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
