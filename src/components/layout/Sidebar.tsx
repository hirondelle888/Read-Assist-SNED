import React, { useState } from "react"
import { createPortal } from "react-dom"
import { NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, FileText, Eye, BrainCircuit, Lightbulb, LineChart, FileSpreadsheet, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar() {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/learners", icon: <Users size={20} />, label: "Learners" },
    { to: "/assessments/new", icon: <FileText size={20} />, label: "Assessments" },
    { to: "/observations/new", icon: <Eye size={20} />, label: "Observations" },
    { to: "/recommendations", icon: <Lightbulb size={20} />, label: "Recommendations" },
    { to: "/progress", icon: <LineChart size={20} />, label: "Progress" },
    { to: "/reports", icon: <FileSpreadsheet size={20} />, label: "Reports" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" }
  ]

  return (
    <aside className={`hidden flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 md:flex z-40 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex h-16 items-center px-4 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-2 text-blue-700 dark:text-blue-500 font-bold text-lg tracking-tight overflow-hidden ${isCollapsed ? 'hidden' : 'flex'}`}>
          <BrainCircuit size={24} className="shrink-0" />
          <span className="truncate">ReadAssist-SNED</span>
        </div>
        
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-700 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="Expand Sidebar"
          >
            <BrainCircuit size={24} className="shrink-0" />
          </button>
        ) : (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors ml-2"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 transition-colors ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:text-slate-50 dark:hover:text-slate-50"
              }`
            }
          >
            <div className="shrink-0 flex items-center justify-center w-5">
              {item.icon}
            </div>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className={`p-4 border-t border-slate-100 dark:border-slate-800 space-y-4`}>
        {!isCollapsed && (
          <div className="rounded-lg bg-blue-50 dark:bg-slate-900 p-4 border dark:border-slate-800 overflow-hidden">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium truncate">Teacher View</p>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 truncate">SNED Dept. Alpha</p>
          </div>
        )}
        <div className={`pt-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Log Out" : undefined}
            className={`flex items-center rounded-lg py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center px-0 w-10' : 'gap-3 px-3 w-full'}`}
          >
            <div className="shrink-0 flex items-center justify-center w-5">
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span>Log Out</span>}
          </button>
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
    </aside>
  )
}
