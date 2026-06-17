export type SupportLevel = "Low Support Need" | "Moderate Support Need" | "High Support Need";
export type ProgressStatus = "Improving" | "Stable" | "Needs Modified Support";
export type ReviewStatus = "Pending Review" | "Approved" | "Needs Revision";
export type UserRole = "SNED Teacher" | "Reading Teacher" | "Reading Coordinator" | "School Administrator";
export type LearnerGender = "Male" | "Female" | "Other" | "Not disclosed";
export type PrivacyMode = "Named Record" | "Anonymized Record";
export type DiagnosisStatus = "Diagnosed" | "No formal diagnosis" | "For evaluation" | "Not disclosed";
export type IdentifiedCondition =
  | "Autism Spectrum Disorder"
  | "ADHD"
  | "Dyslexia"
  | "Intellectual Disability"
  | "Speech/Language Difficulty"
  | "Multiple Disabilities"
  | "Other"
  | "Not specified";
export type CommunicationLevel = "Verbal" | "Limited verbal" | "Non-verbal" | "Uses AAC/visual support" | "Not specified";
export type AttentionBehaviorSupportLevel = "Low" | "Moderate" | "High";
export type ConsentStatus = "Granted" | "Pending" | "Limited" | "Not granted";
export type DataAccessSensitivity = "Standard" | "Restricted" | "Highly restricted";
export type HistoryAvailability = "Available" | "Not available" | "For follow-up" | "Not disclosed" | "Not authorized";
export type HistorySource =
  | "Parent/guardian report"
  | "Dev Ped report"
  | "Medical record"
  | "School record"
  | "OT report"
  | "ST report"
  | "ABA report"
  | "SPED report"
  | "Teacher observation";
export type HistoryRecommendationUse = "Yes" | "No" | "Unsure" | "Restricted";
export type ReportType = "Dev Ped Report" | "Academic Assessment" | "OT Report" | "ST Report" | "ABA Report" | "SPED Report" | "Other";
export type ReportAvailability = "Available" | "Not available" | "For follow-up";
export type ResponseMode = "Oral" | "Written" | "Pointing" | "AAC" | "Assisted" | "Picture choices";
export type AssessmentSource = "Academic Assessment" | "SPED activity" | "Teacher-administered reading task" | "Therapy session" | "Dev Ped report summary";
export type SessionType = "Classroom session" | "One-on-one intervention" | "Therapy coordination" | "Home follow-up" | "Assessment review" | "Other";
export type PromptLevel = "Independent" | "Minimal prompting" | "Moderate prompting" | "High prompting";
export type TaskCompletion = "Completed" | "Partially completed" | "Not completed";
export type AttentionEngagement = "Sustained engagement" | "Occasional redirection" | "Frequent redirection" | "Unable to sustain";
export type ValidationStatus =
  | "Draft recommendation"
  | "For expert review"
  | "Expert approved"
  | "Expert revised"
  | "Expert rejected"
  | "For parent confirmation"
  | "Parent confirmed"
  | "Active intervention"
  | "Completed/Stopped";
export type ReviewerRole = UserRole | "Parent/Guardian" | "Therapist" | "SPED Coordinator" | "External Specialist";
export type InterventionStatus = "Planned" | "Active" | "Under review" | "Completed" | "Stopped";
export type ProgressAction = "Continue" | "Adjust" | "Change" | "Stop" | "Reassess";

export interface InterventionNote {
  id: string;
  date: string;
  strategy: string;
  outcome: string;
  teacherReflection: string;
}

export interface HistorySummaryEntry {
  availability: HistoryAvailability;
  source: HistorySource;
  useInRecommendation: HistoryRecommendationUse;
  shortSummary: string;
}

export interface HistorySummary {
  medicalHistory: HistorySummaryEntry;
  developmentalHistory: HistorySummaryEntry;
  familyHistory: HistorySummaryEntry;
  academicHistory: HistorySummaryEntry;
  relatedServiceHistory: HistorySummaryEntry;
}

