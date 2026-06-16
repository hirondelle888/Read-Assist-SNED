import {
  Assessment,
  Learner,
  Observation,
  ProgressStatus,
  Recommendation,
  SupportLevel,
} from "@/src/types";

type ScoreInput = {
  literalScore: number;
  inferentialScore: number;
  vocabularyScore: number;
  sequencingScore: number;
  mainIdeaScore: number;
  followingInstructionsScore: number;
  attentionDuringReadingScore: number;
  promptingNeededScore: number;
};

const domainLabels: Record<keyof ScoreInput, string> = {
  literalScore: "Literal Comprehension",
  inferentialScore: "Inferential Comprehension",
  vocabularyScore: "Vocabulary",
  sequencingScore: "Sequencing",
  mainIdeaScore: "Main Idea",
  followingInstructionsScore: "Following Instructions",
  attentionDuringReadingScore: "Attention During Reading Task",
  promptingNeededScore: "Prompting Needed",
};

const indicatorToTag: Record<string, string> = {
  "Difficulty Identifying Details": "literal difficulty",
  "Difficulty Understanding Vocabulary": "vocabulary difficulty",
  "Difficulty Determining Main Idea": "main idea difficulty",
  "Difficulty Sequencing Events": "sequencing difficulty",
  "Difficulty Answering Inferential Questions": "inferential difficulty",
  "Requires Frequent Prompts": "repeated instruction needed",
  "Attention During Reading": "attention difficulty",
};

const keywordRules: Array<{ tag: string; words: string[] }> = [
  { tag: "attention difficulty", words: ["attention", "focus", "distracted", "fatigue", "break", "redirection"] },
  { tag: "vocabulary difficulty", words: ["vocabulary", "word meaning", "unfamiliar word", "context clue", "word bank"] },
  { tag: "sequencing difficulty", words: ["sequence", "order", "first", "next", "last", "beginning-middle-end"] },
  { tag: "inferential difficulty", words: ["infer", "why", "how", "predict", "conclude", "hidden meaning"] },
  { tag: "visual support needed", words: ["picture", "visual", "icon", "graphic organizer", "highlight"] },
  { tag: "repeated instruction needed", words: ["repeat", "again", "reminder", "prompt", "cue"] },
  { tag: "high prompting needed", words: ["full prompt", "many prompts", "constant prompting", "high prompting"] },
  { tag: "positive response to pictures", words: ["responded to pictures", "picture choices", "visual choices", "picture support"] },
];

