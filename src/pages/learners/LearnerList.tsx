import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search, ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { prototypeAssumptionNote } from "@/src/data";
import { useData } from "@/src/contexts/DataContext";

export function LearnerList() {
  const navigate = useNavigate();
  const { learners } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredLearners = learners.filter((learner) => {
    const haystack = [
      learner.code,
      learner.displayName,
      learner.anonymizedId,
      learner.gradeLevel,
      learner.diagnosisStatus,
      learner.readingConcerns.join(" "),
      learner.supportNeeds,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    if (filterLevel === "All") return matchesSearch;
    return matchesSearch && learner.supportNeeds.includes(filterLevel);
  });

  const totalPages = Math.max(1, Math.ceil(filteredLearners.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedLearners = filteredLearners.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Learner Support Directory</h2>
          <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">
            View learner support profiles, privacy flags, consent status, and current reading-intervention needs in one place.
          </p>
        </div>
        <Button onClick={() => navigate("/learners/new")} className="flex items-center gap-2">
          <UserPlus size={16} />
          Add Learner
        </Button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <p>{prototypeAssumptionNote}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search learner code, profile, concern, or status..."
              className="pl-9"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterLevel}
              onChange={(event) => {
                setFilterLevel(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="All">All support levels</option>
              <option value="High">High support</option>
              <option value="Moderate">Moderate support</option>
              <option value="Low">Low support</option>
            </select>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterLevel("All");
              setPage(1);
            }}>
              <Filter size={16} className="mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4">Support Profile</th>
                <th className="px-6 py-4">Consent / Access</th>
                <th className="px-6 py-4">Workflow Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedLearners.length > 0 ? (
                pagedLearners.map((learner) => (
                  <tr key={learner.id} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {learner.privacyMode === "Anonymized Record" ? learner.anonymizedId : learner.displayName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {learner.code} | {learner.gradeLevel} | {learner.age} yrs
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Badge variant={learner.supportNeeds.includes("High") ? "destructive" : learner.supportNeeds.includes("Moderate") ? "warning" : "success"}>
                          {learner.supportNeeds}
                        </Badge>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{learner.disabilityCategory}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {learner.readingConcerns.slice(0, 2).join(", ")}
                          {learner.readingConcerns.length > 2 ? "..." : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Badge variant={learner.consentStatus === "Granted" ? "success" : learner.consentStatus === "Pending" ? "warning" : "destructive"}>
                          {learner.consentStatus}
                        </Badge>
                        <Badge variant={learner.dataAccessSensitivity === "Highly restricted" ? "destructive" : learner.dataAccessSensitivity === "Restricted" ? "warning" : "secondary"}>
                          {learner.dataAccessSensitivity}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Badge variant={learner.status === "Improving" ? "success" : learner.status === "Stable" ? "secondary" : "warning"}>
                          {learner.status}
                        </Badge>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{learner.diagnosisStatus}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/learners/${learner.id}`)}>
                        View profile
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No learner profiles match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing {filteredLearners.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredLearners.length)} of {filteredLearners.length} learners
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
