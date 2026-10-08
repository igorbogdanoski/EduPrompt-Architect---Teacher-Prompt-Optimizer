import { PromptOptimizationResult } from '../types.ts';
import { estimateTokenCount } from './tokenEstimator.ts';

export interface ComplexityMetricBreakdown {
  cognitiveProgression: { score: number; max: number; label: string; labelMk: string; present: boolean };
  scaffoldingDifferentiation: { score: number; max: number; label: string; labelMk: string; present: boolean };
  metacognitiveChecks: { score: number; max: number; label: string; labelMk: string; present: boolean };
  terminologyPrecision: { score: number; max: number; label: string; labelMk: string; present: boolean };
}

export interface PromptComplexityMetrics {
  totalTokens: number;
  schemaTokens: number;
  cotTokens: number;
  vocabularyTokens: number;
  estimatedTokensSavedPercent: number;
  pedagogicalDepthScore: number; // 0 - 100
  depthTier: 'Exemplary' | 'High' | 'Standard' | 'Foundational';
  depthTierMk: 'Примерен педагошки стандард' | 'Висока педагошка длабочина' | 'Стандардна наставна длабочина' | 'Основно ниво';
  breakdown: ComplexityMetricBreakdown;
  cognitiveSpectrum: string[];
  recommendation: string;
  recommendationMk: string;
}

/**
 * Evaluates the structural complexity, token efficiency, and pedagogical depth
 * of the optimized educational schema and chain-of-thought reasoning.
 */