const recommendationMatrix: Record<string, { interventions: string[]; materials: string[]; frequency: string; caution: string }> = {
  "vocabulary difficulty": {
    interventions: ["Vocabulary preview", "Picture-word matching", "Word map routine"],
    materials: ["Picture-word cards", "Word map template", "Personal vocabulary notebook"],
    frequency: "3 focused vocabulary sessions per week",
    caution: "Preview unfamiliar words before comprehension questioning.",
  },
  "literal difficulty": {
    interventions: ["Guided WH questioning", "Picture-supported detail checks", "Short passage comprehension checks"],
    materials: ["WH question cards", "Highlight strips", "Detail checklist"],
    frequency: "3 short explicit-comprehension tasks per week",
    caution: "Keep passage length short and confirm understanding after each chunk.",
  },
  "inferential difficulty": {
    interventions: ["Guided why/how questions", "Think-aloud modeling", "Clue-based inference prompts"],
    materials: ["Inference clue chart", "Why/how cards", "Sentence-frame strip"],
    frequency: "2 to 3 guided inferential sessions per week",
    caution: "Model thinking aloud before expecting an independent inferential response.",
  },
  "sequencing difficulty": {
    interventions: ["Story maps", "Beginning-middle-end organizer", "Sequencing cards"],
    materials: ["Sequencing cards", "Story map template", "Retell strip"],
    frequency: "3 sequencing practice sessions per week",
    caution: "Use concrete visual ordering before asking for verbal retell.",
  },
  "main idea difficulty": {
    interventions: ["Graphic organizer for key details", "Main-idea highlight routine", "Repeated guided reading"],
    materials: ["Main-idea organizer", "Key-detail highlighter guide", "Summary frame"],
    frequency: "2 structured summary sessions per week",
    caution: "Teach key details first, then bridge to the main idea.",
  },
  "attention difficulty": {
    interventions: ["Chunked reading tasks", "Scheduled breaks", "Visual timer support"],
    materials: ["Visual timer", "Task checklist", "Passage chunk cards"],
    frequency: "Use in every reading session",
    caution: "Reduce task length before increasing text difficulty.",
  },
  "visual support needed": {
    interventions: ["Picture-supported questions", "Icon-based response choices", "Visual schedule reminders"],
    materials: ["Visual choice board", "Picture cue cards", "Mini visual schedule"],
    frequency: "Use during every guided reading task",
    caution: "Maintain consistent visuals across teacher and therapy sessions when possible.",
  },
  "repeated instruction needed": {
    interventions: ["Step-by-step directions", "Least-to-most prompting", "Repeated instruction with fading"],
    materials: ["One-step instruction cards", "Prompt hierarchy guide"],
    frequency: "Use during every task setup",
    caution: "Fade prompts gradually instead of increasing support indefinitely.",
  },
  "high prompting needed": {
    interventions: ["One-on-one guided practice", "Prompt fading plan", "Assisted answer choices"],
    materials: ["Prompt tracker", "Response choice strip", "Support checklist"],
    frequency: "4 short guided practice sessions per week",
    caution: "Monitor fatigue and build independence one step at a time.",
  },
  "positive response to pictures": {
    interventions: ["Picture-supported retell", "Visual organizer use", "Picture-word response choices"],
    materials: ["Picture sequence board", "Visual response mat"],
    frequency: "Integrate in targeted comprehension sessions",
    caution: "Use visual supports as access tools, not as a substitute for comprehension monitoring.",
  },
};

export function buildAssessmentSummary(scores: ScoreInput) {
  const clamped = Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, clampScore(value)])
  ) as ScoreInput;

  const totalScore =
    clamped.literalScore +
    clamped.inferentialScore +
    clamped.vocabularyScore +
    clamped.sequencingScore +
    clamped.mainIdeaScore;
  const percentage = Math.round((totalScore / 50) * 100);

  const domainEntries = [
    { label: "Literal Comprehension", score: clamped.literalScore, tag: "literal difficulty" },
    { label: "Inferential Comprehension", score: clamped.inferentialScore, tag: "inferential difficulty" },
    { label: "Vocabulary", score: clamped.vocabularyScore, tag: "vocabulary difficulty" },
    { label: "Sequencing", score: clamped.sequencingScore, tag: "sequencing difficulty" },
    { label: "Main Idea", score: clamped.mainIdeaScore, tag: "main idea difficulty" },
  ];

  const lowestDomains = domainEntries.filter((entry) => entry.score <= 5).map((entry) => entry.label);
  const concernTags = domainEntries.filter((entry) => entry.score <= 5).map((entry) => entry.tag);

  if (clamped.followingInstructionsScore <= 5) concernTags.push("repeated instruction needed");
  if (clamped.attentionDuringReadingScore <= 5) concernTags.push("attention difficulty");
  if (clamped.promptingNeededScore >= 7) concernTags.push("high prompting needed");
  if (clamped.promptingNeededScore >= 5) concernTags.push("repeated instruction needed");

  let supportNeedEstimate: SupportLevel = "Low Support Need";
  let summary = "Low support pattern: learner shows mostly independent participation with targeted reading scaffolds still helpful.";

  if (percentage < 50 || clamped.promptingNeededScore >= 7 || clamped.attentionDuringReadingScore <= 4) {
    supportNeedEstimate = "High Support Need";
    summary = "High support pattern: reading comprehension performance is limited without structured supports, prompting, or access accommodations.";
  } else if (percentage < 75 || lowestDomains.length > 0 || clamped.followingInstructionsScore <= 5) {
    supportNeedEstimate = "Moderate Support Need";
    summary = "Moderate support pattern: one or more reading-comprehension domains need targeted instructional support and monitored scaffolds.";
  }

  return {
    totalScore,
    percentage,
    lowestDomains,
    concernTags: unique(concernTags),
    summary,
    supportNeedEstimate,
  };
}

