import React, { useState, useEffect } from "react"
import { Monitor, Moon, Sun, Bell, User, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useTheme } from "@/src/components/ThemeProvider"

type Tab = "profile" | "appearance" | "notifications" | "privacy" | "system";

export function Settings() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage configuration, accessibility, and account preferences.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("profile")}
            className={`w-full justify-start ${activeTab === 'profile' ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <User size={18} className="mr-3" /> Account Profile
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("appearance")}
            className={`w-full justify-start ${activeTab === 'appearance' ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Monitor size={18} className="mr-3" /> Appearance
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("notifications")}
            className={`w-full justify-start ${activeTab === 'notifications' ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Bell size={18} className="mr-3" /> Notifications
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("privacy")}
            className={`w-full justify-start ${activeTab === 'privacy' ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <ShieldCheck size={18} className="mr-3" /> Privacy
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("system")}
            className={`w-full justify-start ${activeTab === 'system' ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Monitor size={18} className="mr-3" /> System Architecture
          </Button>
        </div>
        
        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-50">Profile Information</CardTitle>
                  <CardDescription>Update your personal details and educator profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Alvin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Guillermo" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="alvinj.guillermo09@gmail.com" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" onClick={handleSave}>
                    {isSaved ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</> : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-50">Educational Credentials</CardTitle>
                  <CardDescription>Update your departmental roles and certifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Department Role</Label>
                    <Input id="role" defaultValue="SNED Teacher" readOnly className="bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department / School</Label>
                    <Input id="dept" defaultValue="SNED Dept. Alpha" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button variant="outline" onClick={handleSave}>
                    {isSaved ? <><CheckCircle2 size={16} className="mr-2" /> Updated!</> : "Update Credentials"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-50">Appearance</CardTitle>
                  <CardDescription>Customize the visual theme of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${theme === 'light' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600/20' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                    >
                       <Sun size={24} className="mb-2" />
                       <span className="text-sm font-medium">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${theme === 'dark' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600/20' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                    >
                       <Moon size={24} className="mb-2" />
                       <span className="text-sm font-medium">Dark Mode</span>
                    </button>
                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${theme === 'system' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600/20' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                    >
                       <Monitor size={24} className="mb-2" />
                       <span className="text-sm font-medium">System Default</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-50">Accessibility Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ReadAssist-SNED follows WCAG 2.2 AA guidelines. UI components support keyboard navigation, heavy contrast reading modes, and screen-reader compatibility natively across all dashboards to ensure high compliance with Special Needs tracking systems.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-50">Notification Preferences</CardTitle>
                  <CardDescription>Choose what alerts you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">Assessment Reminders</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a learner is due for their periodic assessment.</p>
                    </div>
                    <Input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">Recommendation Alerts</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Alerts when AI generates new intervention strategies.</p>
                    </div>
                    <Input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">System Updates</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Receive announcements about app updates and features.</p>
                    </div>
                    <Input type="checkbox" className="h-4 w-4" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" onClick={handleSave}>
                    {isSaved ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</> : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-slate-900 dark:text-slate-50">Security & Privacy</CardTitle>
                   <CardDescription>Manage your data sharing and security settings.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">Data Sharing with Dept.</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Allow your school administration to view aggregated class progress.</p>
                    </div>
                    <Input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                   <div className="pt-4">
                     <Button 
                       variant="outline" 
                       className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
                       onClick={(e) => {
                         const btn = e.currentTarget;
                         const og = btn.innerHTML;
                         btn.innerHTML = "Reset link sent ✓";
                         setTimeout(() => btn.innerHTML = og, 2000);
                       }}
                     >
                       <KeyRound size={16} className="mr-2" /> Change Password
                     </Button>
                   </div>
                 </CardContent>
               </Card>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-slate-900 dark:text-slate-50">Parallel and Distributed Processing</CardTitle>
                   <CardDescription>Configure task processing behavior for performance evaluation.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">Enable Distributed Task Execution</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Divides assessment, NLP analysis, and classification into parallel worker processes.</p>
                    </div>
                    <Input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="workers">Max Worker Processes</Label>
                    <select id="workers" defaultValue="4" className="flex h-10 w-full max-w-[200px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                      <option value="1">1 (Sequential Execution)</option>
                      <option value="2">2 Workers</option>
                      <option value="4">4 Workers</option>
                      <option value="8">8 Workers</option>
                    </select>
                  </div>
                 </CardContent>
                 <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" onClick={handleSave}>
                    {isSaved ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</> : "Save Preferences"}
                  </Button>
                 </CardFooter>
               </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
