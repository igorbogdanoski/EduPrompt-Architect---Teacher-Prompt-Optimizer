import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sliders,
  Scale
} from 'lucide-react';
import { 
  TeacherFormState, 
  PromptOptimizationResult, 
  SupportedLanguage 
} from '../types.ts';
import { PEDAGOGICAL_FRAMEWORKS } from '../constants/frameworks.ts';
import { TRANSLATIONS } from '../constants/translations.ts';
import { estimateTokenCount, formatTokenCount } from '../utils/tokenEstimator.ts';

interface FrameworkCompareViewProps {
  currentForm: TeacherFormState;
  language: SupportedLanguage;
  onAdoptResult: (adopted: PromptOptimizationResult) => void;
  currentResult: PromptOptimizationResult | null;
}

export const FrameworkCompareView: React.FC<FrameworkCompareViewProps> = ({
  currentForm,
  language,
  onAdoptResult,
  currentResult,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';

  // Config A defaults to current form frameworks
  const [frameworksA, setFrameworksA] = useState<string[]>(
    currentForm.pedagogicalFrameworks?.length > 0
      ? currentForm.pedagogicalFrameworks
      : ['bloom']
  );
  const [difficultyA, setDifficultyA] = useState<number>(currentForm.difficultyLevel || 2);

  // Config B defaults to an alternative complementary framework (e.g., 5e or udl)
  const [frameworksB, setFrameworksB] = useState<string[]>(
    currentForm.pedagogicalFrameworks?.includes('5e') ? ['bloom', 'inquiry'] : ['5e', 'udl']
  );
  const [difficultyB, setDifficultyB] = useState<number>(currentForm.difficultyLevel || 3);

  const [isComparing, setIsComparing] = useState(false);
  const [resultA, setResultA] = useState<PromptOptimizationResult | null>(null);
  const [resultB, setResultB] = useState<PromptOptimizationResult | null>(null);
  const [copiedVariant, setCopiedVariant] = useState<'A' | 'B' | null>(null);

  const toggleFrameworkA = (id: string) => {
    setFrameworksA(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(f => f !== id) : prev) : [...prev, id]
    );
  };

  const toggleFrameworkB = (id: string) => {
    setFrameworksB(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(f => f !== id) : prev) : [...prev, id]
    );
  };

  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const payloadA = {
        ...currentForm,
        pedagogicalFrameworks: frameworksA,
        difficultyLevel: difficultyA,
        language,
      };

      const payloadB = {
        ...currentForm,
        pedagogicalFrameworks: frameworksB,
        difficultyLevel: difficultyB,
        language,
      };

      const [resA, resB] = await Promise.all([
        fetch('/api/optimize-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadA),
        }).then(r => r.json()),
        fetch('/api/optimize-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadB),
        }).then(r => r.json()),
      ]);

      setResultA({
        id: `comp-a-${Date.now()}`,
        timestamp: Date.now(),
        input: payloadA,
        rawOutput: resA.rawOutput || '',
        unifiedCodeBlock: resA.unifiedCodeBlock || '',
        parsedJson: resA.parsedJson || null,
        jsonString: resA.jsonString || '',
        chainOfThought: resA.chainOfThought || '',
      });

      setResultB({
        id: `comp-b-${Date.now()}`,
        timestamp: Date.now(),
        input: payloadB,
        rawOutput: resB.rawOutput || '',
        unifiedCodeBlock: resB.unifiedCodeBlock || '',
        parsedJson: resB.parsedJson || null,
        jsonString: resB.jsonString || '',
        chainOfThought: resB.chainOfThought || '',
      });
    } catch (err) {
      console.error('Error during framework comparison:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopyVariant = async (variant: 'A' | 'B', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVariant(variant);
      setTimeout(() => setCopiedVariant(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const tokensA = resultA ? estimateTokenCount(resultA.unifiedCodeBlock) : 0;
  const tokensB = resultB ? estimateTokenCount(resultB.unifiedCodeBlock) : 0;
  const tokenDifference = tokensB - tokensA;

  return (
    <div className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-1">
      {/* Intro Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">
              {t.compareTitle}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
            {t.compareDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunComparison}
          disabled={isComparing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {isComparing ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{t.runningCompare}</span>
            </>
          ) : (
            <>
              <GitCompare className="w-3.5 h-3.5" />
              <span>{t.runCompare}</span>
            </>
          )}
        </button>
      </div>

      {/* Configuration Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Config A */}
        <div className="p-3.5 rounded-xl border border-indigo-200/70 bg-indigo-50/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              {t.configA}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
              <span>Rigor:</span>
              <select
                value={difficultyA}
                onChange={(e) => setDifficultyA(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"
              >
                <option value={1}>1 (Simple)</option>
                <option value={2}>2 (Standard)</option>
                <option value={3}>3 (Advanced)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {PEDAGOGICAL_FRAMEWORKS.map(fw => {
              const active = frameworksA.includes(fw.id);
              return (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => toggleFrameworkA(fw.id)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {isMk ? fw.nameMk.split(' ')[0] : fw.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Config B */}
        <div className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              {t.configB}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
              <span>Rigor:</span>
              <select
                value={difficultyB}
                onChange={(e) => setDifficultyB(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"
              >
                <option value={1}>1 (Simple)</option>
                <option value={2}>2 (Standard)</option>
                <option value={3}>3 (Advanced)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {PEDAGOGICAL_FRAMEWORKS.map(fw => {
              const active = frameworksB.includes(fw.id);
              return (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => toggleFrameworkB(fw.id)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {isMk ? fw.nameMk.split(' ')[0] : fw.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Difference Summary Banner (when both results are available) */}
      {resultA && resultB && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-slate-200">
              {tokenDifference === 0 ? (
                isMk ? 'Двете варијанти имаат идентична големина на токени.' : 'Both variants have identical token sizes.'
              ) : tokenDifference > 0 ? (
                isMk 
                  ? `Конфигурација Б има +${tokenDifference} повеќе токени (~${tokensB} наспроти ~${tokensA}), нудејќи подлабока когнитивна структура.`
                  : `Config B consumes +${tokenDifference} more tokens (~${tokensB} vs ~${tokensA}), offering deeper pedagogical scaffolding.`
              ) : (
                isMk
                  ? `Конфигурација А има +${Math.abs(tokenDifference)} повеќе токени (~${tokensA} наспроти ~${tokensB}), со поголема шематска деталност.`
                  : `Config A consumes +${Math.abs(tokenDifference)} more tokens (~${tokensA} vs ~${tokensB}), with greater structural detail.`
              )}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            A: ~{tokensA} tok · B: ~{tokensB} tok
          </span>
        </div>
      )}

      {/* Side-by-side Result Cards */}
      {resultA && resultB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Result Card A */}
          <div className="border border-indigo-200/80 rounded-xl bg-white shadow-2xs flex flex-col overflow-hidden">
            <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  {t.configA}
                </span>
                <span className="text-[10px] font-mono text-indigo-700">
                  ~{formatTokenCount(tokensA)} {t.tokensEstimate}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyVariant('A', resultA.unifiedCodeBlock)}
                  className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedVariant === 'A' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedVariant === 'A' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdoptResult(resultA)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.adoptVariant}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Adopt</span>
                </button>
              </div>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto max-h-[380px] text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  JSON Schema
                </span>
                <pre className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px] leading-tight overflow-x-auto">
                  <code>{resultA.jsonString}</code>
                </pre>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Chain-of-thought
                </span>
                <div className="p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/60 text-slate-800 text-[11px] leading-snug whitespace-pre-wrap">
                  {resultA.chainOfThought}
                </div>
              </div>
            </div>
          </div>

          {/* Result Card B */}
          <div className="border border-amber-200/80 rounded-xl bg-white shadow-2xs flex flex-col overflow-hidden">
            <div className="p-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  {t.configB}
                </span>
                <span className="text-[10px] font-mono text-amber-700">
                  ~{formatTokenCount(tokensB)} {t.tokensEstimate}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyVariant('B', resultB.unifiedCodeBlock)}
                  className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedVariant === 'B' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedVariant === 'B' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdoptResult(resultB)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.adoptVariant}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Adopt</span>
                </button>
              </div>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto max-h-[380px] text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  JSON Schema
                </span>
                <pre className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px] leading-tight overflow-x-auto">
                  <code>{resultB.jsonString}</code>
                </pre>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Chain-of-thought
                </span>
                <div className="p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/60 text-slate-800 text-[11px] leading-snug whitespace-pre-wrap">
                  {resultB.chainOfThought}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State before comparison run */}
      {!resultA && !resultB && !isComparing && (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
          <GitCompare className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            {isMk ? 'Подготвено за споредба на рамките' : 'Ready to compare configurations'}
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {isMk 
              ? 'Изберете различни педагошки модели за Конфигурација А и Конфигурација Б, па кликнете „Изврши симултана споредба“.'
              : 'Choose different pedagogical models for Configuration A and B above, then click "Run Side-by-Side Compare".'}
          </p>
        </div>
      )}
    </div>
  );
};
