import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  FileCode, 
  Printer, 
  Eye, 
  Info, 
  CheckCircle2, 
  Maximize2,
  Palette,
  Cpu
} from 'lucide-react';
import { VisualAssetSpec, SupportedLanguage } from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface VisualAssetsCardProps {
  visualAssets?: VisualAssetSpec[];
  topic?: string;
  language: SupportedLanguage;
}

export const VisualAssetsCard: React.FC<VisualAssetsCardProps> = ({
  visualAssets = [],
  topic = 'Lesson Topic',
  language,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedTikz, setCopiedTikz] = useState(false);

  if (!visualAssets || visualAssets.length === 0) return null;

  const currentAsset = visualAssets[selectedAssetIndex] || visualAssets[0];

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentAsset.nanobananaPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (e) {
      console.error('Failed to copy NanoBanana prompt', e);
    }
  };

  const handleCopySvg = async () => {
    if (!currentAsset.svgSnippet) return;
    try {
      await navigator.clipboard.writeText(currentAsset.svgSnippet);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (e) {
      console.error('Failed to copy SVG', e);
    }
  };

  const handleCopyTikz = async () => {
    if (!currentAsset.tikzCode) return;
    try {
      await navigator.clipboard.writeText(currentAsset.tikzCode);
      setCopiedTikz(true);
      setTimeout(() => setCopiedTikz(false), 2000);
    } catch (e) {
      console.error('Failed to copy TikZ', e);
    }
  };

  const handleDownloadSvg = () => {
    if (!currentAsset.svgSnippet) return;
    const blob = new Blob([currentAsset.svgSnippet], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (topic || 'diagram').toLowerCase().replace(/[^a-z0-9а-яёієґ]+/gi, '-').slice(0, 30);
    a.href = url;
    a.download = `nanobanana-diagram-${safeTopic}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 via-indigo-50/25 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.visualsTitle}
            </h3>
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              NanoBanana AI · Vector Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.visualsSubtitle}
          </p>
        </div>

        {/* Asset tabs if more than 1 */}
        {visualAssets.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {visualAssets.map((asset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAssetIndex(idx)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedAssetIndex === idx
                    ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {asset.title || `Asset ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Asset Title & Dual Coding Rationale */}
        <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100/90 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {currentAsset.title}
              </h4>
              <span className="text-[10px] font-mono font-medium text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200/80 shadow-2xs">
                {currentAsset.assetType}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-indigo-950 font-semibold mr-1">
                {isMk ? 'Педагошка цел (Dual Coding):' : 'Pedagogical Purpose:'}
              </strong>
              {currentAsset.pedagogicalPurpose}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-auto">
            {currentAsset.svgSnippet && (
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                title={t.downloadSvg}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadSvg}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. NanoBanana AI Vector Prompt Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.nanobananaPromptLabel}</span>
            </label>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">{isMk ? 'Копирано!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>{t.copyNanobananaPrompt}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner select-all border border-slate-800">
            {currentAsset.nanobananaPrompt}
          </div>
        </div>

        {/* 2. Visual Interactive Preview (SVG) */}
        {currentAsset.svgSnippet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                <span>{t.svgPreviewLabel}</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {copiedSvg ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">{isMk ? 'Копирано!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-3 h-3 text-slate-400" />
                      <span>{t.copySvgCode}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live SVG container */}
            <div 
              className="w-full bg-slate-50/60 p-4 sm:p-6 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: currentAsset.svgSnippet }}
            />
          </div>
        )}

        {/* 3. LaTeX TikZ / PGFPlots Code Block */}
        {currentAsset.tikzCode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.tikzCodeLabel}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isMk ? 'За учебници и LaTeX документи' : 'For LaTeX & textbook printing'})
                </span>
              </label>
              <button
                type="button"
                onClick={handleCopyTikz}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                {copiedTikz ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">{isMk ? 'Копирано!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>{t.copyTikzCode}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner select-all border border-slate-800">
              {currentAsset.tikzCode}
            </pre>
          </div>
        )}

        {/* 4. Optimization & Delivery Specifications Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.optimizationDetailsLabel}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {isMk ? 'Печатен формат' : 'Print Readiness'}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {currentAsset.optimizationDetails?.printResolution || '300 DPI Vector (CMYK safe)'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {isMk ? 'Дигитален товар' : 'Digital Payload'}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {currentAsset.optimizationDetails?.digitalPayload || '< 15 KB Vector SVG'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {isMk ? 'Пропорција / Aspect' : 'Aspect Ratio'}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {currentAsset.optimizationDetails?.aspectRatio || '16:9 widescreen'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {isMk ? 'Пристапност' : 'Accessibility'}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {currentAsset.optimizationDetails?.colorSafety || 'WCAG AAA High-Contrast'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
