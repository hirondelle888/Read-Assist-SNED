import React, { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Bell, ClipboardList, FileBadge2, FileText, FolderCheck, Moon, Search, Sun, UserRound } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useTheme } from "../ThemeProvider"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { useData } from "@/src/contexts/DataContext"
import { getProgressScore } from "@/src/lib/progressScoring"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { learners, assessments, observations, recommendations, externalReports, interventionPlans, progressRecords } = useData()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [query, setQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const notificationPreferences = useMemo(() => {
    const saved = localStorage.getItem("readassist_notification_preferences_v1")
    return saved
      ? JSON.parse(saved)
      : {
          pendingReviews: true,
          assessmentReminders: true,
          progressAlerts: true,
        }
  }, [showNotifications])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const term = query.toLowerCase()
    const learnerResults = learners
      .filter(l => `${l.code} ${l.displayName} ${l.anonymizedId} ${l.gradeLevel} ${l.readingConcerns.join(" ")} ${l.supportNeeds} ${l.diagnosisStatus}`.toLowerCase().includes(term))
      .map(l => ({ label: l.code, detail: `${l.gradeLevel} - ${l.supportNeeds}`, icon: UserRound, path: `/learners/${l.id}` }))
    const reportResults = externalReports
      .filter(r => `${r.reportType} ${r.source} ${r.keyFindingsSummary} ${r.existingRecommendations.join(" ")}`.toLowerCase().includes(term))
      .map(r => {
        const learner = learners.find(l => l.id === r.learnerId)
        return { label: `${r.reportType} - ${learner?.code || "learner"}`, detail: r.authorizedForUse ? "Authorized report summary" : "Restricted report summary", icon: FileBadge2, path: "/external-reports" }
      })
    const recommendationResults = recommendations
      .filter(r => `${r.classifiedSupportLevel} ${r.recommendedStrategies.join(" ")} ${r.validationStatus}`.toLowerCase().includes(term))
      .map(r => {
        const learner = learners.find(l => l.id === r.learnerId)
        return { label: `Recommendation for ${learner?.code || "learner"}`, detail: r.validationStatus, icon: FileText, path: `/recommendations/${r.id}` }
      })
    const interventionResults = interventionPlans
      .filter(plan => `${plan.targetSkill} ${plan.strategy} ${plan.status} ${plan.responsiblePerson}`.toLowerCase().includes(term))
      .map(plan => {
        const learner = learners.find(l => l.id === plan.learnerId)
        return { label: `Intervention plan - ${learner?.code || "learner"}`, detail: `${plan.status} · ${plan.targetSkill}`, icon: FolderCheck, path: "/interventions" }
      })
    const assessmentResults = assessments
      .filter(a => `${a.summary} ${a.lowestDomains.join(" ")}`.toLowerCase().includes(term))
      .map(a => {
        const learner = learners.find(l => l.id === a.learnerId)
        return { label: `Assessment - ${learner?.code || "learner"}`, detail: `${a.totalScore}/50 score`, icon: ClipboardList, path: "/assessments" }
      })
    const observationResults = observations
      .filter(o => `${o.narrative} ${o.nlpTags.join(" ")}`.toLowerCase().includes(term))
      .map(o => {
        const learner = learners.find(l => l.id === o.learnerId)
        return { label: `Observation - ${learner?.code || "learner"}`, detail: o.nlpTags.slice(0, 2).join(", ") || "Teacher observation", icon: ClipboardList, path: "/observations" }
      })
    const progressResults = progressRecords
      .filter(record => `${record.targetSkill} ${record.finalAction} ${record.finalActionReason} ${record.activityMaterialUsed} ${record.systemSuggestedAction}`.toLowerCase().includes(term))
      .map(record => {
        const learner = learners.find(l => l.id === record.learnerId)
        return { label: `Progress update - ${learner?.code || "learner"}`, detail: `${record.finalAction} - ${getProgressScore(record)}/10 - ${record.targetSkill}`, icon: ClipboardList, path: "/progress" }
      })

    return [...learnerResults, ...reportResults, ...recommendationResults, ...interventionResults, ...assessmentResults, ...observationResults, ...progressResults].slice(0, 6)
  }, [assessments, externalReports, interventionPlans, learners, observations, progressRecords, query, recommendations])

  const notifications = useMemo(() => {
    const pending = notificationPreferences.pendingReviews
      ? recommendations
          .filter(r => ["Draft recommendation", "For expert review", "For parent confirmation"].includes(r.validationStatus))
          .map(r => {
            const learner = learners.find(l => l.id === r.learnerId)
            return {
              title: `${learner?.code || "Learner"} recommendation needs validation`,
              detail: r.validationStatus,
              path: `/recommendations/${r.id}`,
            }
          })
      : []
    const modified = notificationPreferences.assessmentReminders
      ? interventionPlans
          .filter(plan => plan.status === "Under review" || new Date(plan.reviewDate) <= new Date())
          .map(plan => {
            const learner = learners.find(l => l.id === plan.learnerId)
            return {
              title: `${learner?.code || "Learner"} intervention review is due`,
              detail: `${plan.targetSkill} · ${plan.status}`,
              path: "/interventions",
            }
          })
      : []
    const followUp = notificationPreferences.progressAlerts
      ? learners
          .filter(l => l.status === "Needs Modified Support")
          .map(l => ({
            title: `${l.code} needs modified support`,
            detail: "Review progress and intervention plan",
            path: `/learners/${l.id}`,
          }))
      : []
    return [...pending, ...modified, ...followUp].slice(0, 6)
  }, [interventionPlans, learners, notificationPreferences, recommendations])

  const openPath = (path: string) => {
    navigate(path)
    setShowSearch(false)
    setShowNotifications(false)
    setShowProfile(false)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 transition-colors z-30 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSearch(true)
            }}
            onFocus={() => setShowSearch(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchResults[0]) openPath(searchResults[0].path)
              if (e.key === "Escape") setShowSearch(false)
            }}
            placeholder="Search learners, reports, interventions, observations, or recommendations..."
            className="pl-9 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50"
            aria-label="Search ReadAssist-SNED records"
          />
          {showSearch && query.trim() && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              {searchResults.length > 0 ? searchResults.map((result, index) => (
                <button
                  key={`${result.path}-${index}`}
                  onClick={() => openPath(result.path)}
                  className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <result.icon className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    <span className="block text-sm font-medium text-slate-900 dark:text-slate-50">{result.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{result.detail}</span>
                  </span>
                </button>
              )) : (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No matching records found.</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setTheme(theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark")) ? "light" : "dark")}
          className="relative rounded-md p-2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Toggle color theme"
        >
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </button>

        <div className="relative">
          <button
            className="relative rounded-md p-2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            aria-label="Open notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-50">Review Queue</p>
                {notifications.length > 0 && <Badge variant="warning">{notifications.length}</Badge>}
              </div>
              {notifications.length > 0 ? notifications.map((item, index) => (
                <button
                  key={`${item.path}-${index}`}
                  onClick={() => openPath(item.path)}
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className="block text-sm font-medium text-slate-900 dark:text-slate-50">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                </button>
              )) : (
                <div className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">
                  <p>No pending workflow alerts.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:bg-slate-900"
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-200 leading-none">{user?.name || "Teacher"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.role || "Educator"}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.department}</p>
              </div>
              <div className="py-1">
                <button onClick={() => openPath("/settings")} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Settings</button>
                <button onClick={() => { setShowProfile(false); setShowLogoutConfirm(true); }} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 text-center">Confirm Log Out</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Are you sure you want to end this educator session?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); navigate("/login"); }} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Log Out</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
