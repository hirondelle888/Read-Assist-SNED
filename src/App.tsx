import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { MainLayout } from "./components/layout/MainLayout"
import { useAuth } from "./contexts/AuthContext"

const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })))
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })))
const LearnerList = lazy(() => import("./pages/learners/LearnerList").then((module) => ({ default: module.LearnerList })))
const LearnerForm = lazy(() => import("./pages/learners/LearnerForm").then((module) => ({ default: module.LearnerForm })))
const LearnerProfile = lazy(() => import("./pages/learners/LearnerProfile").then((module) => ({ default: module.LearnerProfile })))
const ExternalReports = lazy(() => import("./pages/external-reports/ExternalReports").then((module) => ({ default: module.ExternalReports })))
const AssessmentWizard = lazy(() => import("./pages/assessments/AssessmentWizard").then((module) => ({ default: module.AssessmentWizard })))
const AssessmentList = lazy(() => import("./pages/assessments/AssessmentList").then((module) => ({ default: module.AssessmentList })))
const ObservationForm = lazy(() => import("./pages/observations/ObservationForm").then((module) => ({ default: module.ObservationForm })))
const ObservationList = lazy(() => import("./pages/observations/ObservationList").then((module) => ({ default: module.ObservationList })))
const RecommendationList = lazy(() => import("./pages/recommendations/RecommendationList").then((module) => ({ default: module.RecommendationList })))
const ExplainableRecommendation = lazy(() => import("./pages/recommendations/ExplainableRecommendation").then((module) => ({ default: module.ExplainableRecommendation })))
const InterventionPlans = lazy(() => import("./pages/interventions/InterventionPlans").then((module) => ({ default: module.InterventionPlans })))
const ProgressMonitoring = lazy(() => import("./pages/progress/ProgressMonitoring").then((module) => ({ default: module.ProgressMonitoring })))
const Reports = lazy(() => import("./pages/reports/Reports").then((module) => ({ default: module.Reports })))
const Settings = lazy(() => import("./pages/settings/Settings").then((module) => ({ default: module.Settings })))

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">ReadAssist-SNED</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">Loading workspace</h1>
        <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Preparing the requested educator view and learner support records.
        </p>
      </div>
    </div>
  )
}
