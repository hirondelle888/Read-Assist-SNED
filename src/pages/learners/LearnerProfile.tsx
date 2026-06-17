import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Edit,
  Eye,
  FileBadge2,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { prototypeAssumptionNote } from "@/src/data";
import { useData } from "@/src/contexts/DataContext";

export function LearnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { learners, assessments, observations, recommendations, externalReports, interventionPlans } = useData();
  const learner = learners.find((entry) => entry.id === id) || learners[0];

  const learnerReports = externalReports.filter((report) => report.learnerId === learner.id);
  const learnerRecommendations = recommendations.filter((recommendation) => recommendation.learnerId === learner.id);
  const activePlan = interventionPlans.find((plan) => plan.learnerId === learner.id && plan.status === "Active");

  const timelineEvents = useMemo(
    () =>
      [
        ...learnerReports.map((report) => ({
          id: report.id,
          title: `${report.reportType} summary encoded`,
          dateObj: new Date(report.reportDate || report.createdAt),
          date: format(new Date(report.reportDate || report.createdAt), "MMM d, yyyy"),
          type: "External report",
          icon: FileBadge2,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
          link: "/external-reports",
        })),
        ...assessments
          .filter((assessment) => assessment.learnerId === learner.id)
          .map((assessment) => ({
            id: assessment.id,
            title: "Academic reading assessment summary recorded",
            dateObj: new Date(assessment.date),
            date: format(new Date(assessment.date), "MMM d, yyyy"),
            type: "Assessment",
            icon: ClipboardList,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
            link: "/assessments",
          })),
        ...observations
          .filter((observation) => observation.learnerId === learner.id)
          .map((observation) => ({
            id: observation.id,
            title: "Teacher or therapist observation recorded",
            dateObj: new Date(observation.date),
            date: format(new Date(observation.date), "MMM d, yyyy"),
            type: "Observation",
            icon: Eye,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
            link: "/observations",
          })),
        ...learnerRecommendations.map((recommendation) => ({
          id: recommendation.id,
          title: `Recommendation status: ${recommendation.validationStatus}`,
          dateObj: new Date(recommendation.date),
          date: format(new Date(recommendation.date), "MMM d, yyyy"),
          type: "Recommendation",
          icon: AlertCircle,
          color: "text-green-600 bg-green-50 dark:bg-green-900/20",
          link: `/recommendations/${recommendation.id}`,
        })),
      ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()),
    [assessments, learner.id, learnerRecommendations, learnerReports, observations]
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {learner.privacyMode === "Anonymized Record" ? learner.anonymizedId : learner.displayName}
            </h2>
            <Badge variant="outline">{learner.code}</Badge>
            <Badge variant={learner.consentStatus === "Granted" ? "success" : learner.consentStatus === "Pending" ? "warning" : "destructive"}>
              Consent: {learner.consentStatus}
            </Badge>
            <Badge variant={learner.dataAccessSensitivity === "Highly restricted" ? "destructive" : learner.dataAccessSensitivity === "Restricted" ? "warning" : "secondary"}>
              {learner.dataAccessSensitivity}
            </Badge>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {learner.gradeLevel} | {learner.age} years old | {learner.communicationLevel} | {learner.supportNeeds}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/learners/${learner.id}/edit`)}>
            <Edit size={16} className="mr-2" /> Edit Profile
          </Button>
          <Button onClick={() => navigate("/external-reports")}>
            <FileText size={16} className="mr-2" /> Encode Report
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Prototype note</p>
            <p className="mt-1 leading-relaxed">{prototypeAssumptionNote}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Core learner support profile used by the center workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Metric label="Support Need" value={learner.supportNeeds} />
              <Metric label="Diagnosis Status" value={learner.diagnosisStatus} />
              <Metric label="Identified Condition" value={learner.identifiedCondition} />
              <Metric label="Disability / Learning Need" value={learner.disabilityCategory} />
              <Metric label="Current Reading Level" value={learner.currentReadingLevel || "Not yet summarized"} />
              <Metric label="Attention / Behavior Support" value={learner.attentionBehaviorSupportLevel} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy and Consent</CardTitle>
              <CardDescription>Sensitive profile flags remain visible so staff can handle records appropriately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Privacy Mode</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{learner.privacyMode}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Anonymized Identifier</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{learner.anonymizedId}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <LockKeyhole size={16} className="mt-0.5 shrink-0" />
                  <p>Medical, developmental, family, and external-report details must only be used according to the learner's consent status and access sensitivity.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Support Planning Inputs</CardTitle>
              <CardDescription>Reading concerns, accommodations, and individualized goals that guide recommendations and intervention planning.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <TagBlock title="Reading Concerns" items={learner.readingConcerns} />
              <TagBlock title="Sensory / Learning Considerations" items={learner.sensoryLearningConsiderations} />
              <TagBlock title="Existing Accommodations" items={learner.accommodations} />
              <TagBlock title="IEP / Individualized Goals" items={learner.iepGoals} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authorized History Summary</CardTitle>
              <CardDescription>These summaries encode external and historical context for educational planning only. They are not replacements for original specialist reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
                Encode and review only authorized educational summaries. Restricted or undisclosed sections remain contextual only and should not become the main basis of intervention recommendations.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <HistoryCard title="Medical History" value={learner.historySummary.medicalHistory} />
                <HistoryCard title="Developmental History" value={learner.historySummary.developmentalHistory} />
                <HistoryCard title="Family History" value={learner.historySummary.familyHistory} />
                <HistoryCard title="Academic History" value={learner.historySummary.academicHistory} />
                <HistoryCard title="OT / ST / ABA / SPED Context" value={learner.historySummary.relatedServiceHistory} className="md:col-span-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Current Workflow Status</CardTitle>
                  <CardDescription>Recommendation and intervention progress for this learner.</CardDescription>
                </div>
                {activePlan ? <Badge variant="success">Active intervention</Badge> : <Badge variant="warning">No active intervention yet</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePlan ? (
                <div className="rounded-xl border border-green-200 bg-green-50/70 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{activePlan.targetSkill}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {activePlan.strategy} | Review on {format(new Date(activePlan.reviewDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/interventions")}>
                      View intervention plan
                    </Button>
                  </div>
                </div>
              ) : null}
              {learnerRecommendations.length > 0 ? (
                learnerRecommendations.slice(0, 2).map((recommendation) => (
                  <div key={recommendation.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{recommendation.targetConcern}</p>
                      <Badge variant={isPositiveValidationStatus(recommendation.validationStatus) ? "success" : recommendation.validationStatus === "Expert rejected" ? "destructive" : "warning"}>
                        {recommendation.validationStatus}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {recommendation.recommendedStrategies.slice(0, 2).join(", ")}
                      {recommendation.recommendedStrategies.length > 2 ? "..." : ""}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/recommendations/${recommendation.id}`)}>
                        View recommendation
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No recommendation draft has been generated for this learner yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Timeline</CardTitle>
              <CardDescription>Ordered records across external summaries, academic reading assessments, observations, and recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${event.color}`}>
                      <event.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{event.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {event.type} | {event.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(event.link)}>
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No support timeline records are available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-50">{value || "Not specified"}</p>
    </div>
  );
}

function TagBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => <Badge key={item} variant="outline">{item}</Badge>) : <Badge variant="secondary">None recorded</Badge>}
      </div>
    </div>
  );
}

function HistoryCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: {
    availability: string;
    source: string;
    useInRecommendation: string;
    shortSummary: string;
  };
  className?: string;
}) {
  const restricted = ["Not authorized", "Not disclosed"].includes(value.availability);
  const summary = restricted
    ? "Restricted or undisclosed history. Refer only to authorized labels and access controls."
    : value.shortSummary || "No authorized summary recorded.";

  return (
    <div className={`rounded-xl border p-4 ${restricted ? "border-amber-500/60 bg-amber-50/60 dark:border-amber-700/70 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800"} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
        <Badge variant="warning">Context only</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={restricted ? "destructive" : value.availability === "Available" ? "success" : value.availability === "For follow-up" ? "warning" : "outline"}>
          {value.availability}
        </Badge>
        <Badge variant="outline">{value.source}</Badge>
        <Badge variant={value.useInRecommendation === "Yes" ? "success" : value.useInRecommendation === "Restricted" ? "warning" : "outline"}>
          Use: {value.useInRecommendation}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>
    </div>
  );
}

function isPositiveValidationStatus(status: string) {
  return ["Expert approved", "Expert revised", "Parent confirmed", "Active intervention"].includes(status);
}
