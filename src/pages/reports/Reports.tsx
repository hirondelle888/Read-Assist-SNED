import React from "react"
import { FileDown, Printer, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports Generation</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate official documentation for SNED processes.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Learner Summary Report", desc: "Comprehensive view of learner profile, accommodations, and IEP goals.", type: "General" },
          { title: "Assessment Report", desc: "Detailed breakdown of adapted reading comprehension scores.", type: "Analytics" },
          { title: "Recommendation Report", desc: "Explainable AI output including factors, evidence, and strategies.", type: "Intervention" },
          { title: "Progress Monitoring Report", desc: "Trend analysis across multiple intervention sessions.", type: "Analytics" },
        ].map(report => (
          <Card key={report.title} className="hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
             <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mb-3">
                    <FileText size={20} />
                  </div>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-50">{report.title}</CardTitle>
                <CardDescription>{report.desc}</CardDescription>
             </CardHeader>
             <CardContent className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 text-sm h-9" onClick={() => window.print()}>
                  <Printer size={14} className="mr-2" /> Print
                </Button>
                <Button 
                  className="flex-1 text-sm h-9" 
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    if(btn) {
                       const og = btn.innerHTML;
                       btn.innerHTML = "Downloading...";
                       setTimeout(() => { btn.innerHTML = "Exported ✓"; setTimeout(() => btn.innerHTML = og, 2000)}, 1000);
                    }
                  }}
                >
                  <FileDown size={14} className="mr-2" /> Export PDF
                </Button>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
