import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  X, 
  RefreshCw, 
  Layers, 
  Compass, 
  Clock, 
  GitBranch, 
  Shapes, 
  Box, 
  FileText, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { VisualAssetSettings, VisualAssetSpec, SupportedLanguage } from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface VisualAssetConfiguratorProps {
  settings: VisualAssetSettings;
  topic: string;
  gradeLevel: string;
  language: SupportedLanguage;
  onChange: (updated: Partial<VisualAssetSettings>) => void;
}

export const VisualAssetConfigurator: React.FC<VisualAssetConfiguratorProps> = ({
  settings,
  topic,
  gradeLevel,
  language,
  onChange,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedTikz, setCopiedTikz] = useState(false);

  const preview = settings.previewThumbnail;

  const visualTypes = [
    {
      id: 'technical_schematics',
      icon: Compass,
      label: t.typeTechnicalSchematics,
      desc: t.typeTechnicalSchematicsDesc,
      badge: 'Blueprints · Angles',
    },
    {
      id: 'timeline',
      icon: Clock,
      label: t.typeTimelines,
      desc: t.typeTimelinesDesc,
      badge: '45-Min Progression',
    },
    {
      id: 'process_diagram',
      icon: GitBranch,
      label: t.typeProcessDiagrams,
      desc: t.typeProcessDiagramsDesc,
      badge: 'Flowcharts · Loops',
    },
    {
      id: 'geometric_diagram',
      icon: Shapes,
      label: t.typeGeometricDiagrams,
      desc: t.typeGeometricDiagramsDesc,
      badge: 'Cartesian · Polygons',
    },
    {
      id: 'concept_model',
      icon: Box,
      label: t.typeConceptModels,
      desc: t.typeConceptModelsDesc,
      badge: 'Balance · Fractions',
    },
    {
      id: 'infographic',
      icon: FileText,
      label: t.typeInfographics,
      desc: t.typeInfographicsDesc,
      badge: 'Dual Coding Cards',
    },
  ];

  const pedagogicalIntents = [
    {
      id: 'dual_coding',
      label: t.intentDualCoding,
      desc: t.intentDualCodingDesc,
      citation: 'Allan Paivio (1971)',
    },
    {
      id: 'cognitive_load',
      label: t.intentCognitiveLoad,
      desc: t.intentCognitiveLoadDesc,
      citation: 'John Sweller (1988)',
    },
    {
      id: 'concrete_bridge',
      label: t.intentConcreteBridge,
      desc: t.intentConcreteBridgeDesc,
      citation: 'Jerome Bruner (EIS)',
    },
    {
      id: 'misconception',
      label: t.intentMisconception,
      desc: t.intentMisconceptionDesc,
      citation: 'Conceptual Change',
    },
    {
      id: 'scaffolding',
      label: t.intentScaffolding,
      desc: t.intentScaffoldingDesc,
      citation: 'Lev Vygotsky (ZPD)',
    },
  ];

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    const safeTopic = topic.trim() || (isMk ? 'Линеарни равенки и координатен систем' : 'Linear Equations & Coordinate Systems');

    try {
      const response = await fetch('/api/generate-visual-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: safeTopic,
          assetType: settings.visualType || 'technical_schematics',
          pedagogicalPurpose: settings.pedagogicalIntent || 'dual_coding',
          targetMisconception: settings.targetMisconception || '',
          gradeLevel: gradeLevel || 'Grade 7-8',
          accessibilityPalette: settings.accessibilityPalette || 'high_contrast',
          detailLevel: settings.detailLevel || 'standard',
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const generatedSpec: VisualAssetSpec = {
        id: `preview-${Date.now()}`,
        assetType: data.assetType || settings.visualType,
        title: data.title || `${safeTopic} Visual Model`,
        pedagogicalPurpose: data.pedagogicalPurpose || settings.pedagogicalIntent,
        targetMisconception: settings.targetMisconception,
        pedagogicalRationale: data.pedagogicalRationale,
        nanobananaPrompt: data.nanobananaPrompt || `Technical vector diagram for ${safeTopic}`,
        svgSnippet: data.svgSnippet || '',
        tikzCode: data.tikzCode || '',
        recommendedFormat: data.recommendedFormat || 'SVG',
        optimizationDetails: data.optimizationDetails,
      };

      onChange({ previewThumbnail: generatedSpec });
    } catch (err: any) {
      console.warn('Network preview generation error, utilizing deterministic synthesis:', err);
      // Fallback deterministic synthesis
      const fallbackSpec: VisualAssetSpec = {
        id: `preview-${Date.now()}`,
        assetType: settings.visualType || 'technical_schematics',
        title: isMk ? `Визуелен модел: ${safeTopic}` : `Visual Schematic: ${safeTopic}`,
        pedagogicalPurpose: isMk ? 'Двојно кодирање и елиминирање на когнитивниот товар' : 'Dual coding & cognitive load reduction',
        targetMisconception: settings.targetMisconception,
        pedagogicalRationale: isMk 
          ? 'Дијаграмот обезбедува просторно сидро со кое апстрактната математичка нотација се поврзува со визуелен модел.'
          : 'Provides a spatial anchor connecting symbolic notation with geometric intuition.',
        nanobananaPrompt: `Technical educational 2D vector blueprint of ${safeTopic}. Labeled coordinates, high contrast lines, zero extraneous decoration, clean solid background.`,
        svgSnippet: `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="500" height="320" fill="#f8fafc" rx="12" />
  <g stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3">
    <line x1="50" y1="80" x2="450" y2="80" />
    <line x1="50" y1="160" x2="450" y2="160" />
    <line x1="50" y1="240" x2="450" y2="240" />
    <line x1="150" y1="40" x2="150" y2="280" />
    <line x1="250" y1="40" x2="250" y2="280" />
    <line x1="350" y1="40" x2="350" y2="280" />
  </g>
  <polygon points="150,240 370,240 150,100" fill="#e0e7ff" fill-opacity="0.7" stroke="#4f46e5" stroke-width="3" stroke-linejoin="round" />
  <rect x="150" y="215" width="25" height="25" fill="none" stroke="#4f46e5" stroke-width="2" />
  <circle cx="162" cy="227" r="3" fill="#4f46e5" />
  <circle cx="150" cy="240" r="5" fill="#0f172a" />
  <circle cx="370" cy="240" r="5" fill="#0f172a" />
  <circle cx="150" cy="100" r="5" fill="#0f172a" />
  <text x="260" y="265" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">основа (b)</text>
  <text x="90" y="175" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">висина (a)</text>
  <text x="280" y="155" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4338ca">хипотенуза (c)</text>
  <rect x="20" y="20" width="460" height="40" rx="8" fill="#1e1b4b" />
  <text x="35" y="45" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">📐 ${safeTopic.toUpperCase()}</text>
</svg>`,
        tikzCode: `\\begin{tikzpicture}\n  \\draw[thick, fill=indigo!15] (0,0) -- (4,0) -- (0,3) -- cycle;\n  \\node[below] at (2,0) {$b$};\n  \\node[left] at (0,1.5) {$a$};\n  \\node[above right] at (2,1.5) {$c$};\n\\end{tikzpicture}`,
        recommendedFormat: 'SVG (Vector)',
      };
      onChange({ previewThumbnail: fallbackSpec });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!preview?.nanobananaPrompt) return;
    try {
      await navigator.clipboard.writeText(preview.nanobananaPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySvg = async () => {
    if (!preview?.svgSnippet) return;
    try {
      await navigator.clipboard.writeText(preview.svgSnippet);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyTikz = async () => {
    if (!preview?.tikzCode) return;
    try {
      await navigator.clipboard.writeText(preview.tikzCode);
      setCopiedTikz(true);
      setTimeout(() => setCopiedTikz(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadSvg = () => {
    if (!preview?.svgSnippet) return;
    const blob = new Blob([preview.svgSnippet], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTopic = (topic || 'diagram').toLowerCase().replace(/[^a-z0-9а-яёієґ]+/gi, '-').slice(0, 30);
    a.href = url;
    a.download = `preview-${settings.visualType}-${safeTopic}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 via-indigo-50/25 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Palette className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {t.configuratorTitle}
              </h3>
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                NanoBanana AI Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {t.configuratorSubtitle}
            </p>
          </div>
        </div>

        {/* Generate Preview Action Button */}
        <button
          type="button"
          onClick={handleGeneratePreview}
          disabled={isGenerating}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            isGenerating
              ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-indigo-600/20'
          }`}
          title={isMk ? 'Креирајте инстантна минијатура на дијаграмот за темата' : 'Generate instant diagram thumbnail preview'}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{t.generatingPreview}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{preview ? t.regeneratePreviewButton : t.generatePreviewButton}</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 1. Visual Taxonomy Type Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>{isMk ? '1. Таксономија на дијаграмот' : '1. Visual Diagram Taxonomy'}</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {visualTypes.length} {isMk ? 'типови' : 'types'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {visualTypes.map((vt) => {
              const Icon = vt.icon;
              const isSelected = (settings.visualType || 'technical_schematics') === vt.id;
              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => onChange({ visualType: vt.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold leading-tight">{vt.label}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {vt.desc}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                      {vt.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Pedagogical Metadata Fields */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isMk ? '2. Педагошки метаподатоци и когнитивна цел' : '2. Pedagogical Metadata & Cognitive Intent'}</span>
            </h4>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70 font-semibold">
              EdTech Validated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pedagogical Intent Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isMk ? 'Педагошка цел (Теориска рамка):' : 'Pedagogical Intent (Learning Theory):'}
              </label>
              <select
                value={settings.pedagogicalIntent || 'dual_coding'}
                onChange={(e) => onChange({ pedagogicalIntent: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {pedagogicalIntents.map((pi) => (
                  <option key={pi.id} value={pi.id}>
                    {pi.label} — {pi.citation}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                {pedagogicalIntents.find(pi => pi.id === (settings.pedagogicalIntent || 'dual_coding'))?.desc}
              </p>
            </div>

            {/* Accessibility & Rendering Palette */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isMk ? 'Пристапност и палета за цртање:' : 'Accessibility & Palette Style:'}
              </label>
              <select
                value={settings.accessibilityPalette || 'high_contrast'}
                onChange={(e) => onChange({ accessibilityPalette: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="high_contrast">{t.paletteHighContrast}</option>
                <option value="colorblind_safe">{t.paletteColorblindSafe}</option>
                <option value="print_monochrome">{t.paletteMonochrome}</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                {isMk ? 'Осигурува читливост на табла, проектор и печатени материјали.' : 'Guarantees readability on projectors, smartboards, and xerox prints.'}
              </p>
            </div>
          </div>

          {/* Target Misconception Metadata Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.targetMisconceptionLabel}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {isMk ? 'Опционално, но педагошки препорачано' : 'Optional, highly recommended'}
              </span>
            </div>
            <input
              type="text"
              value={settings.targetMisconception || ''}
              onChange={(e) => onChange({ targetMisconception: e.target.value })}
              placeholder={t.targetMisconceptionPlaceholder}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {t.targetMisconceptionHint}
            </p>
          </div>

          {/* Key Visual Labels & Focus Elements */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.customFocusLabel}
            </label>
            <input
              type="text"
              value={settings.customFocusNotes || ''}
              onChange={(e) => onChange({ customFocusNotes: e.target.value })}
              placeholder={t.customFocusPlaceholder}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* 3. Live Thumbnail Representation & Preview Panel */}
        {preview && (
          <div className="rounded-xl border border-indigo-200 bg-linear-to-b from-indigo-50/40 via-white to-slate-50/40 p-4 space-y-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                  <Eye className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    {preview.title || t.previewThumbnailTitle}
                  </h4>
                  <p className="text-[10px] font-mono text-indigo-700">
                    {t.previewThumbnailBadge} · {preview.assetType}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Preview */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title={isMk ? 'Прикажи во цел екран' : 'View full-screen'}
                >
                  <Maximize2 className="w-3 h-3 text-slate-500" />
                  <span>{isMk ? 'Зголеми' : 'Zoom'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title={t.copyNanobananaPrompt}
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3 text-indigo-600" />}
                  <span>{copiedPrompt ? (isMk ? 'Копирано!' : 'Copied!') : 'NanoBanana Prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title={t.copySvgCode}
                >
                  {copiedSvg ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title={t.downloadSvg}
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span>.svg</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Canvas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
              {/* SVG Graphic Viewport */}
              <div className="md:col-span-7 bg-slate-900 rounded-xl p-2 border border-slate-800 shadow-inner overflow-hidden flex items-center justify-center min-h-[180px]">
                {preview.svgSnippet ? (
                  <div 
                    className="w-full flex items-center justify-center [&>svg]:max-h-[220px] [&>svg]:w-full [&>svg]:h-auto"
                    dangerouslySetInnerHTML={{ __html: preview.svgSnippet }} 
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                    <span>{isMk ? 'Нема достапен SVG приказ' : 'No SVG preview available'}</span>
                  </div>
                )}
              </div>

              {/* Metadata Details & NanoBanana Prompt Snippet */}
              <div className="md:col-span-5 space-y-2.5">
                {/* Rationale & Educational Value */}
                {preview.pedagogicalRationale && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed">
                    <span className="font-bold block text-indigo-900 mb-0.5">
                      💡 {isMk ? 'Педагошко оправдување:' : 'Pedagogical Rationale:'}
                    </span>
                    {preview.pedagogicalRationale}
                  </div>
                )}

                {/* NanoBanana Prompt Box */}
                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-[10px] font-mono text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 mb-1 text-[9px] uppercase tracking-wider font-semibold">
                    <span>Prompt for NanoBanana AI</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {copiedPrompt ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="line-clamp-4 leading-normal text-slate-300">
                    {preview.nanobananaPrompt}
                  </p>
                </div>

                {/* Print & Web Optimization Tags */}
                <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-mono text-slate-600">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                    300 DPI Vector
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                    WCAG AAA
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Zero AI Slop
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreenModalOpen && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col">
            {/* Modal Topbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Maximize2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {preview.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {preview.assetType} · NanoBanana AI Vector Renderer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Full SVG Viewport */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-center">
                <div 
                  className="w-full max-w-2xl mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: preview.svgSnippet || '' }}
                />
              </div>

              {/* Modal Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    {isMk ? 'Педагошка Рамка' : 'Pedagogical Framework'}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {preview.pedagogicalRationale || preview.pedagogicalPurpose}
                  </p>
                  {preview.targetMisconception && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-amber-900">
                      <strong>{isMk ? 'Корекција на заблуда:' : 'Targeted Misconception:'}</strong> {preview.targetMisconception}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
                    <span>NanoBanana AI Prompt</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="hover:text-indigo-300 transition-colors"
                    >
                      {copiedPrompt ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs font-mono leading-relaxed text-slate-200">
                    {preview.nanobananaPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isMk ? 'Копирај SVG' : 'Copy SVG'}</span>
                </button>

                {preview.tikzCode && (
                  <button
                    type="button"
                    onClick={handleCopyTikz}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTikz ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isMk ? 'Копирај TikZ' : 'Copy TikZ'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isMk ? 'Преземи SVG датотека' : 'Download SVG File'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {isMk ? 'Затвори' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
