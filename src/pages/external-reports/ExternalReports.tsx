import React, { useState } from "react";
import { FileBadge2, LockKeyhole, Plus, ShieldCheck, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { confidentialityNotice, prototypeAssumptionNote } from "@/src/data";
import { useAuth } from "@/src/contexts/AuthContext";
import { useData } from "@/src/contexts/DataContext";
import { ReportAvailability, ReportType } from "@/src/types";

const reportTypes: ReportType[] = ["Dev Ped Report", "Academic Assessment", "OT Report", "ST Report", "ABA Report", "SPED Report", "Other"];
const availabilityOptions: ReportAvailability[] = ["Available", "Not available", "For follow-up"];

const initialForm = {
  learnerId: "",
  reportType: "Dev Ped Report" as ReportType,
  availability: "Available" as ReportAvailability,
  reportDate: "",
  source: "",
  authorizedForUse: true,
  keyFindingsSummary: "",
  existingRecommendations: "",
  attachmentName: "Confidential file reference pending",
};

export function ExternalReports() {
  const { user } = useAuth();
  const { learners, externalReports, addExternalReport } = useData();
  const [formData, setFormData] = useState(initialForm);
  const [savedMessage, setSavedMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.learnerId || !formData.source.trim() || !formData.keyFindingsSummary.trim()) return;
    addExternalReport({
      learnerId: formData.learnerId,
      reportType: formData.reportType,
      availability: formData.availability,
      reportDate: formData.reportDate || new Date().toISOString().slice(0, 10),
      source: formData.source.trim(),
      encodedBy: user?.name || "Authorized staff",
      authorizedForUse: formData.authorizedForUse,
      keyFindingsSummary: formData.keyFindingsSummary.trim(),
      existingRecommendations: formData.existingRecommendations
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      attachmentName: formData.attachmentName.trim() || "Confidential file reference pending",
    });
    setSavedMessage("External report summary saved.");
    setFormData(initialForm);
    setTimeout(() => setSavedMessage(""), 2200);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">External Report Summary</h2>
        <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">
          Encode or summarize existing external reports used in reading intervention planning. This module does not generate or replace a Dev Ped Assessment Report.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Prototype note</p>
              <p className="mt-1 leading-relaxed">{prototypeAssumptionNote}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <LockKeyhole size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Confidentiality reminder</p>
              <p className="mt-1 leading-relaxed">{confidentialityNotice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Encode Report Summary</CardTitle>
                <CardDescription>Summarize authorized findings and recommendations from external reports used in school-based decision support.</CardDescription>
              </div>
              {savedMessage && <Badge variant="success">{savedMessage}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Learner">
                <select name="learnerId" value={formData.learnerId} onChange={handleChange} className={selectClassName}>
                  <option value="">Select learner</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.code} - {learner.privacyMode === "Anonymized Record" ? learner.anonymizedId : learner.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Report Type">
                <select name="reportType" value={formData.reportType} onChange={handleChange} className={selectClassName}>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Report Availability">
                <select name="availability" value={formData.availability} onChange={handleChange} className={selectClassName}>
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Report Date">
                <Input type="date" name="reportDate" value={formData.reportDate} onChange={handleChange} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Issued By / Source">
                <Input
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g., Cradle Center Developmental Pediatrician"
                />
              </Field>
              <Field label="Encoded By">
                <Input value={user?.name || "Authorized staff"} readOnly className="bg-slate-50 dark:bg-slate-950/70" />
              </Field>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <input
                type="checkbox"
                name="authorizedForUse"
                checked={formData.authorizedForUse}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>
                <span className="block font-medium text-slate-900 dark:text-slate-50">Authorized for educational use</span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                  Keep this unchecked if the report is pending authorization, follow-up, or only partially available.
                </span>
              </span>
            </label>

            <Field label="Key Findings Summary">
              <Textarea
                name="keyFindingsSummary"
                value={formData.keyFindingsSummary}
                onChange={handleChange}
                className="min-h-[130px]"
                placeholder="Summarize only the support-relevant findings that can be used for reading intervention planning."
              />
            </Field>

            <Field label="Existing Recommendations From Report">
              <Textarea
                name="existingRecommendations"
                value={formData.existingRecommendations}
                onChange={handleChange}
                className="min-h-[120px]"
                placeholder="One recommendation per line"
              />
            </Field>

            <Field label="Attachment Placeholder">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                <Upload size={18} className="text-slate-500 dark:text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{formData.attachmentName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Confidential attachment or file-reference field for the authorized external report record.</p>
                </div>
              </div>
            </Field>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!formData.learnerId || !formData.source.trim() || !formData.keyFindingsSummary.trim()}>
                <Plus size={16} className="mr-2" /> Save Draft Summary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encoded Summaries</CardTitle>
            <CardDescription>Confidential external-report summaries already on record in the current system data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {externalReports.length > 0 ? (
              externalReports.map((report) => {
                const learner = learners.find((entry) => entry.id === report.learnerId);
                return (
                  <div key={report.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{report.reportType}</p>
                      <Badge variant={report.authorizedForUse ? "success" : "warning"}>
                        {report.authorizedForUse ? "Authorized" : "Restricted use"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {learner?.code} | {report.source} | {report.reportDate || "No date"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{report.keyFindingsSummary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.existingRecommendations.length > 0 ? (
                        report.existingRecommendations.slice(0, 3).map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">No encoded recommendations</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No external report summaries have been encoded yet.
              </div>
            )}
          </CardContent>
        </Card>
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
