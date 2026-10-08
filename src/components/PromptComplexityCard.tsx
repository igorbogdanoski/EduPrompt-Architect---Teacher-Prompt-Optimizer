import React, { useState } from 'react';
import { 
  Gauge, 
  Layers, 
  Cpu, 
  Award, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Scale,
  Target,
  Check
} from 'lucide-react';
import { PromptOptimizationResult, SupportedLanguage } from '../types.ts';
import { calculatePromptComplexityMetrics } from '../utils/promptComplexity.ts';
import { analyzeComplexityAlignment } from '../utils/complexityAlignment.ts';
import { formatTokenCount } from '../utils/tokenEstimator.ts';

interface PromptComplexityCardProps {
  result: PromptOptimizationResult | null;
  language: SupportedLanguage;
}

export const PromptComplexityCard: React.FC<PromptComplexityCardProps> = ({
  result,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMk = language === 'mk';

  if (!result) return null;

  const metrics = calculatePromptComplexityMetrics(result);
  const alignment = analyzeComplexityAlignment(result);

  // Score styling
  const scoreColor = metrics.pedagogicalDepthScore >= 90
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : metrics.pedagogicalDepthScore >= 75
    ? 'text-indigo-700 bg-indigo-50 border-indigo-300'
    : 'text-amber-700 bg-amber-50 border-amber-300';

  const barColor = metrics.pedagogicalDepthScore >= 90
    ? 'bg-emerald-500'
    : metrics.pedagogicalDepthScore >= 75
    ? 'bg-indigo-600'
    : 'bg-amber-500';

  const alignmentBadgeColor = alignment.status === 'optimal'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : alignment.status === 'stretch'
    ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
    : alignment.status === 'scaffolded'
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-rose-100 text-rose-800 border-rose-300';

  const alignmentBarColor = alignment.status === 'optimal'
    ? 'bg-emerald-500'
    : alignment.status === 'stretch'
    ? 'bg-indigo-600'
    : alignment.status === 'scaffolded'
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Top Header & Summary Bar */}
      <div className="p-4 sm:p-4.5 bg-linear-to-r from-slate-50/90 via-indigo-50/30 to-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Gauge className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                {isMk ? 'Метрики за комплексност и педагошка длабочина' : 'Prompt Complexity & Pedagogical Depth Metrics'}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                AI Optimization Quality
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMk 
                ? 'Евалуација на потрошувачката на токени, когнитивната густина и педагошкото скеле.'
                : 'Quantitative evaluation of token efficiency, cognitive rigor, and scaffolding structure.'}
            </p>
          </div>
        </div>

        {/* Quick Summary Pill & Expand Toggle */}
        <div className="flex items-center gap-2">
          {/* Pedagogical Depth Score Badge */}
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 font-bold text-xs shadow-2xs ${scoreColor}`}>
            <Award className="w-3.5 h-3.5" />
            <span>{metrics.pedagogicalDepthScore}/100</span>
            <span className="text-[10px] font-medium opacity-80 hidden sm:inline">
              · {isMk ? metrics.depthTierMk : metrics.depthTier}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title={isExpanded ? 'Collapse metrics' : 'Expand full complexity breakdown'}
          >
            <span className="text-[11px] font-medium hidden sm:inline">{isExpanded ? (isMk ? 'Сокриј' : 'Hide') : (isMk ? 'Детали' : 'Details')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Key Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/40">
        {/* Metric 1: Total Tokens */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isMk ? 'Вкупно токени' : 'Total Tokens'}</span>
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
            ~{formatTokenCount(metrics.totalTokens)}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {isMk ? 'Шема' : 'Schema'}: {formatTokenCount(metrics.schemaTokens)} · CoT: {formatTokenCount(metrics.cotTokens)}
          </div>
        </div>

        {/* Metric 2: Pedagogical Depth Score */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMk ? 'Педагошка длабочина' : 'Depth Score'}</span>
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
            {metrics.pedagogicalDepthScore}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${metrics.pedagogicalDepthScore}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Token Optimization Savings */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMk ? 'Заштеда на контекст' : 'Context Efficiency'}</span>
            </span>
          </div>
          <div className="text-base font-extrabold text-emerald-700 tracking-tight font-mono">
            ~{metrics.estimatedTokensSavedPercent}%
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {isMk ? 'покомпактно од наративен текст' : 'vs raw narrative prompt'}
          </div>
        </div>

        {/* Metric 4: Cognitive Spectrum */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>{isMk ? 'Блумов спектар' : 'Cognitive Spectrum'}</span>
            </span>
          </div>
          <div className="text-xs font-bold text-slate-800 truncate" title={metrics.cognitiveSpectrum.join(' → ')}>
            {metrics.cognitiveSpectrum.length} {isMk ? 'активни фази' : 'Active Tiers'}
          </div>
          <div className="flex items-center gap-1 overflow-hidden text-[9.5px]">
            {metrics.cognitiveSpectrum.map((spec, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium truncate">
                {spec.split('/')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual 'Complexity Alignment' Gauge */}
      <div className="p-4 border-t border-slate-100 bg-linear-to-r from-emerald-50/30 via-white to-indigo-50/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              {isMk ? 'Усогласеност на сложеноста (Complexity Alignment Gauge)' : 'Complexity Alignment Gauge'}
            </h4>
          </div>

          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${alignmentBadgeColor}`}>
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{alignment.alignmentPercentage}% {isMk ? alignment.statusLabelMk : alignment.statusLabel}</span>
          </div>
        </div>

        {/* Balance Track and Nodes */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isMk ? 'Базно одделение:' : 'Target Grade:'} <strong>{isMk ? alignment.gradeBaselineLabelMk : alignment.gradeBaselineLabel}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{isMk ? 'Сложеност на часот:' : 'Lesson Complexity:'} <strong>{isMk ? alignment.lessonDifficultyLabelMk : alignment.lessonDifficultyLabel}</strong></span>
            </div>
          </div>

          {/* Visual Progress Arc/Meter */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${alignmentBarColor}`}
                style={{ width: `${alignment.alignmentPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
              <span>{isMk ? 'Ниво 1: Основно' : 'Tier 1: Foundational'}</span>
              <span>{isMk ? 'Ниво 2: Стандардно (Баланс)' : 'Tier 2: Standard (Balance)'}</span>
              <span>{isMk ? 'Ниво 3: Напредно' : 'Tier 3: Advanced'}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-sans pt-1 border-t border-slate-200/60">
            {isMk ? alignment.explanationMk : alignment.explanation}
          </p>
        </div>
      </div>

      {/* Expanded Breakdown Accordion */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-white space-y-4 text-xs">
          {/* Pedagogical Dimensions Progress Grid */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{isMk ? 'Димензии на педагошкиот квалитет:' : 'Pedagogical Quality Dimensions:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Dim 1: Cognitive Progression */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">
                    {isMk ? metrics.breakdown.cognitiveProgression.labelMk : metrics.breakdown.cognitiveProgression.label}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {metrics.breakdown.cognitiveProgression.score}/{metrics.breakdown.cognitiveProgression.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${(metrics.breakdown.cognitiveProgression.score / metrics.breakdown.cognitiveProgression.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 2: Scaffolding & Differentiation */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">
                    {isMk ? metrics.breakdown.scaffoldingDifferentiation.labelMk : metrics.breakdown.scaffoldingDifferentiation.label}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {metrics.breakdown.scaffoldingDifferentiation.score}/{metrics.breakdown.scaffoldingDifferentiation.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(metrics.breakdown.scaffoldingDifferentiation.score / metrics.breakdown.scaffoldingDifferentiation.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 3: Formative & Metacognitive Checks */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">
                    {isMk ? metrics.breakdown.metacognitiveChecks.labelMk : metrics.breakdown.metacognitiveChecks.label}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {metrics.breakdown.metacognitiveChecks.score}/{metrics.breakdown.metacognitiveChecks.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${(metrics.breakdown.metacognitiveChecks.score / metrics.breakdown.metacognitiveChecks.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Dim 4: Terminology Precision */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">
                    {isMk ? metrics.breakdown.terminologyPrecision.labelMk : metrics.breakdown.terminologyPrecision.label}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {metrics.breakdown.terminologyPrecision.score}/{metrics.breakdown.terminologyPrecision.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(metrics.breakdown.terminologyPrecision.score / metrics.breakdown.terminologyPrecision.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2 text-indigo-950">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold">{isMk ? 'Педагошка оценка:' : 'Optimization Assessment:'} </span>
              <span>{isMk ? metrics.recommendationMk : metrics.recommendation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
