import React, { useState } from "react"
import { Bell, CheckCircle2, Database, KeyRound, Monitor, Moon, ShieldCheck, Sun, User, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { useTheme } from "@/src/components/ThemeProvider"
import { useAuth } from "@/src/contexts/AuthContext"

type Tab = "profile" | "users" | "accessibility" | "notifications" | "privacy" | "architecture"

const authorizedRoles = [
  { name: "SNED Teacher", access: "Learner records, assessments, observations, recommendations, progress reports" },
  { name: "Reading Teacher", access: "Reading assessment records, observations, recommendations, progress reports" },
  { name: "Reading Coordinator", access: "Aggregated monitoring, reports, review queues, intervention outcomes" },
  { name: "School Administrator", access: "Aggregated summaries, role oversight, system configuration" },
]

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [saved, setSaved] = useState("")
  const [displayName, setDisplayName] = useState(user?.name || "Teacher Alvin")
  const [department, setDepartment] = useState(user?.department || "SNED Dept. Alpha")
  const [resetStatus, setResetStatus] = useState(() => localStorage.getItem("readassist_password_reset_status_v1") || "")
  const [notifications, setNotifications] = useState(() => {
    const savedPreferences = localStorage.getItem("readassist_notification_preferences_v1")
    return savedPreferences ? JSON.parse(savedPreferences) : {
      pendingReviews: true,
      assessmentReminders: true,
      progressAlerts: true,
    }
  })

  const showSaved = (message: string) => {
    setSaved(message)
    setTimeout(() => setSaved(""), 2200)
  }

  const saveProfile = () => {
    updateUser({
      name: displayName.trim() || "Teacher",
      department: department.trim() || "ReadAssist-SNED",
    })
    showSaved("Profile saved")
  }

  const saveNotificationPreferences = () => {
    localStorage.setItem("readassist_notification_preferences_v1", JSON.stringify(notifications))
    showSaved("Notification preferences saved")
  }

  const sendPasswordReset = () => {
    const requestStamp = new Date().toLocaleString()
    const message = `Password reset request recorded for ${displayName.trim() || user?.name || "educator"} on ${requestStamp}.`
    localStorage.setItem("readassist_password_reset_status_v1", message)
    setResetStatus(message)
    showSaved("Reset link sent")
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">System Settings</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage educator access, accessibility, privacy, and system architecture controls.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle2 size={16} /> {saved}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <nav className="md:col-span-1 space-y-1" aria-label="Settings sections">
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={18} />} label="Profile" />
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={18} />} label="User Management" />
          <TabButton active={activeTab === "accessibility"} onClick={() => setActiveTab("accessibility")} icon={<Monitor size={18} />} label="Accessibility" />
          <TabButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={<Bell size={18} />} label="Notifications" />
          <TabButton active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")} icon={<ShieldCheck size={18} />} label="Privacy" />
          <TabButton active={activeTab === "architecture"} onClick={() => setActiveTab("architecture")} icon={<Database size={18} />} label="Architecture" />
        </nav>

        <div className="md:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Educator Profile</CardTitle>
                  <CardDescription>This profile is used for validation records, intervention documentation, and report metadata.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Assigned Role</Label>
                    <Input id="role" defaultValue={user?.role || "SNED Teacher"} readOnly className="bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="department">Department / Unit</Label>
                    <Input id="department" value={department} onChange={(event) => setDepartment(event.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button onClick={saveProfile}>Save Profile</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose a display mode with sufficient contrast for extended teacher use.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <ThemeButton active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun size={22} />} label="Light" />
                  <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon size={22} />} label="Dark" />
                  <ThemeButton active={theme === "system"} onClick={() => setTheme("system")} icon={<Monitor size={22} />} label="System" />
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>System access is limited to authorized educational roles defined in the thesis scope.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {authorizedRoles.map(role => (
                  <div key={role.name} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{role.name}</p>
                      <Badge variant={role.name === user?.role ? "success" : "outline"}>{role.name === user?.role ? "Current session" : "Authorized"}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{role.access}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "accessibility" && (
            <Card>
              <CardHeader>
                <CardTitle>Accessibility and UDL Readiness</CardTitle>
                <CardDescription>Core interface commitments for inclusive school deployment.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  "WCAG 2.2 AA color contrast targets",
                  "Keyboard-visible focus states",
                  "Readable Inter typography and consistent hierarchy",
                  "Large interaction targets for form-heavy workflows",
                  "Plain-language validation and advisory messages",
                  "Multiple representations: charts, labels, badges, and narrative summaries",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Teacher Workflow Alerts</CardTitle>
                <CardDescription>Notifications focus only on assessment, recommendation, and progress-monitoring work.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow label="Pending recommendation validation" description="Show alerts when generated recommendations still need expert or parent action." checked={notifications.pendingReviews} onChange={() => setNotifications(prev => ({ ...prev, pendingReviews: !prev.pendingReviews }))} />
                <ToggleRow label="Assessment reminders" description="Show learners who may need another reading assessment session." checked={notifications.assessmentReminders} onChange={() => setNotifications(prev => ({ ...prev, assessmentReminders: !prev.assessmentReminders }))} />
                <ToggleRow label="Progress support alerts" description="Show learners classified as needing modified support." checked={notifications.progressAlerts} onChange={() => setNotifications(prev => ({ ...prev, progressAlerts: !prev.progressAlerts }))} />
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button onClick={saveNotificationPreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <Card>
              <CardHeader>
                <CardTitle>Privacy and Security Safeguards</CardTitle>
                <CardDescription>ReadAssist-SNED protects learner identity by using learner codes and limiting role access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>Learner records are displayed by learner code rather than public full personal identifiers.</p>
                <p>Recommendations are advisory and must be reviewed by qualified educators before use.</p>
                <p>The current demonstration build stores local data in browser storage. A production deployment should use server-side authentication, encrypted transport, database access control, audit logs, and formal data privacy approvals.</p>
              </CardContent>
            </Card>
              <Card>
              <CardHeader>
                <CardTitle>Password and Session</CardTitle>
                <CardDescription>Current controls for demonstrating account recovery and secure session behavior.</CardDescription>
              </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={sendPasswordReset}>
                    <KeyRound size={16} className="mr-2" /> Send Password Reset Link
                  </Button>
                  {resetStatus && (
                    <p className="max-w-2xl rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      {resetStatus}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "architecture" && (
            <Card>
              <CardHeader>
                <CardTitle>Hybrid Decision-Support Architecture</CardTitle>
                <CardDescription>How the current implementation maps to the thesis conceptual framework.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Input Layer", "Learner profile, adapted assessment scores, teacher observations, accommodations, IEP-aligned goals, and progress records."],
                  ["Processing Layer", "Rule-based reasoning, lightweight NLP difficulty-tag extraction, classification logic, recommendation matching, and progress status computation."],
                  ["Explanation Layer", "Contributing assessment factors, observation evidence, NLP tags, reasoning steps, confidence, and validation status."],
                  ["Output Layer", "Support-need classifications, intervention recommendations, progress summaries, dashboards, and printable reports."],
                  ["Current Storage Pattern", "Local browser storage for thesis demonstration; production should use Django/PostgreSQL or an equivalent secure backend."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Button variant="ghost" onClick={onClick} className={`w-full justify-start ${active ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50" : "text-slate-600 dark:text-slate-400"}`}>
      <span className="mr-3">{icon}</span> {label}
    </Button>
  )
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-24 flex-col items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"}`}
    >
      {icon}
      <span className="mt-2">{label}</span>
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <span>
        <span className="block font-medium text-slate-900 dark:text-slate-50">{label}</span>
        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
    </label>
  )
}