export function analyzeObservation(indicators: string[], narrative: string) {
  const normalizedNarrative = narrative.toLowerCase();
  const tags = new Set<string>();
  const extractedEvidence: string[] = [];

  indicators.forEach((indicator) => {
    const tag = indicatorToTag[indicator];
    if (tag) {
      tags.add(tag);
      extractedEvidence.push(`Selected indicator: ${indicator}.`);
    }
  });

  keywordRules.forEach((rule) => {
    const matchedWord = rule.words.find((word) => normalizedNarrative.includes(word));
    if (matchedWord) {
      tags.add(rule.tag);
      extractedEvidence.push(`Narrative includes "${matchedWord}", which suggests ${rule.tag}.`);
    }
  });

  return {
    nlpTags: Array.from(tags),
    extractedEvidence:
      extractedEvidence.length > 0
        ? extractedEvidence
        : ["No major support-indicator keywords were detected from the observation narrative."],
  };
}

export function classifySupportNeed(assessment: Assessment, observation: Observation, learner: Learner) {
  const contributingFactors = [
    `Reading summary score: ${assessment.totalScore}/50 (${assessment.percentage}%).`,
    `Assessment estimate: ${assessment.overrideSupportNeedEstimate || assessment.supportNeedEstimate}.`,
    `Observation prompting level: ${observation.promptingLevel}.`,
    `Communication level considered as context: ${learner.communicationLevel}.`,
    `Attention/behavior support considered as context: ${learner.attentionBehaviorSupportLevel}.`,
  ];

  const tagCount = observation.nlpTags.length + assessment.concernTags.length;
  const highPrompting =
    observation.promptingLevel === "High prompting" ||
    learner.attentionBehaviorSupportLevel === "High" ||
    assessment.promptingNeededScore >= 7;
  const classificationBase = assessment.overrideSupportNeedEstimate || assessment.supportNeedEstimate;

  if (classificationBase === "High Support Need" || highPrompting) {
    return {
      level: "High Support Need" as SupportLevel,
      confidence: Math.min(95, 80 + tagCount * 2),
      contributingFactors,
    };
  }

  if (classificationBase === "Moderate Support Need" || tagCount >= 2) {
    return {
      level: "Moderate Support Need" as SupportLevel,
      confidence: Math.min(90, 72 + tagCount * 2),
      contributingFactors,
    };
  }

  return {
    level: "Low Support Need" as SupportLevel,
    confidence: Math.max(65, 82 - tagCount),
    contributingFactors,
  };
}

export function determineProgressStatus(learnerAssessments: Assessment[], latestAssessment: Assessment): ProgressStatus {
  const ordered = [...learnerAssessments]
    .filter((assessment, index, array) => array.findIndex((item) => item.id === assessment.id) === index)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestIndex = ordered.findIndex((assessment) => assessment.id === latestAssessment.id);
  const previous = latestIndex > 0 ? ordered[latestIndex - 1] : undefined;

  if (!previous) {
    return latestAssessment.supportNeedEstimate === "High Support Need" ? "Needs Modified Support" : "Stable";
  }

  const difference = latestAssessment.totalScore - previous.totalScore;
  if (difference >= 5) return "Improving";
  if (difference <= -3 || latestAssessment.supportNeedEstimate === "High Support Need") return "Needs Modified Support";
  return "Stable";
}

