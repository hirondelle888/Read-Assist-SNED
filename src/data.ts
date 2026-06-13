import { Learner, Assessment, Observation, Recommendation } from "./types";

export const mockLearners: Learner[] = [
  {
    id: "L-001",
    code: "RA-2026-001",
    gradeLevel: "Grade 3",
    age: 9,
    gender: "Male",
    readingConcerns: ["Vocabulary", "Inferential Comprehension"],
    supportNeeds: "High Support Need",
    accommodations: ["Visual Schedules", "Extended Time", "Read-Aloud Support"],
    iepGoals: ["Identify main characters in a simple story", "Learn 10 new sight words per week"],
    status: "Needs Modified Support",
  },
  {
    id: "L-002",
    code: "RA-2026-002",
    gradeLevel: "Grade 4",
    age: 10,
    gender: "Female",
    readingConcerns: ["Sequencing", "Main Idea"],
    supportNeeds: "Moderate Support Need",
    accommodations: ["Graphic Organizers", "Frequent Breaks"],
    iepGoals: ["Sequence 4 events from a story", "State the main idea with prompting"],
    status: "Improving",
  },
  {
    id: "L-003",
    code: "RA-2026-003",
    gradeLevel: "Grade 2",
    age: 8,
    gender: "Male",
    readingConcerns: ["Literal Comprehension"],
    supportNeeds: "Low Support Need",
    accommodations: ["Large Print", "Highlighting"],
    iepGoals: ["Answer explicit wh- questions"],
    status: "Stable",
  }
];

export const mockAssessments: Assessment[] = [
  {
    id: "A-101",
    learnerId: "L-001",
    date: "2026-05-10",
    literalScore: 6,
    inferentialScore: 2,
    vocabularyScore: 3,
    sequencingScore: 5,
    mainIdeaScore: 4,
    totalScore: 20,
    notes: "Rushed through the inferential questions. Needed breaks."
  },
  {
    id: "A-102",
    learnerId: "L-002",
    date: "2026-05-11",
    literalScore: 8,
    inferentialScore: 5,
    vocabularyScore: 6,
    sequencingScore: 3,
    mainIdeaScore: 4,
    totalScore: 26,
    notes: "Has trouble sequencing events."
  },
  {
    id: "A-103",
    learnerId: "L-003",
    date: "2026-05-12",
    literalScore: 9,
    inferentialScore: 7,
    vocabularyScore: 8,
    sequencingScore: 7,
    mainIdeaScore: 8,
    totalScore: 39,
    notes: "Doing well, minor issues with literal comprehension."
  }
];

export const mockObservations: Observation[] = [
  {
    id: "O-101",
    learnerId: "L-001",
    date: "2026-05-11",
    indicators: ["Difficulty Understanding Vocabulary", "Difficulty Answering Inferential Questions", "Requires Frequent Prompts"],
    narrative: "The learner struggled with multi-syllabic words and required visual cues to understand the story's hidden meaning.",
    teacherId: "T-01"
  },
  {
    id: "O-102",
    learnerId: "L-002",
    date: "2026-05-12",
    indicators: ["Difficulty with Sequencing", "Struggles with Retelling"],
    narrative: "Learner got confused when asked to retell the story in order.",
    teacherId: "T-01"
  },
  {
    id: "O-103",
    learnerId: "L-003",
    date: "2026-05-13",
    indicators: ["Needs extra time for literal questions"],
    narrative: "Learner eventually gets the literal questions right but needs extended time.",
    teacherId: "T-01"
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "R-101",
    learnerId: "L-001",
    date: "2026-05-12",
    assessmentId: "A-101",
    observationId: "O-101",
    classifiedSupportLevel: "High Support Need",
    recommendedStrategies: ["Vocabulary pre-teaching", "Picture-word supports", "Guided questioning", "Comprehension Monitoring Strategies"],
    contributingFactors: ["Low Inferential Comprehension Score (2/10)", "Low Vocabulary Score (3/10)"],
    evidence: ["Teacher noted 'Difficulty Understanding Vocabulary'", "Teacher noted 'Requires Frequent Prompts'"],
    confidence: 92,
    reviewedByTeacher: false
  },
  {
    id: "R-102",
    learnerId: "L-002",
    date: "2026-05-13",
    assessmentId: "A-102",
    observationId: "O-102",
    classifiedSupportLevel: "Moderate Support Need",
    recommendedStrategies: ["Graphic Organizers for Sequencing", "Story Maps", "Retelling Practice"],
    contributingFactors: ["Low Sequencing Score (3/10)"],
    evidence: ["Teacher noted 'Difficulty with Sequencing'"],
    confidence: 85,
    reviewedByTeacher: true
  },
  {
    id: "R-103",
    learnerId: "L-003",
    date: "2026-05-14",
    assessmentId: "A-103",
    observationId: "O-103",
    classifiedSupportLevel: "Low Support Need",
    recommendedStrategies: ["Extended Time", "Highlighting key text", "Peer reading"],
    contributingFactors: ["Slightly lower Literal Comprehension speed"],
    evidence: ["Teacher noted 'Needs extra time for literal questions'"],
    confidence: 95,
    reviewedByTeacher: false
  }
];