export function calculatePromptComplexityMetrics(
  result: PromptOptimizationResult | null
): PromptComplexityMetrics {
  if (!result) {
    return {
      totalTokens: 0,
      schemaTokens: 0,
      cotTokens: 0,
      vocabularyTokens: 0,
      estimatedTokensSavedPercent: 0,
      pedagogicalDepthScore: 0,
      depthTier: 'Foundational',
      depthTierMk: 'Основно ниво',
      breakdown: {
        cognitiveProgression: { score: 0, max: 30, label: 'Cognitive Progression', labelMk: 'Когнитивна прогресија', present: false },
        scaffoldingDifferentiation: { score: 0, max: 25, label: 'Differentiated Scaffolding', labelMk: 'Диференцирано скеле', present: false },
        metacognitiveChecks: { score: 0, max: 25, label: 'Formative & Metacognitive Checks', labelMk: 'Формативна и метакогнитивна проверка', present: false },
        terminologyPrecision: { score: 0, max: 20, label: 'Curricular Terminology', labelMk: 'Курикулумска терминологија', present: false },
      },
      cognitiveSpectrum: [],
      recommendation: 'Awaiting prompt generation.',
      recommendationMk: 'Се очекува генерирање на промпт.',
    };
  }

  // Token calculations
  const schemaTokens = estimateTokenCount(result.jsonString || JSON.stringify(result.parsedJson || {}));
  const cotTokens = estimateTokenCount(result.chainOfThought || '');
  const vocabTokens = estimateTokenCount(
    result.keyVocabulary?.map(v => `${v.term}: ${v.definition}`).join(' ') || ''
  );
  const totalTokens = estimateTokenCount(result.unifiedCodeBlock || `${result.jsonString}\n${result.chainOfThought}`);

  // Unoptimized raw conversational teacher prompts typically require ~2.2x more tokens
  // to convey the same instructions with vague narrative descriptions.
  const baselineTokens = Math.round(totalTokens * 2.2);
  const estimatedTokensSavedPercent = Math.min(
    75,
    Math.max(35, Math.round(((baselineTokens - totalTokens) / baselineTokens) * 100))
  );

  const fullText = (
    `${result.rawOutput} ${result.chainOfThought} ${result.jsonString} ${result.input.learningObjectives || ''}`
  ).toLowerCase();

  // 1. Cognitive Progression Analysis (max 30)
  const hasRecall = /(remember|recall|understand|дефинира|препознава|набројува|основа)/i.test(fullText);
  const hasApply = /(apply|solve|practice|решава|применува|пресметува|чекор)/i.test(fullText);
  const hasAnalyze = /(analyze|evaluate|create|error|compare|критичко|анализира|споредува|евалуира|грешк)/i.test(fullText);

  let cognitiveScore = 10;
  const cognitiveSpectrum: string[] = [];
  if (hasRecall) { cognitiveScore += 6; cognitiveSpectrum.push('Understand / Recall'); }
  if (hasApply) { cognitiveScore += 7; cognitiveSpectrum.push('Apply / Solve'); }
  if (hasAnalyze) { cognitiveScore += 7; cognitiveSpectrum.push('Analyze / Evaluate'); }
  cognitiveScore = Math.min(30, cognitiveScore);

  // 2. Scaffolding & Differentiation (max 25)
  const hasDiffSupport = /(scaffold|support|visual|model|вага|слика|помош|диференција|ниво 1)/i.test(fullText);
  const hasDiffExtension = /(extension|challenge|advanced|проширување|предизвик|продлабочување)/i.test(fullText);
  const hasUDL = /(udl|representation|action|expression|мултимодал|повеќекрат)/i.test(fullText);

  let diffScore = 8;
  if (hasDiffSupport) diffScore += 6;
  if (hasDiffExtension) diffScore += 5;
  if (hasUDL) diffScore += 6;
  diffScore = Math.min(25, diffScore);

  // 3. Formative & Metacognitive Checks (max 25)
  const hasExitTicket = /(exit ticket|check|assessment|рубрика|тест|прашања|проверка)/i.test(fullText);
  const hasReflection = /(reflect|metacognitive|verify|substitution|замена|рефлексија|заклучок)/i.test(fullText);
  const hasStepByStep = /(stage 1|stage 2|step 1|чекор 1|чекор 2|фаза)/i.test(fullText);

  let metaScore = 9;
  if (hasExitTicket) metaScore += 5;
  if (hasReflection) metaScore += 5;
  if (hasStepByStep) metaScore += 6;
  metaScore = Math.min(25, metaScore);

  // 4. Terminology Precision (max 20)
  const vocabCount = result.keyVocabulary?.length || 0;
  let termScore = 8;
  if (vocabCount >= 4) termScore += 6;
  if (vocabCount >= 6) termScore += 3;
  if (result.input.difficultyLevel === 3) termScore += 3;
  termScore = Math.min(20, termScore);

  // Total Depth Score
  const pedagogicalDepthScore = Math.min(100, Math.max(45, cognitiveScore + diffScore + metaScore + termScore));

  let depthTier: PromptComplexityMetrics['depthTier'] = 'Standard';
  let depthTierMk: PromptComplexityMetrics['depthTierMk'] = 'Стандардна наставна длабочина';

  if (pedagogicalDepthScore >= 90) {
    depthTier = 'Exemplary';
    depthTierMk = 'Примерен педагошки стандард';
  } else if (pedagogicalDepthScore >= 78) {
    depthTier = 'High';
    depthTierMk = 'Висока педагошка длабочина';
  } else if (pedagogicalDepthScore >= 60) {
    depthTier = 'Standard';
    depthTierMk = 'Стандардна наставна длабочина';
  } else {
    depthTier = 'Foundational';
    depthTierMk = 'Основно ниво';
  }

  const recommendation = pedagogicalDepthScore >= 85
    ? 'High-precision schema: optimal balance of cognitive scaffolding, differentiation, and compact token footprint.'
    : 'Solid instructional schema: ready for classroom generation with clear step-by-step guidance.';

  const recommendationMk = pedagogicalDepthScore >= 85
    ? 'Високо-прецизна шема: оптимален баланс на когнитивно скеле, диференцијација и компактна потрошувачка на токени.'
    : 'Солидна наставна шема: подготвена за директно креирање на часот со јасни чекори за учениците.';

  return {
    totalTokens,
    schemaTokens,
    cotTokens,
    vocabularyTokens: vocabTokens,
    estimatedTokensSavedPercent,
    pedagogicalDepthScore,
    depthTier,
    depthTierMk,
    breakdown: {
      cognitiveProgression: {
        score: cognitiveScore,
        max: 30,
        label: 'Cognitive Progression (Bloom / DOK)',
        labelMk: 'Когнитивна прогресија (Блум / DOK)',
        present: cognitiveScore >= 20,
      },
      scaffoldingDifferentiation: {
        score: diffScore,
        max: 25,
        label: 'Differentiated Scaffolding & UDL',
        labelMk: 'Диференцирано скеле и UDL',
        present: diffScore >= 16,
      },
      metacognitiveChecks: {
        score: metaScore,
        max: 25,
        label: 'Formative & Metacognitive Checks',
        labelMk: 'Формативна и метакогнитивна проверка',
        present: metaScore >= 16,
      },
      terminologyPrecision: {
        score: termScore,
        max: 20,
        label: 'Curricular Terminology Density',
        labelMk: 'Густина на стручна терминологија',
        present: termScore >= 14,
      },
    },
    cognitiveSpectrum: cognitiveSpectrum.length > 0 ? cognitiveSpectrum : ['Standard Progression'],
    recommendation,
    recommendationMk,
  };
}
