import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Code, 
  Eye, 
  Play, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  FileText, 
  Sparkles,
  Printer,
  FileDown,
  Clock,
  Mail,
  FileCode
} from 'lucide-react';
import { 
  PromptOptimizationResult, 
  SupportedLanguage 
} from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';
import { exportElementToPdf } from '../utils/pdfExport.ts';
import { estimateTokenCount, formatTokenCount } from '../utils/tokenEstimator.ts';
import { calculateLessonMetrics } from '../utils/readingMetrics.ts';
import { PrintableLessonDocument } from './PrintableLessonDocument.tsx';
import { TokenHistoryChart } from './TokenHistoryChart.tsx';
import { FrameworkCompareView } from './FrameworkCompareView.tsx';
import { EmailShareModal } from './EmailShareModal.tsx';
import { PromptComplexityCard } from './PromptComplexityCard.tsx';
import { LessonTimelineCard } from './LessonTimelineCard.tsx';
import { VisualAssetsCard } from './VisualAssetsCard.tsx';
import { SavedPromptItem, TeacherFormState } from '../types.ts';
import { GitCompare, Layers, Palette } from 'lucide-react';

interface OutputConsoleProps {
  result: PromptOptimizationResult | null;
  history?: SavedPromptItem[];
  currentForm: TeacherFormState;
  onAdoptResult?: (result: PromptOptimizationResult) => void;
  isLoading: boolean;
  onRunTest: () => void;
  isTesting: boolean;
  onSavePrompt: () => void;
  isSaved: boolean;
  language: SupportedLanguage;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  result,
  history = [],
  currentForm,
  onAdoptResult,
  isLoading,
  onRunTest,
  isTesting,
  onSavePrompt,
  isSaved,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'unified' | 'inspector' | 'timeline' | 'visuals' | 'compare' | 'sandbox'>('unified');
  const [copiedUnified, setCopiedUnified] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCot, setCopiedCot] = useState(false);
  const [copiedMaterial, setCopiedMaterial] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Token calculations
  const totalTokens = estimateTokenCount(result?.unifiedCodeBlock);
  const jsonTokens = estimateTokenCount(result?.jsonString);
  const cotTokens = estimateTokenCount(result?.chainOfThought);

  // Lesson duration & reading metrics for generated content
  const lessonMetrics = calculateLessonMetrics(result?.generatedMaterial || '');

  const handleCopyUnified = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.unifiedCodeBlock);
      setCopiedUnified(true);
      setTimeout(() => setCopiedUnified(false), 2200);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (e) {
      console.error('Failed to copy JSON', e);
    }
  };

  const handleCopyCot = async () => {
    if (!result?.chainOfThought) return;
    try {
      await navigator.clipboard.writeText(result.chainOfThought);
      setCopiedCot(true);
      setTimeout(() => setCopiedCot(false), 2000);
    } catch (e) {
      console.error('Failed to copy Chain-of-thought', e);
    }
  };

  const handleCopyMaterial = async () => {
    if (!result?.generatedMaterial) return;
    try {
      await navigator.clipboard.writeText(result.generatedMaterial);
      setCopiedMaterial(true);
      setTimeout(() => setCopiedMaterial(false), 2000);
    } catch (e) {
      console.error('Failed to copy material', e);
    }
  };

  // Download full educational package (JSON schema + pedagogical reasoning) as .txt
  const handleDownloadTxt = () => {
    if (!result) return;
    const divider = '='.repeat(72);
    const subDivider = '-'.repeat(72);
    const lines: string[] = [
      divider,
      'EDUPROMPT ARCHITECT - EDUCATIONAL SPECIFICATION & PROMPT',
      divider,
      `Subject: ${result.input.subject || 'General'}`,
      `Grade / Level: ${result.input.gradeLevel || 'K-12'}`,
      `Topic: ${result.input.topic || 'Lesson Plan'}`,
      `Educational Task: ${result.input.taskType || 'Lesson Plan'}`,
      `Pedagogical Framework: ${Array.isArray(result.input.pedagogicalFrameworks) ? result.input.pedagogicalFrameworks.join(', ') : "Bloom's Taxonomy"}`,
      `Exported on: ${new Date().toLocaleString()}`,
      '',
      subDivider,
      '1. MINIMAL EDUCATIONAL JSON SCHEMA',
      subDivider,
      result.jsonString || JSON.stringify(result.parsedJson, null, 2),
      '',
      subDivider,
      "2. PEDAGOGICAL CHAIN-OF-THOUGHT REASONING (BLOOM'S TAXONOMY)",
      subDivider,
      result.chainOfThought || '(None)',
      '',
    ];

    if (result.keyVocabulary && result.keyVocabulary.length > 0) {
      lines.push(
        subDivider,
        '3. KEY VOCABULARY & TERMINOLOGY',
        subDivider,
        ...result.keyVocabulary.map(v => `• ${v.term}: ${v.definition}${v.gradeRelevance ? ` [${v.gradeRelevance}]` : ''}`),
        ''
      );
    }

    if (result.generatedMaterial) {
      lines.push(
        subDivider,
        '4. CLASSROOM-READY LESSON MATERIAL',
        subDivider,
        result.generatedMaterial,
        ''
      );
    }

    lines.push(divider);

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (result.input.topic || result.input.subject || 'lesson')
      .toLowerCase()
      .replace(/[^a-z0-9а-яёієґ]+/gi, '-')
      .slice(0, 30);
    a.href = url;
    a.download = `eduprompt-${safeTopic}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download structured educational package (JSON schema + pedagogical reasoning) as .json
  const handleDownloadJson = () => {
    if (!result) return;
    const exportData = {
      metadata: {
        generator: 'EduPrompt Architect',
        timestamp: new Date().toISOString(),
        subject: result.input.subject || 'General',
        gradeLevel: result.input.gradeLevel || 'K-12',
        topic: result.input.topic || 'Lesson',
        taskType: result.input.taskType || 'Lesson Plan',
        pedagogicalFrameworks: result.input.pedagogicalFrameworks || [],
        difficultyLevel: result.input.difficultyLevel || 2,
      },
      jsonSchema: result.parsedJson || (result.jsonString ? JSON.parse(result.jsonString) : null),
      pedagogicalReasoning: result.chainOfThought || '',
      keyVocabulary: result.keyVocabulary || [],
      generatedMaterial: result.generatedMaterial || null,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (result.input.topic || result.input.subject || 'lesson')
      .toLowerCase()
      .replace(/[^a-z0-9а-яёієґ]+/gi, '-')
      .slice(0, 30);
    a.href = url;
    a.download = `eduprompt-schema-${safeTopic}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download just the minimal JSON schema as schema.json
  const handleDownloadSchemaOnly = () => {
    if (!result) return;
    const content = result.jsonString || JSON.stringify(result.parsedJson, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (result.input.topic || 'schema').toLowerCase().replace(/[^a-z0-9а-яёієґ]+/gi, '-').slice(0, 25);
    a.href = url;
    a.download = `schema-${safeTopic}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download just the Chain-of-thought as reasoning.txt
  const handleDownloadCotOnly = () => {
    if (!result?.chainOfThought) return;
    const blob = new Blob([result.chainOfThought], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (result.input.topic || 'reasoning').toLowerCase().replace(/[^a-z0-9а-яёієґ]+/gi, '-').slice(0, 25);
    a.href = url;
    a.download = `pedagogical-reasoning-${safeTopic}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintMaterial = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf({
        elementId: 'printable-lesson-doc',
        subject: result.input.subject || 'Lesson',
        topic: result.input.topic || 'Plan',
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback directly to browser print dialog
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full min-h-[580px]">
      {/* Console Top Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.outputConsoleTitle}
            </h2>
            {result && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {result.input.subject || 'General'} · {result.input.gradeLevel || 'K-12'}
                </span>
                {/* Token Estimation Badge */}
                <span 
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded shadow-2xs"
                  title={`Estimated token size: Unified code ~${totalTokens} tokens (JSON: ~${jsonTokens} tok · CoT: ~${cotTokens} tok)`}
                >
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>~{formatTokenCount(totalTokens)} {t.tokensEstimate}</span>
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.outputConsoleSubtitle}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('unified')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'unified'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.tabUnified}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.tabInspector}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.tabTimeline}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visuals'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-pink-600" />
            <span>{t.tabVisuals}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.tabCompare}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-white text-indigo-950 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.tabSandbox}</span>
            {result?.generatedMaterial && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col overflow-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {language === 'mk' ? 'Се анализира образовната задача...' : 'Analyzing educational task...'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {language === 'mk' 
                  ? 'Изведување на минимална JSON шема и педагошки синџир на расудување според Блумовата таксономија.'
                  : 'Inferring minimal JSON schema and pedagogical reasoning layer based on Bloom\'s Taxonomy.'}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {t.emptyTitle}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {t.emptyDesc}
            </p>
          </div>
        )}

        {/* Results Available */}
        {!isLoading && result && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Action Bar for Result */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {/* 1-Click Copy Unified Code Block */}
                <button
                  type="button"
                  onClick={handleCopyUnified}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedUnified
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                  title={t.copyDescription}
                >
                  {copiedUnified ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t.copiedUnified}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.copyUnified}</span>
                    </>
                  )}
                </button>

                {/* Save to library */}
                <button
                  type="button"
                  onClick={onSavePrompt}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.alreadySaved}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.saveToLibrary}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download / Export & Print Options */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                {/* Print Lesson (triggers window.print() formatted for A4 layout) */}
                <button
                  type="button"
                  onClick={handlePrintMaterial}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
                  title={t.printLessonTooltip}
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.printLesson}</span>
                </button>

                {/* Download as .json (exports JSON schema and pedagogical reasoning) */}
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
                  title="Download generated JSON schema and pedagogical reasoning as a .json file"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>.json</span>
                </button>

                {/* Download as .txt (exports JSON schema and pedagogical reasoning) */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
                  title="Download generated JSON schema and pedagogical reasoning as a .txt file"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>.txt</span>
                </button>

                {/* Download as PDF (Direct jsPDF conversion) */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs disabled:opacity-60"
                  title="Download stylized PDF directly via jsPDF"
                >
                  {isExportingPdf ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>{t.exportingPdf}</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5 text-white" />
                      <span>{t.exportPdf}</span>
                    </>
                  )}
                </button>

                {/* Share via Email */}
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 border border-purple-200/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
                  title={t.shareViaEmailTooltip}
                >
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t.shareViaEmail}</span>
                </button>
              </div>
            </div>

            {/* Prompt Complexity & Pedagogical Depth Metrics */}
            <PromptComplexityCard result={result} language={language} />

            {/* TAB 1: UNIFIED CODE BLOCK (Primary View as specified in user instructions) */}
            {activeTab === 'unified' && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">
                      {language === 'mk' ? 'Целосен излез (JSON + Chain-of-thought во еден код блок)' : 'Single Code Block Output (JSON + Chain-of-thought)'}
                    </span>
                    <span className="text-[11px] text-slate-400">· Ready to copy together</span>
                  </div>
                </div>

                <div className="relative flex-1 group">
                  <pre className="w-full h-full min-h-[380px] p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 selection:bg-indigo-700 selection:text-white">
                    <code>{result.unifiedCodeBlock}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopyUnified}
                    className="absolute top-3 right-3 px-2.5 py-1 text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md border border-slate-700 backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedUnified ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Block</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SCHEMA & COT INSPECTOR */}
            {activeTab === 'inspector' && (
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                {/* 0. Tree-of-Thoughts (ToT) Pedagogical Strategy Evaluation */}
                {result.totEvaluation && (
                  <div className="p-4 bg-linear-to-br from-indigo-50/70 via-white to-emerald-50/50 rounded-2xl border border-indigo-100/90 shadow-2xs space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-100/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <GitCompare className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>{t.totHeader}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                              ToT Multi-Path
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {t.totDesc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                        <span>{result.totEvaluation.selectedBranch}</span>
                      </div>
                    </div>

                    {/* Selection Rationale */}
                    {result.totEvaluation.selectionJustification && (
                      <div className="text-xs bg-white/95 p-3 rounded-xl border border-indigo-100/80 space-y-1">
                        <div className="font-semibold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{t.totRationaleTitle}:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-sans">
                          {result.totEvaluation.selectionJustification}
                        </p>
                      </div>
                    )}

                    {/* Evaluated Branches Comparison */}
                    {result.totEvaluation.branches && result.totEvaluation.branches.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        {result.totEvaluation.branches.map((branch, idx) => {
                          const isSelected = 
                            result.totEvaluation?.selectedBranch?.toLowerCase().includes(branch.name.toLowerCase()) ||
                            result.totEvaluation?.selectedBranch?.toLowerCase().includes(branch.framework.toLowerCase());
                          return (
                            <div 
                              key={idx}
                              className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between space-y-2 ${
                                isSelected 
                                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                                  : 'bg-white/80 border-slate-200/90'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 truncate" title={branch.name}>{branch.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold shrink-0">
                                    {branch.studentAlignmentScore}/10
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-indigo-700">
                                  {branch.framework}
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                  {branch.rationale}
                                </p>
                              </div>

                              {/* Pros */}
                              {branch.pros && branch.pros.length > 0 && (
                                <div className="text-[10px] space-y-0.5 pt-1 border-t border-slate-100">
                                  <span className="font-semibold text-slate-500 uppercase tracking-wider block text-[9px]">
                                    {t.totPros}:
                                  </span>
                                  {branch.pros.slice(0, 2).map((pro, pIdx) => (
                                    <div key={pIdx} className="text-emerald-800 flex items-start gap-1">
                                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                      <span className="truncate">{pro}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 1. Minimal JSON Schema */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {t.jsonSchemaHeader}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t.jsonSchemaDesc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        ~{formatTokenCount(jsonTokens)} {t.tokensEstimate}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/70 flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
                        title={t.copyToClipboard}
                      >
                        {copiedJson ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700 font-semibold">{language === 'mk' ? 'Копирано!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copyJsonSchema}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadSchemaOnly}
                        className="text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer font-medium transition-colors shadow-2xs"
                        title="Download schema as .json"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.downloadJsonSchema}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs leading-relaxed overflow-x-auto">
                    <code>{result.jsonString}</code>
                  </pre>
                </div>

                {/* 2. Chain of Thought Reasoning */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {t.cotHeader}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t.cotDesc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        ~{formatTokenCount(cotTokens)} {t.tokensEstimate}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCot}
                        className="text-xs text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300/70 flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
                        title={t.copyToClipboard}
                      >
                        {copiedCot ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700 font-semibold">{language === 'mk' ? 'Копирано!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copyCot}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCotOnly}
                        className="text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer font-medium transition-colors shadow-2xs"
                        title="Download reasoning as .txt"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t.downloadCotTxt}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 text-slate-800 text-xs leading-relaxed space-y-3 font-sans">
                    <div className="font-semibold text-amber-950 flex items-center gap-1.5 pb-1 border-b border-amber-200/50">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Chain-of-thought Reasoning Path:</span>
                    </div>
                    <div className="whitespace-pre-line text-slate-700">
                      {result.chainOfThought || (language === 'mk' ? 'Нема експлицитен синџир.' : 'No chain-of-thought parsed.')}
                    </div>
                  </div>
                </div>

                {/* 3. Key Vocabulary & Terminology */}
                {result.keyVocabulary && result.keyVocabulary.length > 0 && (
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {t.keyVocabularyHeader}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t.keyVocabularyDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.keyVocabulary.map((item, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950">{item.term}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{item.definition}</p>
                          {item.gradeRelevance && (
                            <span className="text-[10px] text-emerald-700 font-medium block pt-0.5">
                              {item.gradeRelevance}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: 45-MINUTE LESSON TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="flex-1 space-y-4">
                <LessonTimelineCard
                  timeline={result.timeline}
                  topic={result.input.topic}
                  language={language}
                />
              </div>
            )}

            {/* TAB: VISUAL ASSETS & NANOBANANA VECTORS */}
            {activeTab === 'visuals' && (
              <div className="flex-1 space-y-4">
                <VisualAssetsCard
                  visualAssets={result.visualAssets}
                  topic={result.input.topic}
                  language={language}
                />
              </div>
            )}

            {/* TAB 3: FRAMEWORK COMPARE */}
            {activeTab === 'compare' && (
              <FrameworkCompareView
                currentForm={currentForm}
                language={language}
                onAdoptResult={(adopted) => {
                  onAdoptResult?.(adopted);
                  setActiveTab('unified');
                }}
                currentResult={result}
              />
            )}

            {/* TAB 4: CLASSROOM OUTPUT SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {t.sandboxHeader}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t.sandboxDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onRunTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isTesting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>{t.runningTestButton}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t.runTestButton}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Material Output */}
                <div className="flex-1 flex flex-col">
                  {isTesting && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                        <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {language === 'mk' ? 'Се генерира комплетниот наставен план...' : 'Generating complete lesson plan & materials...'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {language === 'mk' ? 'Примена на Блумова таксономија, диференцијација и наставни чекори' : 'Applying Bloom\'s Taxonomy, differentiation, and timed instructional phases'}
                      </p>
                    </div>
                  )}

                  {!isTesting && !result.generatedMaterial && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mb-2 stroke-1" />
                      <p className="text-xs font-medium text-slate-600">
                        {language === 'mk' ? 'Материјалот сè уште не е генериран' : 'No material generated yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                        {language === 'mk' 
                          ? 'Кликнете на "Генерирај наставен план/материјал" за да видите како AI го извршува вашиот оптимизиран промпт.'
                          : 'Click "Generate Lesson Material Now" to see how the AI executes your optimized prompt schema in practice.'}
                      </p>
                    </div>
                  )}

                  {!isTesting && result.generatedMaterial && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-100 gap-2 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            {language === 'mk' ? 'Генериран наставен материјал подготвен за час' : 'Classroom-Ready Output Generated'}
                          </span>
                          {/* Read Time & Word Count Utility */}
                          {lessonMetrics.wordCount > 0 && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-slate-700">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lessonMetrics.wordCount.toLocaleString()} {t.wordCountLabel}</span>
                              </span>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span 
                                className="flex items-center gap-1 text-slate-700" 
                                title={`${t.instructionalPaceLabel}: ~${lessonMetrics.estimatedInstructionalMinutes} min`}
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>~{lessonMetrics.estimatedReadTimeMinutes} {t.readTimeLabel}</span>
                              </span>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="text-slate-500">
                                {result.input.lessonDuration || '45 min'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleCopyMaterial}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-colors"
                          >
                            {copiedMaterial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedMaterial ? 'Copied' : 'Copy'}</span>
                          </button>
                          {/* Download as PDF via jsPDF */}
                          <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="px-3 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow-xs transition-colors disabled:opacity-60"
                            title={t.exportPdf}
                          >
                            {isExportingPdf ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>{t.exportingPdf}</span>
                              </>
                            ) : (
                              <>
                                <FileDown className="w-3.5 h-3.5" />
                                <span>{t.exportPdf}</span>
                              </>
                            )}
                          </button>
                          {/* Standard browser print dialog formatted for A4 layout */}
                          <button
                            type="button"
                            onClick={handlePrintMaterial}
                            className="px-2.5 py-1 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg flex items-center gap-1 cursor-pointer font-semibold transition-colors shadow-2xs"
                            title={t.printLessonTooltip}
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{t.printLesson}</span>
                          </button>
                          {/* Download as .json */}
                          <button
                            type="button"
                            onClick={handleDownloadJson}
                            className="px-2 py-1 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-colors shadow-2xs"
                            title="Download JSON schema and pedagogical reasoning as .json"
                          >
                            <FileCode className="w-3.5 h-3.5 text-slate-500" />
                            <span>.json</span>
                          </button>
                          {/* Download as .txt */}
                          <button
                            type="button"
                            onClick={handleDownloadTxt}
                            className="px-2 py-1 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-colors shadow-2xs"
                            title="Download JSON schema and pedagogical reasoning as .txt"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>.txt</span>
                          </button>
                          {/* Share via Email */}
                          <button
                            type="button"
                            onClick={() => setIsEmailModalOpen(true)}
                            className="px-2 py-1 text-xs text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg flex items-center gap-1 cursor-pointer font-medium transition-colors shadow-2xs"
                            title={t.shareViaEmailTooltip}
                          >
                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed overflow-y-auto max-h-[500px] whitespace-pre-wrap font-sans">
                        {result.generatedMaterial}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Token Consumption History Chart (Past vs Current) */}
            <TokenHistoryChart
              currentResult={result}
              history={history}
              language={language}
            />
          </div>
        )}
      </div>

      {/* Hidden printable document rendered specifically for high-res PDF export and @media print */}
      <PrintableLessonDocument result={result} language={language} />
    </div>
  );
};
