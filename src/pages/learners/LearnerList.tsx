import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, UserPlus, Filter } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useData } from "@/src/contexts/DataContext"

export function LearnerList() {
  const navigate = useNavigate()
  const { learners } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("All")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Improving": return <Badge variant="success">Improving</Badge>
      case "Stable": return <Badge variant="secondary">Stable</Badge>
      case "Needs Modified Support": return <Badge variant="destructive">Needs Review</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSupportBadge = (level: string) => {
    if (level.includes("High")) return <Badge variant="destructive">High</Badge>
    if (level.includes("Moderate")) return <Badge variant="warning">Moderate</Badge>
    return <Badge variant="success">Low</Badge>
  }

  const filteredLearners = learners.filter(l => {
    const matchesSearch = l.code.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterLevel === "All") return matchesSearch
    return matchesSearch && l.supportNeeds.includes(filterLevel)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Learners Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor reading comprehension interventions.</p>
        </div>
        <Button onClick={() => navigate("/learners/new")} className="flex items-center gap-2">
          <UserPlus size={16} />
          Add Learner
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by Learner Code..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <option value="All">All Support Levels</option>
              <option value="High">High Support</option>
              <option value="Moderate">Moderate Support</option>
              <option value="Low">Low Support</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => {setSearchTerm(""); setFilterLevel("All")}}>
              <Filter size={16} />
              Reset
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Learner Code</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Support Need</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLearners.length > 0 ? filteredLearners.map((learner) => (
                <tr key={learner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{learner.code}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{learner.gradeLevel}</td>
                  <td className="px-6 py-4">{getSupportBadge(learner.supportNeeds)}</td>
                  <td className="px-6 py-4">{getStatusBadge(learner.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/learners/${learner.id}`)}>
                      View Profile
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No learners found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredLearners.length} of {learners.length} learners
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
