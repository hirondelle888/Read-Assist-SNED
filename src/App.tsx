import React from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { MainLayout } from "./components/layout/MainLayout"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { LearnerList } from "./pages/learners/LearnerList"
import { LearnerForm } from "./pages/learners/LearnerForm"
import { LearnerProfile } from "./pages/learners/LearnerProfile"
import { ExternalReports } from "./pages/external-reports/ExternalReports"
import { AssessmentWizard } from "./pages/assessments/AssessmentWizard"
import { AssessmentList } from "./pages/assessments/AssessmentList"
import { ObservationForm } from "./pages/observations/ObservationForm"
import { ObservationList } from "./pages/observations/ObservationList"
import { RecommendationList } from "./pages/recommendations/RecommendationList"
import { ExplainableRecommendation } from "./pages/recommendations/ExplainableRecommendation"
import { InterventionPlans } from "./pages/interventions/InterventionPlans"
import { ProgressMonitoring } from "./pages/progress/ProgressMonitoring"
import { Reports } from "./pages/reports/Reports"
import { Settings } from "./pages/settings/Settings"
import { useAuth } from "./contexts/AuthContext"

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/learners" element={<LearnerList />} />
            <Route path="/learners/new" element={<LearnerForm />} />
            <Route path="/learners/:id/edit" element={<LearnerForm />} />
            <Route path="/learners/:id" element={<LearnerProfile />} />

            <Route path="/external-reports" element={<ExternalReports />} />

            <Route path="/assessments" element={<AssessmentList />} />
            <Route path="/assessments/new" element={<AssessmentWizard />} />

            <Route path="/observations" element={<ObservationList />} />
            <Route path="/observations/new" element={<ObservationForm />} />

            <Route path="/recommendations" element={<RecommendationList />} />
            <Route path="/recommendations/:id" element={<ExplainableRecommendation />} />
            <Route path="/interventions" element={<InterventionPlans />} />

            <Route path="/progress" element={<ProgressMonitoring />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
