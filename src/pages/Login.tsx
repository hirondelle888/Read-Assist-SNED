import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BrainCircuit, Eye, EyeOff, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useTheme } from "@/src/components/ThemeProvider"
import { useAuth } from "@/src/contexts/AuthContext"
import { UserRole } from "@/src/types"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("teacher.alvin")
  const [password, setPassword] = useState("password")
  const [role, setRole] = useState<UserRole>("SNED Teacher")
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (login(username, password, role)) {
        navigate("/dashboard")
      }
    }, 600)
  }

  const isDarkMode = theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark"))

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3 mb-4">
            <BrainCircuit className="h-8 w-8 text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1">
            ReadAssist-SNED
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Teacher-support system for IEP-aligned reading comprehension intervention.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Select your educator role to access the educator workspace.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => setResetSent(true)} className="text-xs font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-400"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Educator Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="SNED Teacher">SNED Teacher</option>
                  <option value="Reading Teacher">Reading Teacher</option>
                  <option value="Reading Coordinator">Reading Coordinator</option>
                  <option value="School Administrator">School Administrator</option>
                </select>
              </div>
              {resetSent && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
                  Password reset instructions were sent to the registered school email on record for this educator account.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Authorized educators only. The system supports decisions but does not replace professional judgment.
        </p>
      </div>
    </div>
  )
}
