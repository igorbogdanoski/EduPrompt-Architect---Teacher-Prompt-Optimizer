import { PromptOptimizationResult, SupportedLanguage } from '../types.ts';

export interface ComplexityAlignmentAnalysis {
  gradeBaseline: number; // 1 = Primary, 2 = Middle, 3 = Secondary
  gradeBaselineLabel: string;
  gradeBaselineLabelMk: string;
  lessonDifficulty: number; // 1.0 - 3.0
  lessonDifficultyLabel: string;
  lessonDifficultyLabelMk: string;
  alignmentPercentage: number; // 0 - 100%
  status: 'optimal' | 'stretch' | 'scaffolded' | 'mismatched';
  statusLabel: string;
  statusLabelMk: string;
  statusColor: 'emerald' | 'indigo' | 'amber' | 'rose';
  explanation: string;
  explanationMk: string;
}

/**
 * Analyzes the generated lesson plan's cognitive & vocabulary difficulty
 * and compares it directly against the teacher's selected grade level / developmental stage.
 */
export function analyzeComplexityAlignment(
  result: PromptOptimizationResult | null
): ComplexityAlignmentAnalysis {
  if (!result) {
    return {
      gradeBaseline: 2,
      gradeBaselineLabel: 'Standard Baseline',
      gradeBaselineLabelMk: 'Стандарден курикулум',
      lessonDifficulty: 2,
      lessonDifficultyLabel: 'Standard Level',
      lessonDifficultyLabelMk: 'Стандардно ниво',
      alignmentPercentage: 100,
      status: 'optimal',
      statusLabel: 'Balanced Alignment',
      statusLabelMk: 'Балансирана усогласеност',
      statusColor: 'emerald',
      explanation: 'Awaiting lesson plan generation.',
      explanationMk: 'Се очекува генерирање на наставен план.',
    };
  }

  const { input, rawOutput, chainOfThought, jsonString } = result;

  // 1. Determine Target Grade Baseline (1.0 to 3.0 scale)
  let gradeBaseline = 2.0;
  let gradeBaselineLabel = 'Middle School (Grades 6-9)';
  let gradeBaselineLabelMk = 'Предметна настава (6-9 одд.)';

  const gradeStr = (input.gradeLevel || '').toLowerCase();
  const stage = input.stage;

  if (stage === 'primary' || /(1|2|3|4|5)(то|во|ро|мо|th)?(\s*одд|\s*grade|primary|одделенска)/i.test(gradeStr)) {
    gradeBaseline = 1.0;
    gradeBaselineLabel = 'Primary / Elementary (Grades 1-5)';
    gradeBaselineLabelMk = 'Одделенска настава (1-5 одд.)';
  } else if (stage === 'secondary' || /(i|ii|iii|iv|10|11|12|9)(то|та)?(\s*год|\s*клас|high school|secondary|средно)/i.test(gradeStr)) {
    gradeBaseline = 3.0;
    gradeBaselineLabel = 'Secondary / High School (Grades 10-12)';
    gradeBaselineLabelMk = 'Средно образование (I-IV год.)';
  } else {
    gradeBaseline = 2.0;
    gradeBaselineLabel = 'Middle School (Grades 6-9)';
    gradeBaselineLabelMk = 'Предметна настава (6-9 одд.)';
  }

  // 2. Determine Actual Lesson Complexity from Difficulty setting and content cues
  const selectedDiffSetting = input.difficultyLevel || 2; // 1, 2, or 3
  const fullText = `${rawOutput} ${chainOfThought} ${jsonString}`.toLowerCase();

  // Fine-grain cognitive verification
  const hasAbstractVerbs = /(synthesize|rigor|formal proof|calculus|biochemical|quantum|derivation|матрица|дедукци)/i.test(fullText);
  const hasFoundationalVerbs = /(concrete|visual scale|flashcard|coloring|count|hands-on|вага|слика)/i.test(fullText);

  let lessonDifficulty = Number(selectedDiffSetting);
  if (selectedDiffSetting === 2) {
    if (hasAbstractVerbs && !hasFoundationalVerbs) lessonDifficulty = 2.4;
    else if (hasFoundationalVerbs && !hasAbstractVerbs) lessonDifficulty = 1.7;
  } else if (selectedDiffSetting === 1) {
    if (hasAbstractVerbs) lessonDifficulty = 1.5;
  } else if (selectedDiffSetting === 3) {
    if (hasFoundationalVerbs) lessonDifficulty = 2.7;
  }

  let lessonDifficultyLabel = 'Level 2: Standard Curriculum';
  let lessonDifficultyLabelMk = 'Ниво 2: Стандардна наставна програма';
  if (lessonDifficulty < 1.6) {
    lessonDifficultyLabel = 'Level 1: Foundational / Accessible';
    lessonDifficultyLabelMk = 'Ниво 1: Основно / Достапно скеле';
  } else if (lessonDifficulty > 2.3) {
    lessonDifficultyLabel = 'Level 3: Advanced Cognitive Rigor';
    lessonDifficultyLabelMk = 'Ниво 3: Напредна академска сложеност';
  }

  // 3. Compute Delta and Alignment Score
  const delta = lessonDifficulty - gradeBaseline;
  const absDelta = Math.abs(delta);

  let alignmentPercentage = 95;
  let status: ComplexityAlignmentAnalysis['status'] = 'optimal';
  let statusLabel = 'Optimal Developmental Alignment';
  let statusLabelMk = 'Оптимална развојна усогласеност';
  let statusColor: ComplexityAlignmentAnalysis['statusColor'] = 'emerald';
  let explanation = '';
  let explanationMk = '';

  if (absDelta <= 0.4) {
    alignmentPercentage = Math.round(98 - absDelta * 8);
    status = 'optimal';
    statusLabel = 'Harmonious Cognitive Alignment';
    statusLabelMk = 'Хармонична когнитивна усогласеност';
    statusColor = 'emerald';
    explanation = `The lesson's vocabulary and cognitive complexity are ideally matched to ${input.gradeLevel || 'this grade level'}. Students can grasp core concepts without cognitive overload.`;
    explanationMk = `Сложеноста на терминологијата и концептите е совршено усогласена со развојната возраст на учениците од ${input.gradeLevel || 'ова одделение'}, овозможувајќи оптимално усвојување без когнитивно преоптоварување.`;
  } else if (delta > 0.4 && delta <= 1.2) {
    alignmentPercentage = Math.round(88 - (delta - 0.4) * 12);
    status = 'stretch';
    statusLabel = 'Productive Cognitive Challenge (+Stretch)';
    statusLabelMk = 'Продуктивен когнитивен предизвик (+Предизвик)';
    statusColor = 'indigo';
    explanation = `The lesson introduces higher-order terminology with built-in scaffolding, providing an engaging cognitive stretch for ${input.gradeLevel || 'students'}.`;
    explanationMk = `Часот воведува поими од повисок ред со поддржувачко скеле, што претставува одличен когнитивен поттик за напредните цели на учениците од ${input.gradeLevel || 'ова одделение'}.`;
  } else if (delta < -0.4 && delta >= -1.2) {
    alignmentPercentage = Math.round(88 - (Math.abs(delta) - 0.4) * 12);
    status = 'scaffolded';
    statusLabel = 'Accessible Foundation Scaffold (-Supported)';
    statusLabelMk = 'Прилагодено достапно скеле (-Поддршка)';
    statusColor = 'amber';
    explanation = `The lesson utilizes simplified vocabulary and concrete visual models, ideal for students requiring reinforced foundations or remediation.`;
    explanationMk = `Часот користи поедноставен речник и конкретни визуелни модели, што е идеално за инклузивна поддршка и совладување на базичните предзнаења.`;
  } else {
    alignmentPercentage = Math.max(62, Math.round(75 - absDelta * 10));
    status = 'mismatched';
    statusLabel = 'Cognitive Demand Disparity';
    statusLabelMk = 'Разлика во когнитивната побарувачка';
    statusColor = 'rose';
    explanation = `Significant gap between grade baseline (${gradeBaselineLabel}) and selected difficulty (${lessonDifficultyLabel}). Review differentiation settings.`;
    explanationMk = `Забележана е поголема разлика помеѓу базното одделение (${gradeBaselineLabelMk}) и избраната сложеност (${lessonDifficultyLabelMk}). Се препорачува преглед на диференцијацијата.`;
  }

  return {
    gradeBaseline,
    gradeBaselineLabel,
    gradeBaselineLabelMk,
    lessonDifficulty,
    lessonDifficultyLabel,
    lessonDifficultyLabelMk,
    alignmentPercentage,
    status,
    statusLabel,
    statusLabelMk,
    statusColor,
    explanation,
    explanationMk,
  };
}
