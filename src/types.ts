export type EducationStage = 'primary' | 'middle' | 'secondary';

export type SupportedLanguage = 'mk' | 'en';

export interface PedagogicalFrameworkOption {
  id: string;
  name: string;
  nameMk: string;
  category: 'cognitive' | 'instructional' | 'inclusive' | 'inquiry';
  description: string;
  descriptionMk: string;
}

export interface LessonTimelinePhase {
  phase: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  formativeCheckpoint?: string;
  pedagogicalRationale?: string;
}

export interface VisualAssetOptimization {
  printResolution?: string; // e.g., "300 DPI Vector (CMYK/Monochrome safe)"
  digitalPayload?: string;   // e.g., "< 15 KB Lightweight SVG"
  aspectRatio?: string;      // e.g., "16:9 widescreen" or "4:3 standard"
  colorSafety?: string;      // e.g., "High-contrast WCAG AAA & Color-blind friendly"
  cognitiveClarity?: string; // e.g., "Zero visual slop, high signal-to-noise ratio"
}

export interface VisualAssetSpec {
  id?: string;
  assetType: 'technical_schematics' | 'timeline' | 'process_diagram' | 'geometric_diagram' | 'concept_model' | 'infographic' | 'technical_drawing' | 'illustration' | 'function_graph' | string;
  title: string;
  pedagogicalPurpose: string; // Dual coding, cognitive load reduction, concrete bridge
  targetMisconception?: string; // Specific misconception addressed
  pedagogicalRationale?: string; // In-depth rationale explaining learning mechanisms
  nanobananaPrompt: string;  // Precise AI prompt engineered for NanoBanana AI vector renderer
  tikzCode?: string;         // Clean LaTeX TikZ / PGFPlots code snippet
  svgSnippet?: string;       // Inline clean SVG code snippet
  recommendedFormat: 'SVG' | 'TikZ' | 'PNG_300DPI' | 'WebP' | string;
  accessibilityNotes?: string;
  optimizationDetails?: VisualAssetOptimization;
}

export interface VisualAssetSettings {
  includeVisuals: boolean;
  visualType: string;         // 'technical_schematics' | 'timeline' | 'process_diagram' | 'geometric_diagram' | 'concept_model' | 'infographic'
  pedagogicalIntent: string;  // 'dual_coding' | 'cognitive_load' | 'concrete_bridge' | 'scaffolding' | 'misconception'
  visualStyle: string;        // 'nanobanana_vector' | 'tikz_academic' | 'clean_svg'
  accessibilityPalette: string; // 'high_contrast' | 'colorblind_safe' | 'print_monochrome'
  detailLevel: string;        // 'minimal' | 'standard' | 'detailed'
  targetMisconception?: string; // Common student error targeted by diagram
  customFocusNotes?: string;  // Explicit elements to label
  previewThumbnail?: VisualAssetSpec | null;
}

export interface AdaptiveDifficultyEvaluation {
  suggestedLevel: number; // 1 to 5
  levelName: string;
  levelNameMk: string;
  rationale: string;
  rationaleMk: string;
  cognitiveLoadScore?: number; // 1 - 10
  recommendedFocus?: string;
  recommendedFocusMk?: string;
}

export interface TeacherFormState {
  subject: string;
  gradeLevel: string;
  stage: EducationStage;
  taskType: string;
  topic: string;
  learningObjectives: string;
  pedagogicalFrameworks: string[];
  studentProfile: string;
  lessonDuration: string;
  materialsAndTech: string;
  customNotes: string;
  difficultyLevel: number; // 1 = Foundations, 2 = Developing, 3 = Proficient, 4 = Advanced, 5 = Mastery
  autoAdaptiveDifficulty?: boolean;
  adaptiveRationale?: string;
  visualSettings?: VisualAssetSettings;
}

export interface ComparisonVariant {
  label: string;
  frameworks: string[];
  difficultyLevel: number;
  result: PromptOptimizationResult | null;
  isLoading: boolean;
}

export interface VocabularyTerm {
  term: string;
  definition: string;
  gradeRelevance?: string;
}

export interface ToTBranch {
  name: string;
  framework: string;
  rationale: string;
  studentAlignmentScore: number;
  pros: string[];
  cons: string[];
}

export interface ToTEvaluation {
  branches: ToTBranch[];
  selectedBranch: string;
  selectionJustification: string;
}

export interface PromptOptimizationResult {
  id: string;
  timestamp: number;
  input: TeacherFormState;
  rawOutput: string;
  unifiedCodeBlock: string;
  parsedJson: Record<string, any> | null;
  jsonString: string;
  chainOfThought: string;
  generatedMaterial?: string;
  materialLoading?: boolean;
  keyVocabulary?: VocabularyTerm[];
  totEvaluation?: ToTEvaluation;
  timeline?: LessonTimelinePhase[];
  visualAssets?: VisualAssetSpec[];
  adaptiveDifficultyResult?: AdaptiveDifficultyEvaluation;
}

export interface SavedPromptItem {
  id: string;
  title: string;
  timestamp: number;
  stage: EducationStage;
  subject: string;
  taskType: string;
  unifiedCodeBlock: string;
  parsedJson: Record<string, any> | null;
  chainOfThought: string;
  keyVocabulary?: VocabularyTerm[];
  frameworks?: string[];
  difficultyLevel?: number;
  gradeLevel?: string;
  topic?: string;
}

export interface TemplatePreset {
  id: string;
  title: string;
  titleMk: string;
  subtitle: string;
  subtitleMk: string;
  state: TeacherFormState;
}