export function buildRecommendation(
  learner: Learner,
  assessment: Assessment,
  observation: Observation,
  learnerAssessments: Assessment[]
): Omit<Recommendation, "id" | "createdAt" | "updatedAt"> {
  const classification = classifySupportNeed(assessment, observation, learner);
  const priorityTags = unique([...assessment.concernTags, ...observation.nlpTags]);
  const selectedTags = priorityTags.length > 0 ? priorityTags : ["literal difficulty"];

  const recommendedStrategies = unique(selectedTags.flatMap((tag) => recommendationMatrix[tag]?.interventions || [])).slice(0, 6);
  const materials = unique(selectedTags.flatMap((tag) => recommendationMatrix[tag]?.materials || [])).slice(0, 6);
  const frequencies = unique(selectedTags.map((tag) => recommendationMatrix[tag]?.frequency).filter(Boolean as any));
  const cautions = unique(selectedTags.map((tag) => recommendationMatrix[tag]?.caution).filter(Boolean as any));
  const progressStatus = determineProgressStatus([...learnerAssessments, assessment], assessment);
  const targetConcern = buildTargetConcern(selectedTags);

  return {
    learnerId: learner.id,
    date: new Date().toISOString(),
    assessmentId: assessment.id,
    observationId: observation.id,
    classifiedSupportLevel: classification.level,
    targetConcern,
    recommendedStrategies: recommendedStrategies.length > 0 ? recommendedStrategies : ["Teacher-guided reading comprehension support"],
    suggestedFrequency: frequencies[0] || "2 to 3 guided support sessions per week",
    materialsSupportsNeeded: materials,
    cautionNotes:
      buildCautionSummary(cautions) ||
      "Use current accommodations and review all suggestions with the expert team and parent/guardian before activation.",
    contributingFactors: classification.contributingFactors,
    evidence: [
      ...observation.extractedEvidence,
      `Current IEP/individualized goals considered: ${learner.iepGoals.slice(0, 2).join("; ") || "No goals encoded yet."}`,
      `Accommodations considered: ${learner.accommodations.slice(0, 3).join(", ") || "No accommodations encoded yet."}`,
    ],
    dataConsidered: unique([
      "Learner support profile",
      "Academic reading assessment summary",
      "Teacher/therapist observation",
      learner.consentStatus !== "Not granted" ? "Current accommodations and individualized goals" : "",
      learner.dataAccessSensitivity !== "Standard" ? "Restricted-data access safeguards" : "",
    ].filter(Boolean)),
    nlpDifficultyTags: selectedTags,
    reasoningSteps: [
      "Assessment results were summarized into reading-concern indicators and support estimates.",
      "Observation notes were tagged using rule-based support-indicator detection.",
      "Individualized goals, accommodations, communication level, and attention support were considered as planning context.",
      "Recommendations were matched to observed reading needs, not to diagnosis alone.",
      "Draft recommendations require expert validation and, when needed, parent/guardian confirmation before activation.",
    ],
    teacherReviewStatus: "Pending Review",
    validationStatus: "Draft recommendation",
    teacherNotes: "",
    progressStatus,
    confidence: classification.confidence,
    reviewedByTeacher: false,
    requiresParentConfirmation: true,
    parentGuardianConfirmationStatus: "Pending",
    validationNotes: "",
    validationRecords: [],
    linkedGoal: learner.iepGoals[0] || "No IEP-aligned goal encoded yet",
    editableFrequency: frequencies[0] || "2 to 3 guided support sessions per week",
    editableMaterials: materials,
  };
}

function buildTargetConcern(tags: string[]) {
  const readable = tags.map((tag) => tag.replace(/\b\w/g, (char) => char.toUpperCase()));
  if (readable.length === 0) return "General reading comprehension support";
  if (readable.length === 1) return readable[0];
  return `${readable[0]} with ${readable[1]}`;
}

function buildCautionSummary(items: string[]) {
  if (items.length === 0) return "";
  return items[0];
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(10, Math.max(0, Number(value)));
}
