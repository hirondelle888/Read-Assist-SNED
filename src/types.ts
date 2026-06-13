export type SupportLevel = "Low Support Need" | "Moderate Support Need" | "High Support Need";

export interface Learner {
  id: string;
  code: string;
  gradeLevel: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  readingConcerns: string[];
  supportNeeds: SupportLevel;
  accommodations: string[];
  iepGoals: string[];
  status: "Improving" | "Stable" | "Needs Modified Support";
}

export interface Assessment {
  id: string;
  learnerId: string;
  date: string;
  literalScore: number; // 0-10
  inferentialScore: number; // 0-10
  vocabularyScore: number; // 0-10
  sequencingScore: number; // 0-10
  mainIdeaScore: number; // 0-10
  totalScore: number;
  notes: string;
}

export interface Observation {
  id: string;
  learnerId: string;
  date: string;
  indicators: string[];
  narrative: string;
  teacherId: string;
}

export interface Recommendation {
  id: string;
  learnerId: string;
  date: string;
  assessmentId: string;
  observationId: string;
  classifiedSupportLevel: SupportLevel;
  recommendedStrategies: string[];
  contributingFactors: string[];
  evidence: string[];
  confidence: number;
  reviewedByTeacher: boolean;
}
