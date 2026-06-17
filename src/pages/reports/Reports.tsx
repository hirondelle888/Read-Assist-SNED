import React, { useMemo, useState } from "react"
import { FileDown, FileText, Printer, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { AssessmentSummaryPanel } from "@/src/components/AssessmentSummaryPanel"
import { confidentialityNotice, prototypeAssumptionNote } from "@/src/data"
import { useData } from "@/src/contexts/DataContext"
import { getProgressScore } from "@/src/lib/progressScoring"

type ReportType =
  | "Learner Profile Summary"
  | "External Report Summary"
  | "Reading Assessment Summary"
  | "Observation Summary"
  | "Recommendation Rationale"
  | "Expert and Parent Validation Record"
  | "Active Intervention Plan"
  | "Progress Monitoring Summary"

const reportTypes: ReportType[] = [
  "Learner Profile Summary",
  "External Report Summary",
  "Reading Assessment Summary",
  "Observation Summary",
  "Recommendation Rationale",
  "Expert and Parent Validation Record",
  "Active Intervention Plan",
  "Progress Monitoring Summary",
]

export function Reports() {
  const {
    learners,
    assessments,
    observations,
    recommendations,
    externalReports,
    interventionPlans,
    progressRecords,
  } = useData()
  const [selectedLearnerId, setSelectedLearnerId] = useState(learners[0]?.id || "")
  const [reportType, setReportType] = useState<ReportType>("Learner Profile Summary")
  const [exportStatus, setExportStatus] = useState("")

  const learner = learners.find((entry) => entry.id === selectedLearnerId) || learners[0]
  const learnerAssessments = useMemo(() => assessments.filter((entry) => entry.learnerId === learner?.id), [assessments, learner?.id])
  const learnerObservations = useMemo(() => observations.filter((entry) => entry.learnerId === learner?.id), [learner?.id, observations])
  const learnerRecommendations = useMemo(() => recommendations.filter((entry) => entry.learnerId === learner?.id), [learner?.id, recommendations])
  const learnerReports = useMemo(() => externalReports.filter((entry) => entry.learnerId === learner?.id), [externalReports, learner?.id])
  const learnerPlans = useMemo(() => interventionPlans.filter((entry) => entry.learnerId === learner?.id), [interventionPlans, learner?.id])
  const learnerProgress = useMemo(() => progressRecords.filter((entry) => entry.learnerId === learner?.id), [learner?.id, progressRecords])

  const latestAssessment = [...learnerAssessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const latestObservation = [...learnerObservations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const latestRecommendation = [...learnerRecommendations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const latestPlan = [...learnerPlans].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  const latestProgress = [...learnerProgress].sort((a, b) => new Date(b.progressDate).getTime() - new Date(a.progressDate).getTime())[0]

  const handleGeneratePdf = () => {
    const report = buildPdfReport({
      reportType,
      learner,
      learnerAssessments,
      learnerObservations,
      learnerRecommendations,
      learnerReports,
      learnerPlans,
      learnerProgress,
      latestAssessment,
      latestObservation,
      latestRecommendation,
      latestPlan,
      latestProgress,
    })
    const blob = createProfessionalPdf(report)
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = report.filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setExportStatus(`Generated ${report.filename}`)
    setTimeout(() => setExportStatus(""), 3000)
  }

  if (!learner) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports</h2>
        <Card>
          <CardContent className="p-8 text-center text-slate-500">Add a learner before generating reports.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Generate teacher and specialist support documentation across the full learner support workflow.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 print:hidden">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Prototype note:</span> {prototypeAssumptionNote}
      </div>

      <Card className="print:hidden">
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="learner" className="text-sm font-medium text-slate-700 dark:text-slate-300">Learner</label>
            <select
              id="learner"
              value={selectedLearnerId}
              onChange={(event) => setSelectedLearnerId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {learners.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.code}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="reportType" className="text-sm font-medium text-slate-700 dark:text-slate-300">Report Type</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Printer size={14} className="mr-2" /> Print
            </Button>
            <Button className="flex-1" onClick={handleGeneratePdf}>
              <FileDown size={14} className="mr-2" /> Generate PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {exportStatus ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200 print:hidden">
          {exportStatus}
        </div>
      ) : null}

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <FileText size={20} />
                <span className="text-sm font-semibold">ReadAssist-SNED</span>
              </div>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-50">{reportType}</CardTitle>
              <CardDescription>Generated {format(new Date(), "MMM d, yyyy")} for learner code {learner.code}</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <ShieldCheck size={12} /> Teacher and specialist support documentation
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <section className="grid gap-4 md:grid-cols-4">
            <SummaryItem label="Learner Code" value={learner.code} />
            <SummaryItem label="Grade Level" value={learner.gradeLevel} />
            <SummaryItem label="Consent Status" value={learner.consentStatus} />
            <SummaryItem label="Access Sensitivity" value={learner.dataAccessSensitivity} />
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-100">
            <span className="font-semibold">Confidentiality notice:</span> {confidentialityNotice}
          </section>

          {(reportType === "Learner Profile Summary" || reportType === "Reading Assessment Summary") && latestAssessment ? (
            <section>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Academic Reading Assessment Summary</h3>
              <div className="mt-3">
                <AssessmentSummaryPanel
                  summary={latestAssessment.summary}
                  totalScore={latestAssessment.totalScore}
                  percentage={latestAssessment.percentage}
                  lowestDomains={latestAssessment.lowestDomains}
                />
              </div>
            </section>
          ) : null}

          {reportType === "Learner Profile Summary" ? (
            <SectionBlock title="Authorized history summary">
              <div className="grid gap-3 md:grid-cols-2">
                <HistorySummaryBox title="Medical History" entry={learner.historySummary.medicalHistory} />
                <HistorySummaryBox title="Developmental History" entry={learner.historySummary.developmentalHistory} />
                <HistorySummaryBox title="Family History" entry={learner.historySummary.familyHistory} />
                <HistorySummaryBox title="Academic History" entry={learner.historySummary.academicHistory} />
                <HistorySummaryBox title="OT / ST / ABA / SPED Report Summary" entry={learner.historySummary.relatedServiceHistory} className="md:col-span-2" />
              </div>
            </SectionBlock>
          ) : null}

          {(reportType === "Learner Profile Summary" || reportType === "External Report Summary") && (
            <SectionBlock title="External report summaries">
              {learnerReports.length > 0 ? (
                learnerReports.map((report) => (
                  <div key={report.id}>
                    <RecordBox
                    title={`${report.reportType} · ${report.authorizedForUse ? "Authorized" : "Restricted"}`}
                    subtitle={`${report.source} · ${format(new Date(report.reportDate), "MMM d, yyyy")}`}
                    body={report.keyFindingsSummary}
                    footer={`Existing recommendations: ${report.existingRecommendations.join(", ") || "None recorded"}`}
                    />
                  </div>
                ))
              ) : (
                <EmptyText text="No external report summaries recorded." />
              )}
            </SectionBlock>
          )}

          {(reportType === "Learner Profile Summary" || reportType === "Observation Summary") && (
            <SectionBlock title="Observation summaries">
              {learnerObservations.length > 0 ? (
                [...learnerObservations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((observation) => (
                  <div key={observation.id}>
                    <RecordBox
                    title={`${observation.sessionType} · ${observation.promptingLevel}`}
                    subtitle={format(new Date(observation.date), "MMM d, yyyy")}
                    body={observation.narrative}
                    footer={`Tags: ${observation.nlpTags.join(", ") || "None recorded"}`}
                    />
                  </div>
                ))
              ) : (
                <EmptyText text="No observation summaries recorded." />
              )}
            </SectionBlock>
          )}

          {(reportType === "Learner Profile Summary" || reportType === "Recommendation Rationale") && (
            <SectionBlock title="Recommendation rationale">
              {latestRecommendation ? (
                <div className="space-y-3">
                  <SummaryItem label="Validation status" value={latestRecommendation.validationStatus} />
                  <SummaryItem label="Target concern" value={latestRecommendation.targetConcern} />
                  <SummaryItem label="Suggested frequency" value={latestRecommendation.editableFrequency} />
                  <ListBlock title="Recommended interventions" items={latestRecommendation.recommendedStrategies} />
                  <ListBlock title="Evidence used" items={latestRecommendation.evidence} />
                  <ListBlock title="Reasoning steps" items={latestRecommendation.reasoningSteps} />
                </div>
              ) : (
                <EmptyText text="No recommendation record available." />
              )}
            </SectionBlock>
          )}

          {reportType === "Expert and Parent Validation Record" && (
            <SectionBlock title="Validation history">
              {latestRecommendation?.validationRecords.length ? (
                [...latestRecommendation.validationRecords].sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()).map((record) => (
                  <div key={record.id}>
                    <RecordBox
                    title={`${record.status} · ${record.reviewerRole}`}
                    subtitle={`${record.reviewerName} · ${format(new Date(record.reviewDate), "MMM d, yyyy")}`}
                    body={record.notes}
                    />
                  </div>
                ))
              ) : (
                <EmptyText text="No validation history recorded yet." />
              )}
            </SectionBlock>
          )}

          {reportType === "Active Intervention Plan" && (
            <SectionBlock title="Active intervention plan">
              {latestPlan ? (
                <div className="space-y-3">
                  <SummaryItem label="Target skill" value={latestPlan.targetSkill} />
                  <SummaryItem label="Strategy" value={latestPlan.strategy} />
                  <SummaryItem label="Frequency" value={latestPlan.frequency} />
                  <SummaryItem label="Duration" value={latestPlan.duration} />
                  <SummaryItem label="Responsible person" value={latestPlan.responsiblePerson} />
                  <SummaryItem label="Review date" value={format(new Date(latestPlan.reviewDate), "MMM d, yyyy")} />
                  <ListBlock title="Materials" items={latestPlan.materials} />
                </div>
              ) : (
                <EmptyText text="No active intervention plan recorded." />
              )}
            </SectionBlock>
          )}

          {reportType === "Progress Monitoring Summary" && (
            <SectionBlock title="Progress monitoring summary">
              {latestProgress ? (
                <div className="space-y-3">
                  <SummaryItem label="Latest target skill" value={latestProgress.targetSkill} />
                  <SummaryItem label="Computed progress score" value={`${getProgressScore(latestProgress)}/10`} />
                  <SummaryItem label="Comprehension accuracy" value={`${latestProgress.correctResponses}/${latestProgress.totalItems} (${latestProgress.computedAccuracy}%)`} />
                  <SummaryItem label="Response mode" value={latestProgress.responseMode} />
                  <SummaryItem label="Final action" value={latestProgress.finalAction} />
                  <SummaryItem label="Score change" value={formatScoreChange(latestProgress.scoreChangeFromPrevious)} />
                  <SummaryItem label="Prompting level" value={latestProgress.promptingLevel} />
                  <RecordBox
                    title="Progress notes"
                    subtitle={format(new Date(latestProgress.progressDate), "MMM d, yyyy")}
                    body={latestProgress.teacherTherapistNotes || latestProgress.finalActionReason}
                    footer={`Activity/material: ${latestProgress.activityMaterialUsed} - System suggestion: ${latestProgress.systemSuggestedAction} - Engagement: ${latestProgress.attentionEngagement}`}
                  />
                </div>
              ) : (
                <EmptyText text="No progress records available." />
              )}
            </SectionBlock>
          )}

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-100">
            This report is teacher or specialist support documentation. It does not function as a medical report, a diagnosis document, or a replacement for expert judgment.
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">None recorded.</p>
      )}
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function RecordBox({
  title,
  subtitle,
  body,
  footer,
}: {
  title: string
  subtitle: string
  body: string
  footer?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
      {footer ? <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{footer}</p> : null}
    </div>
  )
}

function EmptyText({ text }: { text: string }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
}

function HistorySummaryBox({
  title,
  entry,
  className = "",
}: {
  title: string
  entry: {
    availability: string
    source: string
    useInRecommendation: string
    shortSummary: string
  }
  className?: string
}) {
  const restricted = ["Not authorized", "Not disclosed"].includes(entry.availability)
  return (
    <div className={`rounded-xl border p-4 ${restricted ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800"} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <Badge variant="warning">Context only</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={restricted ? "destructive" : entry.availability === "Available" ? "success" : entry.availability === "For follow-up" ? "warning" : "outline"}>
          {entry.availability}
        </Badge>
        <Badge variant="outline">{entry.source}</Badge>
        <Badge variant={entry.useInRecommendation === "Yes" ? "success" : entry.useInRecommendation === "Restricted" ? "warning" : "outline"}>
          Use: {entry.useInRecommendation}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {restricted ? "Restricted or undisclosed summary. Only limited authorized context should appear here." : entry.shortSummary || "No authorized summary recorded."}
      </p>
    </div>
  )
}

function formatScoreChange(value: number | null | undefined) {
  if (value === null || value === undefined) return "Baseline record"
  return `${value >= 0 ? "+" : ""}${value} from previous`
}

type PdfReportInput = {
  reportType: ReportType
  learner: NonNullable<ReturnType<typeof useData>["learners"][number]>
  learnerAssessments: ReturnType<typeof useData>["assessments"]
  learnerObservations: ReturnType<typeof useData>["observations"]
  learnerRecommendations: ReturnType<typeof useData>["recommendations"]
  learnerReports: ReturnType<typeof useData>["externalReports"]
  learnerPlans: ReturnType<typeof useData>["interventionPlans"]
  learnerProgress: ReturnType<typeof useData>["progressRecords"]
  latestAssessment: ReturnType<typeof useData>["assessments"][number] | undefined
  latestObservation: ReturnType<typeof useData>["observations"][number] | undefined
  latestRecommendation: ReturnType<typeof useData>["recommendations"][number] | undefined
  latestPlan: ReturnType<typeof useData>["interventionPlans"][number] | undefined
  latestProgress: ReturnType<typeof useData>["progressRecords"][number] | undefined
}

type PdfReport = {
  title: string
  filename: string
  generatedAt: string
  learnerCode: string
  summaryItems: Array<{ label: string; value: string }>
  advisory: string
  sections: Array<{
    title: string
    paragraphs?: string[]
    rows?: Array<{ label: string; value: string }>
    bullets?: string[]
  }>
}

function buildPdfReport(input: PdfReportInput) {
  const {
    reportType,
    learner,
    learnerAssessments,
    learnerObservations,
    learnerRecommendations,
    learnerReports,
    learnerPlans,
    learnerProgress,
    latestAssessment,
    latestObservation,
    latestRecommendation,
    latestPlan,
    latestProgress,
  } = input

  const generatedAt = format(new Date(), "MMM d, yyyy h:mm a")
  const filename = `ReadAssist-SNED_${learner.code}_${reportType.replace(/\s+/g, "-")}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  const title = `ReadAssist-SNED ${reportType}`
  const sections: PdfReport["sections"] = [
    {
      title: "Learner Support Profile",
      rows: [
        { label: "Display record", value: learner.privacyMode === "Anonymized Record" ? learner.anonymizedId : learner.displayName },
        { label: "Grade level", value: learner.gradeLevel },
        { label: "Diagnosis status", value: learner.diagnosisStatus },
        { label: "Current support need", value: learner.supportNeeds },
        { label: "Consent status", value: learner.consentStatus },
      ],
    },
  ]

  sections.push({
    title: "Authorized History Summary",
    bullets: [
      formatHistoryForPdf("Medical history", learner.historySummary.medicalHistory),
      formatHistoryForPdf("Developmental history", learner.historySummary.developmentalHistory),
      formatHistoryForPdf("Family history", learner.historySummary.familyHistory),
      formatHistoryForPdf("Academic history", learner.historySummary.academicHistory),
      formatHistoryForPdf("OT / ST / ABA / SPED report summary", learner.historySummary.relatedServiceHistory),
    ],
  })

  if (latestAssessment) {
    sections.push({
      title: "Academic Reading Assessment Summary",
      rows: [
        { label: "Latest score", value: `${latestAssessment.totalScore}/50 (${latestAssessment.percentage}%)` },
        { label: "Support estimate", value: latestAssessment.overrideSupportNeedEstimate || latestAssessment.supportNeedEstimate },
        { label: "Priority domains", value: latestAssessment.lowestDomains.join("; ") || "None flagged" },
        { label: "Assessment source", value: latestAssessment.source },
      ],
      paragraphs: [latestAssessment.summary],
    })
  }

  if (learnerReports.length > 0) {
    sections.push({
      title: "External Report Summary",
      bullets: learnerReports.map(
        (report) =>
          `${report.reportType} - ${report.source} (${format(new Date(report.reportDate), "MMM d, yyyy")}): ${report.keyFindingsSummary}`
      ),
    })
  }

  if (latestObservation) {
    sections.push({
      title: "Observation Summary",
      rows: [
        { label: "Session type", value: latestObservation.sessionType },
        { label: "Prompting level", value: latestObservation.promptingLevel },
      ],
      paragraphs: [latestObservation.narrative],
      bullets: latestObservation.nlpTags,
    })
  }

  if (latestRecommendation) {
    sections.push({
      title: "Recommendation Rationale",
      rows: [
        { label: "Target concern", value: latestRecommendation.targetConcern },
        { label: "Validation status", value: latestRecommendation.validationStatus },
        { label: "Parent confirmation", value: latestRecommendation.parentGuardianConfirmationStatus },
        { label: "Suggested frequency", value: latestRecommendation.editableFrequency },
      ],
      bullets: latestRecommendation.recommendedStrategies,
    })
    sections.push({
      title: "Validation Record",
      bullets:
        latestRecommendation.validationRecords.map(
          (record) => `${record.status} - ${record.reviewerName} (${record.reviewerRole}) on ${record.reviewDate}: ${record.notes}`
        ) || ["No validation records available."],
    })
  }

  if (latestPlan) {
    sections.push({
      title: "Active Intervention Plan",
      rows: [
        { label: "Target skill", value: latestPlan.targetSkill },
        { label: "Strategy", value: latestPlan.strategy },
        { label: "Frequency", value: latestPlan.frequency },
        { label: "Duration", value: latestPlan.duration },
        { label: "Responsible person", value: latestPlan.responsiblePerson },
      ],
      bullets: latestPlan.materials,
    })
  }

  if (latestProgress) {
    sections.push({
      title: "Progress Monitoring Summary",
      rows: [
        { label: "Computed progress score", value: `${getProgressScore(latestProgress)}/10` },
        { label: "Comprehension accuracy", value: `${latestProgress.correctResponses}/${latestProgress.totalItems} (${latestProgress.computedAccuracy}%)` },
        { label: "Score change from previous", value: formatScoreChange(latestProgress.scoreChangeFromPrevious) },
        { label: "Response mode", value: latestProgress.responseMode },
        { label: "Prompting level", value: latestProgress.promptingLevel },
        { label: "Task completion", value: latestProgress.taskCompletion },
        { label: "Attention / engagement", value: latestProgress.attentionEngagement },
        { label: "System suggested action", value: latestProgress.systemSuggestedAction },
        { label: "Teacher final action", value: latestProgress.finalAction },
      ],
      paragraphs: [latestProgress.systemSuggestionReason, latestProgress.finalActionReason, latestProgress.teacherTherapistNotes].filter(Boolean),
    })
  }

  sections.push({
    title: "Record Counts",
    rows: [
      { label: "Assessments", value: String(learnerAssessments.length) },
      { label: "Observations", value: String(learnerObservations.length) },
      { label: "Recommendations", value: String(learnerRecommendations.length) },
      { label: "External reports", value: String(learnerReports.length) },
      { label: "Intervention plans", value: String(learnerPlans.length) },
      { label: "Progress updates", value: String(learnerProgress.length) },
    ],
    paragraphs: [prototypeAssumptionNote],
  })

  return {
    title,
    filename,
    generatedAt,
    learnerCode: learner.code,
    summaryItems: [
      { label: "Learner Code", value: learner.code },
      { label: "Grade Level", value: learner.gradeLevel },
      { label: "Consent Status", value: learner.consentStatus },
      { label: "Support Need", value: latestRecommendation?.classifiedSupportLevel || learner.supportNeeds },
    ],
    advisory:
      "This report is teacher or specialist support documentation. It does not diagnose disabilities, prescribe clinical action, or replace professional judgment.",
    sections,
  }
}

function createProfessionalPdf(report: PdfReport) {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 42
  const contentWidth = pageWidth - margin * 2
  const bottom = 58
  const pages: string[][] = [[]]
  let y = 700

  const current = () => pages[pages.length - 1]
  const add = (command: string) => current().push(command)
  const newPage = () => {
    pages.push([])
    y = 700
    drawPageHeader()
  }
  const ensureSpace = (height: number) => {
    if (y - height < bottom) newPage()
  }
  const text = (value: string, x: number, baseline: number, size = 10, bold = false, color = "#0f172a") => {
    add(`BT ${pdfColor(color)} rg /${bold ? "F2" : "F1"} ${size} Tf ${x} ${baseline} Td (${escapePdfText(cleanPdfText(value))}) Tj ET`)
  }
  const rect = (x: number, ry: number, w: number, h: number, fill = "#ffffff", stroke?: string) => {
    add(`q ${pdfColor(fill)} rg ${stroke ? `${pdfColor(stroke)} RG 1 w` : ""} ${x} ${ry} ${w} ${h} re ${stroke ? "B" : "f"} Q`)
  }
  const line = (x1: number, y1: number, x2: number, y2: number, color = "#e2e8f0") => {
    add(`q ${pdfColor(color)} RG 1 w ${x1} ${y1} m ${x2} ${y2} l S Q`)
  }
  const circle = (cx: number, cy: number, r: number, fill = "#2563eb") => {
    const c = 0.5522847498 * r
    add(`q ${pdfColor(fill)} rg ${cx + r} ${cy} m ${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c ${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c ${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c ${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c f Q`)
  }
  const writeWrapped = (value: string, x: number, width: number, size = 10, bold = false, color = "#334155", leading = 13) => {
    const wrapped = wrapLine(cleanPdfText(value), Math.max(20, Math.floor(width / (size * 0.52))))
    ensureSpace(wrapped.length * leading + 4)
    wrapped.forEach((part) => {
      text(part, x, y, size, bold, color)
      y -= leading
    })
  }
  const drawWrappedAt = (value: string, x: number, baseline: number, width: number, size = 10, bold = false, color = "#334155", leading = 12) => {
    const wrapped = wrapLine(cleanPdfText(value), Math.max(20, Math.floor(width / (size * 0.52))))
    wrapped.slice(0, 2).forEach((part, index) => {
      text(part, x, baseline - index * leading, size, bold, color)
    })
  }
  const drawTableRow = (label: string, value: string) => {
    const labelWidth = 148
    const valueX = margin + labelWidth + 16
    const valueWidth = contentWidth - labelWidth - 28
    const valueLines = wrapLine(cleanPdfText(value), Math.max(24, Math.floor(valueWidth / (9 * 0.52))))
    const rowHeight = Math.max(34, valueLines.length * 12 + 18)
    ensureSpace(rowHeight + 3)
    const rowTop = y
    const rowBottom = y - rowHeight
    rect(margin, rowBottom, contentWidth, rowHeight, "#ffffff", "#dbe3ef")
    line(margin + labelWidth, rowBottom, margin + labelWidth, rowTop, "#e2e8f0")
    text(label, margin + 10, rowBottom + rowHeight / 2 - 3, 8, true, "#334155")
    valueLines.forEach((part, index) => {
      text(part, valueX, rowBottom + rowHeight - 16 - index * 12, 9, false, "#0f172a")
    })
    y -= rowHeight + 6
  }
  const sectionTitle = (title: string) => {
    ensureSpace(34)
    rect(margin, y - 19, contentWidth, 23, "#eff6ff")
    rect(margin, y - 19, 4, 23, "#2563eb")
    text(title, margin + 12, y - 3, 11, true, "#1e3a8a")
    y -= 34
  }
  const drawPageHeader = () => {
    rect(0, 742, pageWidth, 50, "#1d4ed8")
    text("ReadAssist-SNED", margin, 770, 15, true, "#ffffff")
    text("Teacher and Specialist Support Documentation", margin, 754, 9, false, "#dbeafe")
  }

  drawPageHeader()
  text(report.title, margin, y, 18, true, "#0f172a")
  text(`Generated ${report.generatedAt}`, margin, y - 18, 10, false, "#475569")
  text(`Learner ${report.learnerCode}`, pageWidth - margin - 118, y - 3, 10, true, "#1d4ed8")
  y -= 52

  const cardGap = 10
  const cardWidth = (contentWidth - cardGap) / 2
  const cardRows = Math.ceil(report.summaryItems.length / 2)
  ensureSpace(cardRows * 64 + 18)
  report.summaryItems.forEach((item, index) => {
    const x = margin + (index % 2) * (cardWidth + cardGap)
    const cardY = y - Math.floor(index / 2) * 64
    rect(x, cardY - 48, cardWidth, 52, "#f8fafc", "#cbd5e1")
    text(item.label.toUpperCase(), x + 12, cardY - 15, 7, true, "#64748b")
    drawWrappedAt(item.value, x + 12, cardY - 32, cardWidth - 24, 11, true, "#0f172a", 12)
  })
  y -= cardRows * 64 + 8

  ensureSpace(58)
  rect(margin, y - 45, contentWidth, 48, "#fffbeb", "#f59e0b")
  text("Educational Advisory", margin + 14, y - 14, 10, true, "#92400e")
  y -= 28
  writeWrapped(report.advisory, margin + 14, contentWidth - 28, 9, false, "#78350f", 12)
  y -= 16

  report.sections.forEach((section) => {
    sectionTitle(section.title)
    section.paragraphs?.forEach((paragraph) => {
      writeWrapped(paragraph, margin, contentWidth, 10, false, "#334155")
      y -= 5
    })
    section.rows?.forEach((row) => {
      drawTableRow(row.label, row.value)
    })
    section.bullets?.forEach((item) => {
      const wrapped = wrapLine(cleanPdfText(item), 86)
      ensureSpace(wrapped.length * 12 + 6)
      circle(margin + 7, y - 3, 2.2, "#2563eb")
      wrapped.forEach((part, index) => {
        text(part, margin + 18, y - index * 12, 9, false, "#334155")
      })
      y -= wrapped.length * 12 + 6
    })
    y -= 8
  })

  pages.forEach((commands, index) => {
    commands.push(`q ${pdfColor("#cbd5e1")} RG 1 w ${margin} 44 m ${pageWidth - margin} 44 l S Q`)
    commands.push(`BT ${pdfColor("#64748b")} rg /F1 8 Tf ${margin} 28 Td (ReadAssist-SNED - Confidential teacher/specialist support document) Tj ET`)
    commands.push(`BT ${pdfColor("#64748b")} rg /F1 8 Tf ${pageWidth - margin - 58} 28 Td (Page ${index + 1} of ${pages.length}) Tj ET`)
  })

  const objects: string[] = []
  const pageObjectNumbers: number[] = []
  objects.push("<< /Type /Catalog /Pages 2 0 R >>")
  objects.push("PAGES_PLACEHOLDER")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

  pages.forEach((commands) => {
    const contentObjectNumber = objects.length + 1
    const pageObjectNumber = contentObjectNumber + 1
    pageObjectNumbers.push(pageObjectNumber)
    const stream = commands.join("\n")
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`)
  })

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: "application/pdf" })
}

function pdfColor(hex: string) {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return `${formatPdfNumber(r)} ${formatPdfNumber(g)} ${formatPdfNumber(b)}`
}

function formatPdfNumber(value: number) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
}

function wrapLine(line: string, maxLength: number) {
  if (line.length <= maxLength) return [line]
  const words = line.split(" ")
  const lines: string[] = []
  let current = ""
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)
  return lines
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function cleanPdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "-")
}

function formatHistoryForPdf(
  title: string,
  entry: { availability: string; source: string; useInRecommendation: string; shortSummary: string }
) {
  const summary = ["Not authorized", "Not disclosed"].includes(entry.availability)
    ? "Restricted or undisclosed summary under access controls."
    : entry.shortSummary || "No authorized summary recorded."

  return `${title} - ${entry.availability}; Source: ${entry.source}; Use: ${entry.useInRecommendation}; Summary: ${summary}`
}
