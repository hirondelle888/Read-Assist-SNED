import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Learner, Assessment, Observation, Recommendation } from "../types"
import { mockLearners as initialLearners, mockAssessments, mockObservations, mockRecommendations } from "../data"

interface DataContextType {
  learners: Learner[];
  addLearner: (learner: Omit<Learner, "id">) => void;
  updateLearner: (id: string, learner: Partial<Learner>) => void;
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, "id">) => void;
  observations: Observation[];
  addObservation: (observation: Omit<Observation, "id">) => void;
  recommendations: Recommendation[];
  addRecommendation: (recommendation: Omit<Recommendation, "id">) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [learners, setLearners] = useState<Learner[]>(() => {
    const saved = localStorage.getItem('readassist_learners')
    return saved ? JSON.parse(saved) : initialLearners
  })
  
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('readassist_assessments')
    return saved ? JSON.parse(saved) : mockAssessments
  })
  
  const [observations, setObservations] = useState<Observation[]>(() => {
    const saved = localStorage.getItem('readassist_observations')
    return saved ? JSON.parse(saved) : mockObservations
  })

  // Start using localStorage for recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('readassist_recommendations')
    return saved ? JSON.parse(saved) : mockRecommendations
  })

  useEffect(() => {
    localStorage.setItem('readassist_learners', JSON.stringify(learners))
  }, [learners])

  useEffect(() => {
    localStorage.setItem('readassist_assessments', JSON.stringify(assessments))
  }, [assessments])

  useEffect(() => {
    localStorage.setItem('readassist_observations', JSON.stringify(observations))
  }, [observations])

  useEffect(() => {
    localStorage.setItem('readassist_recommendations', JSON.stringify(recommendations))
  }, [recommendations])

  const addLearner = (learnerData: Omit<Learner, "id">) => {
    const newLearner: Learner = {
      ...learnerData,
      id: `L-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` // simple ID generation
    }
    setLearners(prev => [...prev, newLearner])
  }

  const updateLearner = (id: string, updates: Partial<Learner>) => {
    setLearners(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const addAssessment = (data: Omit<Assessment, "id">) => {
    const fresh: Assessment = { ...data, id: `A-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` }
    setAssessments(prev => [...prev, fresh])
  }

  const addObservation = (data: Omit<Observation, "id">) => {
    const fresh: Observation = { ...data, id: `O-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` }
    setObservations(prev => [...prev, fresh])
  }

  const addRecommendation = (data: Omit<Recommendation, "id">) => {
    const fresh: Recommendation = { ...data, id: `R-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` }
    setRecommendations(prev => [...prev, fresh])
  }

  return (
    <DataContext.Provider value={{
      learners, addLearner, updateLearner,
      assessments, addAssessment,
      observations, addObservation,
      recommendations, addRecommendation
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
