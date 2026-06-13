import React, { useState } from "react"
import { createPortal } from "react-dom"
import { Bell, Search, UserCircle, Sun, Moon } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { useTheme } from "../ThemeProvider"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 transition-colors z-30 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search learners or reports..." 
            className="pl-9 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setTheme(theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark")) ? "light" : "dark")}
          className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
        >
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </button>
        
        <div className="relative">
          <button 
            className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-50">Notifications</p>
              </div>
              <div className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">
                <p>No new notifications</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 px-2 py-1 rounded-md" 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-200 leading-none">Teacher Alvin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SNED Teacher</p>
            </div>
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }} 
                  className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Settings
                </button>
                <button 
                  onClick={() => {
                    setShowProfile(false);
                    setShowLogoutConfirm(true);
                  }} 
                  className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 text-center">Confirm Log Out</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Are you sure you want to log out of your session?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  navigate("/login");
                }} 
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