export interface Learner {
  id: string;
  code: string;
  displayName: string;
  anonymizedId: string;
  privacyMode: PrivacyMode;
  gradeLevel: string;
  age: number;
  gender: LearnerGender;
  disabilityCategory: string;
  diagnosisStatus: DiagnosisStatus;
  identifiedCondition: IdentifiedCondition;
  communicationLevel: CommunicationLevel;
  attentionBehaviorSupportLevel: AttentionBehaviorSupportLevel;
  sensoryLearningConsiderations: string[];
  currentReadingLevel: string;
  readingConcerns: string[];
  supportNeeds: SupportLevel;
  accommodations: string[];
  iepGoals: string[];
  historySummary: HistorySummary;
  consentStatus: ConsentStatus;
  dataAccessSensitivity: DataAccessSensitivity;
  interventionHistory: InterventionNote[];
  status: ProgressStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalReportSummary {
  id: string;
  learnerId: string;
  reportType: ReportType;
  availability: ReportAvailability;
  reportDate: string;
  source: string;
  encodedBy: string;
  authorizedForUse: boolean;
  keyFindingsSummary: string;
  existingRecommendations: string[];
  attachmentName: string;
  confidentialityNotice: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  learnerId: string;
  date: string;
  literalScore: number;
  inferentialScore: number;
  vocabularyScore: number;
  sequencingScore: number;
  mainIdeaScore: number;
  followingInstructionsScore: number;
  attentionDuringReadingScore: number;
  promptingNeededScore: number;
  responseMode: ResponseMode;
  accommodationsUsed: string[];
  source: AssessmentSource;
  totalScore: number;
  percentage: number;
  lowestDomains: string[];
  concernTags: string[];
  summary: string;
  supportNeedEstimate: SupportLevel;
  overrideSupportNeedEstimate?: SupportLevel;
  overrideReason?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  learnerId: string;
  date: string;
  sessionType: SessionType;
  behaviorIndicators: string[];
  communicationIndicators: string[];
  learningResponse: string;
  promptingLevel: PromptLevel;
  accommodationsUsed: string[];
  strengthsObserved: string[];
  concernsObserved: string[];
  nlpTags: string[];
  extractedEvidence: string[];
  narrative: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationRecord {
  id: string;
  recommendationId: string;
  status: ValidationStatus;
  reviewerName: string;
  reviewerRole: ReviewerRole;
  reviewDate: string;
  notes: string;
  requiresParentConfirmation: boolean;
}

export interface Recommendation {
  id: string;
  learnerId: string;
  date: string;
  assessmentId: string;
  observationId: string;
  classifiedSupportLevel: SupportLevel;
  targetConcern: string;
  recommendedStrategies: string[];
  suggestedFrequency: string;
  materialsSupportsNeeded: string[];
  cautionNotes: string;
  contributingFactors: string[];
  evidence: string[];
  dataConsidered: string[];
  nlpDifficultyTags: string[];
  reasoningSteps: string[];
  teacherReviewStatus: ReviewStatus;
  validationStatus: ValidationStatus;
  teacherNotes: string;
  reviewedAt?: string;
  reviewedBy?: string;
  progressStatus: ProgressStatus;
  confidence: number;
  reviewedByTeacher: boolean;
  requiresParentConfirmation: boolean;
  parentGuardianConfirmationStatus: "Pending" | "Confirmed" | "Not required";
  validationNotes: string;
  validationRecords: ValidationRecord[];
  linkedGoal: string;
  editableFrequency: string;
  editableMaterials: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterventionPlan {
  id: string;
  learnerId: string;
  recommendationId: string;
  targetSkill: string;
  strategy: string;
  linkedGoal: string;
  frequency: string;
  duration: string;
  materials: string[];
  responsiblePerson: string;
  startDate: string;
  reviewDate: string;
  status: InterventionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressRecord {
  id: string;
  learnerId: string;
  interventionPlanId: string;
  progressDate: string;
  activityMaterialUsed: string;
  targetSkill: string;
  currentScore: number;
  promptingLevel: PromptLevel;
  taskCompletion: TaskCompletion;
  attentionEngagement: AttentionEngagement;
  responseMode: ResponseMode;
  totalItems: number;
  correctResponses: number;
  comprehensionAccuracy: string;
  computedAccuracy: number;
  computedProgressScore: number;
  scoreChangeFromPrevious: number | null;
  computedProgressStatus: ProgressStatus;
  systemSuggestedAction: ProgressAction;
  systemSuggestionReason: string;
  finalAction: ProgressAction;
  finalActionReason: string;
  teacherTherapistNotes: string;
  parentFeedback: string;
  recommendedAction: ProgressAction;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}
