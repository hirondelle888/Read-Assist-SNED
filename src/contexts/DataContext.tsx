import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Assessment,
  ExternalReportSummary,
  InterventionPlan,
  Learner,
  Observation,
  ProgressRecord,
  Recommendation,
} from "../types";
import {
  confidentialityNotice,
  mockAssessments,
  mockExternalReports,
  mockInterventionPlans,
  mockLearners,
  mockObservations,
  mockProgressRecords,
  mockRecommendations,
} from "../data";
import { analyzeObservation, buildAssessmentSummary, buildRecommendation } from "@/src/lib/decisionSupport";

interface DataContextType {
  learners: Learner[];
  addLearner: (learner: Omit<Learner, "id" | "createdAt" | "updatedAt">) => void;
  updateLearner: (id: string, learner: Partial<Learner>) => void;
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt" | "percentage" | "lowestDomains" | "summary" | "concernTags" | "supportNeedEstimate">) => void;
  observations: Observation[];
  addObservation: (observation: Omit<Observation, "id" | "createdAt" | "updatedAt" | "nlpTags" | "extractedEvidence">) => void;
  recommendations: Recommendation[];
  addRecommendation: (recommendation: Omit<Recommendation, "id" | "createdAt" | "updatedAt">) => void;
  updateRecommendation: (id: string, updates: Partial<Recommendation>) => void;
  externalReports: ExternalReportSummary[];
  addExternalReport: (report: Omit<ExternalReportSummary, "id" | "createdAt" | "updatedAt" | "confidentialityNotice">) => void;
  updateExternalReport: (id: string, updates: Partial<ExternalReportSummary>) => void;
  interventionPlans: InterventionPlan[];
  addInterventionPlan: (plan: Omit<InterventionPlan, "id" | "createdAt" | "updatedAt">) => void;
  updateInterventionPlan: (id: string, updates: Partial<InterventionPlan>) => void;
  progressRecords: ProgressRecord[];
  addProgressRecord: (record: Omit<ProgressRecord, "id" | "createdAt" | "updatedAt">) => void;
  generateRecommendationForLearner: (learnerId: string) => Recommendation | undefined;
}

const STORAGE_KEYS = {
  learners: "readassist_learners_v5",
  assessments: "readassist_assessments_v5",
  observations: "readassist_observations_v5",
  recommendations: "readassist_recommendations_v5",
  externalReports: "readassist_external_reports_v5",
  interventionPlans: "readassist_intervention_plans_v5",
  progressRecords: "readassist_progress_records_v5",
};

