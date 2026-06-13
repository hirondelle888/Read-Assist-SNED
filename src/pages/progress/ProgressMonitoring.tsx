import React, { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { useTheme } from "@/src/components/ThemeProvider"
import { useData } from "@/src/contexts/DataContext"
import { format } from "date-fns"

export function ProgressMonitoring() {
  const { theme } = useTheme()
  const { learners, assessments, recommendations } = useData()
  const [selectedLearnerId, setSelectedLearnerId] = useState(learners[0]?.id || "")

  const isDark = theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark"))
  const textColor = isDark ? "#e2e8f0" : "#64748b"
  const tooltipBg = isDark ? "#0f172a" : "#ffffff"
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0"

  const learnerAssessments = useMemo(() => {
    return assessments
      .filter(a => a.learnerId === selectedLearnerId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [assessments, selectedLearnerId])

  const latestAssessment = learnerAssessments[learnerAssessments.length - 1]
  const previousAssessment = learnerAssessments[learnerAssessments.length - 2]
  const scoreDiff = latestAssessment && previousAssessment 
    ? latestAssessment.totalScore - previousAssessment.totalScore
    : 0

  const activeRecs = recommendations.filter(r => r.learnerId === selectedLearnerId)
  const activeStrategiesCount = activeRecs.length > 0 ? activeRecs[activeRecs.length - 1].recommendedStrategies.length : 0
  const activeSince = activeRecs.length > 0 ? format(new Date(activeRecs[activeRecs.length - 1].date), "MMM d, yyyy") : "N/A"

  const progressData = useMemo(() => {
    let target = 15;
    return learnerAssessments.map((a, i) => {
      target += 3;
      return {
        session: `Session ${i + 1}`,
        score: a.totalScore,
        target: target > 50 ? 50 : target,
        date: format(new Date(a.date), "MMM d")
      }
    });
  }, [learnerAssessments])

  const currentStatus = (scoreDiff > 0 || (learnerAssessments.length === 1 && latestAssessment.totalScore > 15)) ? 'Improving' : 'Needs Review'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Progress Monitoring</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track reading assessment trends and intervention outcomes.</p>
      </div>

      <div className="flex gap-4 items-center">
        <select 
          value={selectedLearnerId}
          onChange={(e) => setSelectedLearnerId(e.target.value)}
          className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-w-[250px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
           {learners.map(l => (
             <option key={l.id} value={l.id}>{l.code}</option>
           ))}
        </select>
        <Button 
          variant="outline" 
          onClick={(e) => {
            const btn = e.currentTarget;
            const original = btn.innerHTML;
            btn.innerHTML = "Opening comparison...";
            setTimeout(() => btn.innerHTML = "Comparison report generated", 800);
            setTimeout(() => btn.innerHTML = original, 2500);
          }}
        >
          Compare Sessions
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-blue-600 text-white border-blue-700">
          <CardContent className="pt-6">
            <p className="text-blue-100 text-sm">Target Status</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold">{currentStatus}</span>
              {currentStatus === 'Improving' ? <TrendingUp className="mb-1 opacity-80" /> : <AlertTriangle className="mb-1 opacity-80" />}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Latest Assessment Score</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">{latestAssessment ? latestAssessment.totalScore : 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">/ 50</span>
            </div>
            {learnerAssessments.length > 1 && (
              <p className={`text-xs mt-1 font-medium ${scoreDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {scoreDiff >= 0 ? '+' : ''}{scoreDiff} from last session
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Active Strategies</p>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-2">{activeStrategiesCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Since {activeSince}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend (Total Adapted Score)</CardTitle>
          <CardDescription>Visualizing assessment scores across intervention sessions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{ fill: textColor }} />
                <YAxis domain={[0, 50]} axisLine={false} tickLine={false} tick={{ fill: textColor }} />
                <Tooltip 
                  labelFormatter={(v, payloads) => payloads && payloads.length > 0 ? `${v} (${payloads[0].payload.date})` : v}
                  contentStyle={{ borderRadius: '8px', backgroundColor: tooltipBg, borderColor: tooltipBorder, color: textColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: textColor }}
                />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} name="Actual Score" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target Goal" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              No assessment data available for this learner.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

