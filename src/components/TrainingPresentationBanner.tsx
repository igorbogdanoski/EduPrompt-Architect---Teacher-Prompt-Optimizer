import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Clock, 
  Palette, 
  X,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { SupportedLanguage } from '../types.ts';

interface TrainingPresentationBannerProps {
  language: SupportedLanguage;
  onLoadShowcaseDemo: () => void;
}

export const TrainingPresentationBanner: React.FC<TrainingPresentationBannerProps> = ({
  language,
  onLoadShowcaseDemo,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const isMk = language === 'mk';

  if (isDismissed) return null;

  return (
    <aside 
      aria-label={isMk ? 'Водич за обука' : 'Training guide'}
      className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden transition-all mb-6"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/80 text-white border border-indigo-400/30 shadow-xs">
            <Presentation className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {isMk 
                  ? 'Педагошка Обука: Прво Јавно Презентирање пред Колегите' 
                  : 'Teacher Training Workshop: Public Presentation Mode'}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                {isMk ? 'Спремно за настава' : 'Workshop Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              {isMk 
                ? 'Презентирајте ги клучните три иновации: Авто-адаптивно ниво, 45-минутна временска оска и NanoBanana векторски дијаграми.'
                : 'Demonstrate the 3 core pedagogical pillars: Adaptive difficulty, 45-min lesson timeline, and NanoBanana vector visuals.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Demo Loader */}
          <button
            type="button"
            onClick={onLoadShowcaseDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-linear-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer shadow-sm active:scale-98"
            title={isMk ? 'Вчитај подготвен примерок за презентација' : 'Load presentation demo preset'}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>{isMk ? 'Вчитај Демо Примерок' : 'Load Demo Preset'}</span>
          </button>

          {/* Toggle Accordion */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isOpen ? 'Склопи' : 'Отвори'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Затвори"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable 3-Pillar Presentation Guide for the Teacher */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 text-xs">
          {/* Pillar 1 */}
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center text-[11px] font-mono border border-cyan-700/60">
                1
              </span>
              <span>{isMk ? 'Авто-Адаптивно Ниво' : 'Auto-Adaptive Difficulty'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isMk 
                ? 'Покажете како системот го анализира профилот на учениците и целите за автоматски да предложи тежина од 1 до 5 (од базично до мајсторство).'
                : 'Showcase how AI analyzes student readiness and learning goals to recommend difficulty 1-5, balancing cognitive load.'}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-[11px] font-mono border border-indigo-700/60">
                2
              </span>
              <span>{isMk ? '45-Минутна Временска Оска' : '45-Minute Lesson Timeline'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isMk 
                ? 'Демонстрирајте го структурирањето на 4-те фази на часот (Вовед, Моделирање, Самостојна работа, Ексит) со точни минутажи и улоги.'
                : 'Demonstrate minute-by-minute progression across 4 phases with explicit teacher/student actions and formative checks.'}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center text-[11px] font-mono border border-emerald-700/60">
                3
              </span>
              <span>{isMk ? 'NanoBanana AI & Dual Coding' : 'NanoBanana & Dual Coding'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isMk 
                ? 'Отворете го табот за дијаграми за да ги прикажете чистите SVG вектори, LaTeX TikZ кодот и промптот со нула визуелен шум.'
                : 'Open the Visuals tab to display clean vector SVG diagrams, LaTeX TikZ snippets, and zero-slop NanoBanana AI prompts.'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