const LEGACY_KEYS = {
  learners: "readassist_learners_v4",
  assessments: "readassist_assessments_v4",
  observations: "readassist_observations_v4",
  recommendations: "readassist_recommendations_v4",
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [learners, setLearners] = useState<Learner[]>(() => loadRecords(STORAGE_KEYS.learners, LEGACY_KEYS.learners, mockLearners, normalizeLearner));
  const [assessments, setAssessments] = useState<Assessment[]>(() => loadRecords(STORAGE_KEYS.assessments, LEGACY_KEYS.assessments, mockAssessments, normalizeAssessment));
  const [observations, setObservations] = useState<Observation[]>(() => loadRecords(STORAGE_KEYS.observations, LEGACY_KEYS.observations, mockObservations, normalizeObservation));
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() =>
    loadRecords(STORAGE_KEYS.recommendations, LEGACY_KEYS.recommendations, mockRecommendations, normalizeRecommendation)
  );
  const [externalReports, setExternalReports] = useState<ExternalReportSummary[]>(() =>
    loadRecords(STORAGE_KEYS.externalReports, undefined, mockExternalReports, normalizeExternalReport)
  );
  const [interventionPlans, setInterventionPlans] = useState<InterventionPlan[]>(() =>
    loadRecords(STORAGE_KEYS.interventionPlans, undefined, mockInterventionPlans, normalizeInterventionPlan)
  );
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>(() =>
    loadRecords(STORAGE_KEYS.progressRecords, undefined, mockProgressRecords, normalizeProgressRecord)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.learners, JSON.stringify(learners));
  }, [learners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.assessments, JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.observations, JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recommendations, JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.externalReports, JSON.stringify(externalReports));
  }, [externalReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.interventionPlans, JSON.stringify(interventionPlans));
  }, [interventionPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progressRecords, JSON.stringify(progressRecords));
  }, [progressRecords]);

  const addLearner = (learnerData: Omit<Learner, "id" | "createdAt" | "updatedAt">) => {
    const timestamp = isoNow();
    const newLearner: Learner = {
      ...learnerData,
      id: createId("L"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setLearners((prev) => [newLearner, ...prev]);
  };

  const updateLearner = (id: string, updates: Partial<Learner>) => {
    setLearners((prev) => prev.map((learner) => (learner.id === id ? { ...learner, ...updates, updatedAt: isoNow() } : learner)));
  };

  const addExternalReport = (reportData: Omit<ExternalReportSummary, "id" | "createdAt" | "updatedAt" | "confidentialityNotice">) => {
    const timestamp = isoNow();
    const fresh: ExternalReportSummary = {
      ...reportData,
      id: createId("ER"),
      confidentialityNotice,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setExternalReports((prev) => [fresh, ...prev]);
  };

  const updateExternalReport = (id: string, updates: Partial<ExternalReportSummary>) => {
    setExternalReports((prev) => prev.map((report) => (report.id === id ? { ...report, ...updates, updatedAt: isoNow() } : report)));
  };

  const addAssessment = (
    data: Omit<
      Assessment,
      "id" | "createdAt" | "updatedAt" | "percentage" | "lowestDomains" | "summary" | "concernTags" | "supportNeedEstimate"
    >
  ) => {
    const timestamp = isoNow();
    const summary = buildAssessmentSummary({
      literalScore: data.literalScore,
      inferentialScore: data.inferentialScore,
      vocabularyScore: data.vocabularyScore,
      sequencingScore: data.sequencingScore,
      mainIdeaScore: data.mainIdeaScore,
      followingInstructionsScore: data.followingInstructionsScore,
      attentionDuringReadingScore: data.attentionDuringReadingScore,
      promptingNeededScore: data.promptingNeededScore,
    });
    const fresh: Assessment = {
      ...data,
      ...summary,
      id: createId("A"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setAssessments((prev) => [fresh, ...prev]);
    const latestObservation = [...observations]
      .filter((observation) => observation.learnerId === fresh.learnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestObservation) {
      createRecommendationFromPair(fresh, latestObservation, [fresh, ...assessments]);
    }
  };

  const addObservation = (data: Omit<Observation, "id" | "createdAt" | "updatedAt" | "nlpTags" | "extractedEvidence">) => {
    const timestamp = isoNow();
    const analysis = analyzeObservation(
      [...data.behaviorIndicators, ...data.communicationIndicators, ...data.concernsObserved],
      [data.learningResponse, data.narrative, data.strengthsObserved.join(" "), data.concernsObserved.join(" ")].join(" ")
    );
    const fresh: Observation = {
      ...data,
      ...analysis,
      id: createId("O"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setObservations((prev) => [fresh, ...prev]);
    const latestAssessment = [...assessments]
      .filter((assessment) => assessment.learnerId === fresh.learnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestAssessment) {
      createRecommendationFromPair(latestAssessment, fresh, assessments);
    }
  };

  const addRecommendation = (data: Omit<Recommendation, "id" | "createdAt" | "updatedAt">) => {
    const timestamp = isoNow();
    const fresh: Recommendation = {
      ...data,
      id: createId("R"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setRecommendations((prev) => [fresh, ...prev]);
  };

  const updateRecommendation = (id: string, updates: Partial<Recommendation>) => {
    setRecommendations((prev) =>
      prev.map((recommendation) => (recommendation.id === id ? { ...recommendation, ...updates, updatedAt: isoNow() } : recommendation))
    );
  };

  const addInterventionPlan = (planData: Omit<InterventionPlan, "id" | "createdAt" | "updatedAt">) => {
    const timestamp = isoNow();
    const fresh: InterventionPlan = {
      ...planData,
      id: createId("IP"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setInterventionPlans((prev) => [fresh, ...prev]);
  };

  const updateInterventionPlan = (id: string, updates: Partial<InterventionPlan>) => {
    setInterventionPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...updates, updatedAt: isoNow() } : plan)));
  };

  const addProgressRecord = (recordData: Omit<ProgressRecord, "id" | "createdAt" | "updatedAt">) => {
    const timestamp = isoNow();
    const fresh: ProgressRecord = {
      ...recordData,
      id: createId("PR"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setProgressRecords((prev) => [fresh, ...prev]);
  };

  const createRecommendationFromPair = (assessment: Assessment, observation: Observation, assessmentPool: Assessment[]) => {
    const learner = learners.find((item) => item.id === assessment.learnerId);
    if (!learner) return undefined;

    const generated: Recommendation = {
      ...buildRecommendation(learner, assessment, observation, assessmentPool.filter((entry) => entry.learnerId === learner.id)),
      id: createId("R"),
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };

    setRecommendations((prev) => {
      const exists = prev.some((recommendation) => recommendation.assessmentId === assessment.id && recommendation.observationId === observation.id);
      return exists ? prev : [generated, ...prev];
    });

    setLearners((prev) =>
      prev.map((entry) =>
        entry.id === learner.id
          ? {
              ...entry,
              supportNeeds: generated.classifiedSupportLevel,
              status: generated.progressStatus,
              updatedAt: isoNow(),
            }
          : entry
      )
    );

    return generated;
  };

  const generateRecommendationForLearner = (learnerId: string) => {
    const latestAssessment = [...assessments]
      .filter((assessment) => assessment.learnerId === learnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestObservation = [...observations]
      .filter((observation) => observation.learnerId === learnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (!latestAssessment || !latestObservation) return undefined;
    return createRecommendationFromPair(latestAssessment, latestObservation, assessments);
  };

  return (
    <DataContext.Provider
      value={{
        learners,
        addLearner,
        updateLearner,
        assessments,
        addAssessment,
        observations,
        addObservation,
        recommendations,
        addRecommendation,
        updateRecommendation,
        externalReports,
        addExternalReport,
        updateExternalReport,
        interventionPlans,
        addInterventionPlan,
        updateInterventionPlan,
        progressRecords,
        addProgressRecord,
        generateRecommendationForLearner,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

function isoNow() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

function loadRecords<T>(
  key: string,
  legacyKey: string | undefined,
  fallback: T[],
  normalize: (record: any) => T
) {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved).map(normalize);

  if (legacyKey) {
    const legacy = localStorage.getItem(legacyKey);
    if (legacy) return JSON.parse(legacy).map(normalize);
  }

  return fallback.map(normalize);
}

function normalizeLearner(record: any): Learner {
  return {
    id: record.id,
    code: record.code || "",
    displayName: record.displayName || record.code || "Learner record",
    anonymizedId: record.anonymizedId || `Learner ${record.code || record.id}`,
    privacyMode: record.privacyMode || "Named Record",
    gradeLevel: record.gradeLevel || "",
    age: Number(record.age) || 0,
    gender: record.gender || "Not disclosed",
    disabilityCategory: record.disabilityCategory || "Identified learning support need",
    diagnosisStatus: record.diagnosisStatus || "Not disclosed",
    identifiedCondition: record.identifiedCondition || "Not specified",
    communicationLevel: record.communicationLevel || "Not specified",
    attentionBehaviorSupportLevel: record.attentionBehaviorSupportLevel || "Moderate",
    sensoryLearningConsiderations: record.sensoryLearningConsiderations || [],
    currentReadingLevel: record.currentReadingLevel || "Not yet summarized",
    readingConcerns: record.readingConcerns || [],
    supportNeeds: record.supportNeeds || "Moderate Support Need",
    accommodations: record.accommodations || [],
    iepGoals: record.iepGoals || [],
    historySummary: {
      medicalHistory: record.historySummary?.medicalHistory || "",
      developmentalHistory: record.historySummary?.developmentalHistory || "",
      familyHistory: record.historySummary?.familyHistory || "",
      academicHistory: record.historySummary?.academicHistory || "",
      relatedServiceHistory: record.historySummary?.relatedServiceHistory || "",
    },
    consentStatus: record.consentStatus || "Pending",
    dataAccessSensitivity: record.dataAccessSensitivity || "Standard",
    interventionHistory: record.interventionHistory || [],
    status: record.status || "Stable",
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeExternalReport(record: any): ExternalReportSummary {
  return {
    id: record.id,
    learnerId: record.learnerId,
    reportType: record.reportType || "Other",
    availability: record.availability || "Available",
    reportDate: record.reportDate || isoNow().slice(0, 10),
    source: record.source || "",
    encodedBy: record.encodedBy || "",
    authorizedForUse: Boolean(record.authorizedForUse),
    keyFindingsSummary: record.keyFindingsSummary || "",
    existingRecommendations: record.existingRecommendations || [],
    attachmentName: record.attachmentName || "Confidential file reference pending",
    confidentialityNotice: record.confidentialityNotice || confidentialityNotice,
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeAssessment(record: any): Assessment {
  const summary = buildAssessmentSummary({
    literalScore: Number(record.literalScore) || 0,
    inferentialScore: Number(record.inferentialScore) || 0,
    vocabularyScore: Number(record.vocabularyScore) || 0,
    sequencingScore: Number(record.sequencingScore) || 0,
    mainIdeaScore: Number(record.mainIdeaScore) || 0,
    followingInstructionsScore: Number(record.followingInstructionsScore) || 0,
    attentionDuringReadingScore: Number(record.attentionDuringReadingScore) || 0,
    promptingNeededScore: Number(record.promptingNeededScore) || 0,
  });

  return {
    id: record.id,
    learnerId: record.learnerId,
    date: record.date || isoNow().slice(0, 10),
    literalScore: Number(record.literalScore) || 0,
    inferentialScore: Number(record.inferentialScore) || 0,
    vocabularyScore: Number(record.vocabularyScore) || 0,
    sequencingScore: Number(record.sequencingScore) || 0,
    mainIdeaScore: Number(record.mainIdeaScore) || 0,
    followingInstructionsScore: Number(record.followingInstructionsScore) || 0,
    attentionDuringReadingScore: Number(record.attentionDuringReadingScore) || 0,
    promptingNeededScore: Number(record.promptingNeededScore) || 0,
    responseMode: record.responseMode || "Oral",
    accommodationsUsed: record.accommodationsUsed || [],
    source: record.source || "Teacher-administered reading task",
    totalScore: Number(record.totalScore) || summary.totalScore,
    percentage: Number(record.percentage) || summary.percentage,
    lowestDomains: record.lowestDomains || summary.lowestDomains,
    concernTags: record.concernTags || summary.concernTags,
    summary: record.summary || summary.summary,
    supportNeedEstimate: record.supportNeedEstimate || summary.supportNeedEstimate,
    overrideSupportNeedEstimate: record.overrideSupportNeedEstimate,
    overrideReason: record.overrideReason || "",
    notes: record.notes || "",
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeObservation(record: any): Observation {
  const analysis = analyzeObservation(
    [...(record.behaviorIndicators || []), ...(record.communicationIndicators || []), ...(record.concernsObserved || record.indicators || [])],
    [record.learningResponse || "", record.narrative || ""].join(" ")
  );

  return {
    id: record.id,
    learnerId: record.learnerId,
    date: record.date || isoNow().slice(0, 10),
    sessionType: record.sessionType || "Classroom session",
    behaviorIndicators: record.behaviorIndicators || record.indicators || [],
    communicationIndicators: record.communicationIndicators || [],
    learningResponse: record.learningResponse || "",
    promptingLevel: record.promptingLevel || "Moderate prompting",
    accommodationsUsed: record.accommodationsUsed || [],
    strengthsObserved: record.strengthsObserved || [],
    concernsObserved: record.concernsObserved || record.indicators || [],
    nlpTags: record.nlpTags || analysis.nlpTags,
    extractedEvidence: record.extractedEvidence || analysis.extractedEvidence,
    narrative: record.narrative || "",
    teacherId: record.teacherId || "teacher-alvin",
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeRecommendation(record: any): Recommendation {
  return {
    id: record.id,
    learnerId: record.learnerId,
    date: record.date || isoNow(),
    assessmentId: record.assessmentId,
    observationId: record.observationId,
    classifiedSupportLevel: record.classifiedSupportLevel || "Moderate Support Need",
    targetConcern: record.targetConcern || "Reading comprehension support",
    recommendedStrategies: record.recommendedStrategies || [],
    suggestedFrequency: record.suggestedFrequency || record.editableFrequency || "2 to 3 guided support sessions per week",
    materialsSupportsNeeded: record.materialsSupportsNeeded || record.editableMaterials || [],
    cautionNotes: record.cautionNotes || "",
    contributingFactors: record.contributingFactors || [],
    evidence: record.evidence || [],
    dataConsidered: record.dataConsidered || ["Assessment summary", "Observation notes"],
    nlpDifficultyTags: record.nlpDifficultyTags || [],
    reasoningSteps: record.reasoningSteps || [],
    teacherReviewStatus: record.teacherReviewStatus || "Pending Review",
    validationStatus: record.validationStatus || "Draft recommendation",
    teacherNotes: record.teacherNotes || "",
    reviewedAt: record.reviewedAt,
    reviewedBy: record.reviewedBy,
    progressStatus: record.progressStatus || "Stable",
    confidence: Number(record.confidence) || 75,
    reviewedByTeacher: Boolean(record.reviewedByTeacher),
    requiresParentConfirmation: record.requiresParentConfirmation ?? true,
    parentGuardianConfirmationStatus: record.parentGuardianConfirmationStatus || "Pending",
    validationNotes: record.validationNotes || "",
    validationRecords: record.validationRecords || [],
    linkedGoal: record.linkedGoal || "",
    editableFrequency: record.editableFrequency || record.suggestedFrequency || "2 to 3 guided support sessions per week",
    editableMaterials: record.editableMaterials || record.materialsSupportsNeeded || [],
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeInterventionPlan(record: any): InterventionPlan {
  return {
    id: record.id,
    learnerId: record.learnerId,
    recommendationId: record.recommendationId,
    targetSkill: record.targetSkill || "",
    strategy: record.strategy || "",
    linkedGoal: record.linkedGoal || "",
    frequency: record.frequency || "",
    duration: record.duration || "",
    materials: record.materials || [],
    responsiblePerson: record.responsiblePerson || "",
    startDate: record.startDate || isoNow().slice(0, 10),
    reviewDate: record.reviewDate || isoNow().slice(0, 10),
    status: record.status || "Planned",
    notes: record.notes || "",
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}

function normalizeProgressRecord(record: any): ProgressRecord {
  return {
    id: record.id,
    learnerId: record.learnerId,
    interventionPlanId: record.interventionPlanId,
    progressDate: record.progressDate || isoNow().slice(0, 10),
    targetSkill: record.targetSkill || "",
    currentScore: Number(record.currentScore) || 0,
    promptingLevel: record.promptingLevel || "Moderate prompting",
    taskCompletion: record.taskCompletion || "",
    attentionEngagement: record.attentionEngagement || "",
    comprehensionAccuracy: record.comprehensionAccuracy || "",
    teacherTherapistNotes: record.teacherTherapistNotes || "",
    parentFeedback: record.parentFeedback || "",
    recommendedAction: record.recommendedAction || "Continue",
    reason: record.reason || "",
    createdAt: record.createdAt || isoNow(),
    updatedAt: record.updatedAt || record.createdAt || isoNow(),
  };
}
