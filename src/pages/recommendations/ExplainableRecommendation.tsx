import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FolderCheck,
  MessageSquarePlus,
  PencilLine,
  ShieldAlert,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Textarea } from "@/src/components/ui/textarea"
import { AssessmentSummaryPanel } from "@/src/components/AssessmentSummaryPanel"
import { prototypeAssumptionNote } from "@/src/data"
import { useData } from "@/src/contexts/DataContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { PromptLevel, Recommendation, ReviewerRole, ValidationRecord, ValidationStatus } from "@/src/types"

const reviewerRoles: ReviewerRole[] = [
  "SNED Teacher",
  "Reading Teacher",
  "Reading Coordinator",
  "School Administrator",
  "Therapist",
  "SPED Coordinator",
  "External Specialist",
  "Parent/Guardian",
]

export function ExplainableRecommendation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    learners,
    recommendations,
    assessments,
    observations,
    interventionPlans,
    updateRecommendation,
    addInterventionPlan,
  } = useData()
  const { user } = useAuth()

  const rec = recommendations.find((entry) => entry.id === id) || recommendations[0]
  const learner = learners.find((entry) => entry.id === rec?.learnerId)
  const assessment = assessments.find((entry) => entry.id === rec?.assessmentId)
  const observation = observations.find((entry) => entry.id === rec?.observationId)
  const linkedPlan = interventionPlans.find((plan) => plan.recommendationId === rec?.id)

  const [reviewerRole, setReviewerRole] = useState<ReviewerRole>(user?.role || "SNED Teacher")
  const [reviewNotes, setReviewNotes] = useState("")
  const [planDuration, setPlanDuration] = useState("20 minutes per session")
  const [planResponsiblePerson, setPlanResponsiblePerson] = useState(user?.name || "Assigned specialist")
  const [planReviewDate, setPlanReviewDate] = useState(defaultReviewDate())

  useEffect(() => {
    if (!rec) return
    setReviewNotes(rec.validationNotes || rec.teacherNotes || "")
    setReviewerRole(user?.role || "SNED Teacher")
  }, [rec, user?.role])

  const activeDataConsidered = useMemo(() => {
    const values = [...rec?.dataConsidered || []]
    if (learner?.consentStatus) values.push(`Consent status: ${learner.consentStatus}`)
    if (learner?.dataAccessSensitivity) values.push(`Access sensitivity: ${learner.dataAccessSensitivity}`)
    return values
  }, [learner?.consentStatus, learner?.dataAccessSensitivity, rec?.dataConsidered])

  if (!rec || !learner) {
    return <div className="p-8 text-center text-slate-500">No recommendation found.</div>
  }

  const saveValidation = (status: ValidationStatus, options?: { requireNote?: boolean; parentConfirmation?: "Pending" | "Confirmed" | "Not required" }) => {
    const trimmedNotes = reviewNotes.trim()
    if (options?.requireNote && !trimmedNotes) {
      toast.error("Validation note required", {
        description: "Please add a short explanation before saving this validation action.",
      })
      return
    }

    const record: ValidationRecord = {
      id: `VR-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`,
      recommendationId: rec.id,
      status,
      reviewerName: user?.name || "Assigned reviewer",
      reviewerRole,
      reviewDate: new Date().toISOString().slice(0, 10),
      notes:
        trimmedNotes ||
        (status === "For expert review"
          ? "Recommendation draft submitted for expert validation."
          : status === "Expert approved"
            ? "Recommendation approved after expert review."
            : status === "Expert revised"
              ? "Recommendation revised after expert review."
              : status === "Expert rejected"
                ? "Recommendation rejected pending follow-up review."
                : status === "For parent confirmation"
                  ? "Recommendation endorsed for parent or guardian confirmation."
                  : status === "Parent confirmed"
                    ? "Parent or guardian confirmed the recommendation."
                    : status === "Completed/Stopped"
                      ? "Recommendation was closed after implementation review."
                      : "Validation record saved."),
      requiresParentConfirmation: status !== "Expert rejected",
    }

    updateRecommendation(rec.id, {
      validationStatus: status,
      teacherReviewStatus:
        status === "Expert approved" || status === "Parent confirmed" || status === "Active intervention"
          ? "Approved"
          : status === "Expert rejected" || status === "Expert revised"
            ? "Needs Revision"
            : "Pending Review",
      teacherNotes: record.notes,
      validationNotes: record.notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name || "Assigned reviewer",
      reviewedByTeacher: ["Expert approved", "Parent confirmed", "Active intervention"].includes(status),
      parentGuardianConfirmationStatus: options?.parentConfirmation || rec.parentGuardianConfirmationStatus,
      validationRecords: [...rec.validationRecords, record],
    })

    toast.success("Validation saved", {
      description: `${status} has been recorded for ${learner.code}.`,
    })
  }

  const activatePlan = () => {
    if (linkedPlan) {
      toast.message("Intervention plan already exists", {
        description: "This recommendation is already linked to an intervention plan.",
      })
      return
    }

    addInterventionPlan({
      learnerId: learner.id,
      recommendationId: rec.id,
      targetSkill: rec.targetConcern,
      strategy: rec.recommendedStrategies[0] || "Teacher-selected intervention strategy",
      linkedGoal: rec.linkedGoal,
      frequency: rec.editableFrequency,
      duration: planDuration,
      materials: rec.editableMaterials,
      responsiblePerson: planResponsiblePerson,
      startDate: new Date().toISOString().slice(0, 10),
      reviewDate: planReviewDate,
      status: "Active",
      notes: reviewNotes.trim() || "Activated after expert review and required family validation.",
    })

    saveValidation("Active intervention", { parentConfirmation: "Confirmed" })
  }

  const canActivatePlan =
    !linkedPlan &&
    (
      rec.validationStatus === "Parent confirmed" ||
      (!rec.requiresParentConfirmation && ["Expert approved", "Expert revised"].includes(rec.validationStatus))
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Explainable Recommendation Review</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Validation and intervention planning record for {learner.code}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-100">
        ReadAssist-SNED is a decision-support and documentation system. It summarizes existing educational evidence and
        suggests explainable interventions, but final decisions remain under expert review, parent confirmation when
        required, and teacher professional judgment.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Prototype note:</span> {prototypeAssumptionNote}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-xl text-slate-900 dark:text-slate-50">{rec.targetConcern}</CardTitle>
                <ValidationBadge status={rec.validationStatus} />
                <Badge variant="outline">{rec.classifiedSupportLevel}</Badge>
              </div>
              <CardDescription>
                Generated on {format(new Date(rec.date), "MMM d, yyyy")} from the latest learner assessment and observation pair.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label="Linked IEP-aligned goal" value={rec.linkedGoal || "Goal not yet linked"} />
                <InfoBlock label="Suggested frequency" value={rec.editableFrequency} />
                <InfoBlock label="Parent confirmation" value={rec.parentGuardianConfirmationStatus} />
                <InfoBlock label="Current confidence" value={`${rec.confidence}%`} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Suggested interventions</p>
                <div className="mt-3 space-y-3">
                  {rec.recommendedStrategies.map((strategy) => (
                    <div
                      key={strategy}
                      className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50/70 p-3 dark:border-green-900/40 dark:bg-green-900/10"
                    >
                      <CheckCircle2 className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" size={18} />
                      <span className="text-sm font-medium leading-7 text-slate-900 dark:text-slate-100">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ListSection title="Materials and supports needed" items={rec.editableMaterials} />
                <ListSection title="Data considered" items={activeDataConsidered} />
              </div>

              {rec.cautionNotes ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-100">
                  <span className="font-semibold">Implementation note:</span> {rec.cautionNotes}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
                <BookOpen size={18} className="text-blue-600" /> Supporting Evidence
              </CardTitle>
              <CardDescription>Transparent rationale used before any expert or parent validation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {assessment ? (
                <AssessmentSummaryPanel
                  summary={assessment.summary}
                  totalScore={assessment.totalScore}
                  percentage={assessment.percentage}
                  lowestDomains={assessment.lowestDomains}
                />
              ) : null}

              <div className="grid gap-4 lg:grid-cols-2">
                <ListSection title="Contributing assessment and planning factors" items={rec.contributingFactors} icon={AlertCircle} />
                <ListSection title="Detected support tags" items={rec.nlpDifficultyTags} icon={MessageSquarePlus} chipList />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ListSection title="Evidence extracted from records" items={rec.evidence} />
                <ListSection title="Reasoning process" items={rec.reasoningSteps} numbered />
              </div>

              {observation ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Observation summary</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{observation.narrative}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <InfoBlock label="Session type" value={observation.sessionType} />
                    <InfoBlock label="Prompting level" value={observation.promptingLevel} />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
                <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" /> Validation Workflow
              </CardTitle>
              <CardDescription>
                Save reviewer decisions as the recommendation moves through expert validation and parent confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Reviewed by role</label>
                  <select
                    value={reviewerRole}
                    onChange={(event) => setReviewerRole(event.target.value as ReviewerRole)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  >
                    {reviewerRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <InfoBlock label="Current validation state" value={rec.validationStatus} />
              </div>

              <div className="space-y-2">
                <label htmlFor="review-notes" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Validation notes
                </label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Document the review reason, revisions requested, parent conference note, or activation note."
                  className="min-h-[120px] bg-white dark:bg-slate-950"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notes are stored as part of the recommendation validation record and appear in reports.
                </p>
              </div>

              <div className="grid gap-3">
                <Button variant="outline" onClick={() => saveValidation("For expert review")}>
                  <ClipboardCheck size={16} className="mr-2" /> Submit for Expert Review
                </Button>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button onClick={() => saveValidation("Expert approved", { requireNote: true })}>
                    <FileCheck2 size={16} className="mr-2" /> Expert Approve
                  </Button>
                  <Button variant="outline" onClick={() => saveValidation("Expert revised", { requireNote: true })}>
                    <PencilLine size={16} className="mr-2" /> Record Expert Revision
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" onClick={() => saveValidation("For parent confirmation", { requireNote: true, parentConfirmation: "Pending" })}>
                    <UserCheck size={16} className="mr-2" /> Request Parent Confirmation
                  </Button>
                  <Button variant="outline" onClick={() => saveValidation("Parent confirmed", { requireNote: true, parentConfirmation: "Confirmed" })}>
                    <FolderCheck size={16} className="mr-2" /> Confirm Parent Validation
                  </Button>
                </div>
                <Button variant="destructive" onClick={() => saveValidation("Expert rejected", { requireNote: true, parentConfirmation: "Pending" })}>
                  <AlertCircle size={16} className="mr-2" /> Reject Recommendation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-slate-900 dark:text-slate-50">Intervention Plan Activation</CardTitle>
              <CardDescription>
                Convert a validated recommendation into an active intervention plan after expert and parent review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label="Target skill" value={rec.targetConcern} />
                <InfoBlock label="Linked goal" value={rec.linkedGoal || "Goal not yet linked"} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label="Session duration"
                  value={planDuration}
                  onChange={setPlanDuration}
                  placeholder="20 minutes per session"
                />
                <LabeledInput
                  label="Responsible person"
                  value={planResponsiblePerson}
                  onChange={setPlanResponsiblePerson}
                  placeholder="Assigned teacher or specialist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Review date</label>
                <input
                  type="date"
                  value={planReviewDate}
                  onChange={(event) => setPlanReviewDate(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>
              {linkedPlan ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-900 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-100">
                  <span className="font-semibold">Existing linked plan:</span> {linkedPlan.strategy} · {linkedPlan.status} ·
                  review on {format(new Date(linkedPlan.reviewDate), "MMM d, yyyy")}
                </div>
              ) : null}
              <Button
                className="w-full"
                disabled={!canActivatePlan}
                onClick={activatePlan}
              >
                <FolderCheck size={16} className="mr-2" /> Activate Intervention Plan
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Activation is available only after expert validation and, when required, parent or guardian confirmation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-50">Validation history</CardTitle>
              <CardDescription>Review records are appended and retained for reporting and audit-style tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              {rec.validationRecords.length > 0 ? (
                <div className="space-y-3">
                  {[...rec.validationRecords]
                    .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
                    .map((record) => (
                      <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-wrap items-center gap-2">
                          <ValidationBadge status={record.status} />
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{record.reviewerName}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{record.reviewerRole}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{record.notes}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(record.reviewDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No validation entries yet. Save the first review action to start the recommendation approval trail.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function defaultReviewDate() {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium leading-7 text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  )
}

function ListSection({
  title,
  items,
  icon: Icon,
  chipList = false,
  numbered = false,
}: {
  title: string
  items: string[]
  icon?: React.ComponentType<{ size?: number; className?: string }>
  chipList?: boolean
  numbered?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={16} className="text-blue-600 dark:text-blue-400" /> : null}
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      </div>
      {items.length > 0 ? (
        chipList ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        ) : numbered ? (
          <ol className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No items recorded.</p>
      )}
    </div>
  )
}

function ValidationBadge({ status }: { status: ValidationStatus | string }) {
  if (["Expert approved", "Parent confirmed", "Active intervention"].includes(status)) {
    return <Badge variant="success">{status}</Badge>
  }
  if (status === "Expert rejected" || status === "Completed/Stopped") {
    return <Badge variant="destructive">{status}</Badge>
  }
  return <Badge variant="warning">{status}</Badge>
}
