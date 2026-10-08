import React from 'react';
import { BookOpen, Bookmark, Sparkles, Globe, Layers, GraduationCap, Type } from 'lucide-react';
import { SupportedLanguage } from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

export type FontScale = 'standard' | 'comfort' | 'presentation';

interface HeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenPresets: () => void;
  onOpenLibrary: () => void;
  savedCount: number;
  onOpenBloomsGuide?: () => void;
  fontScale?: FontScale;
  onFontScaleChange?: (scale: FontScale) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenPresets,
  onOpenLibrary,
  savedCount,
  onOpenBloomsGuide,
  fontScale = 'comfort',
  onFontScaleChange,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';

  const cycleFontScale = () => {
    if (!onFontScaleChange) return;
    if (fontScale === 'comfort') onFontScaleChange('presentation');
    else if (fontScale === 'presentation') onFontScaleChange('standard');
    else onFontScaleChange('comfort');
  };

  const getFontScaleLabel = () => {
    if (fontScale === 'presentation') return isMk ? 'Проектор 125%' : 'Projector 125%';
    if (fontScale === 'comfort') return isMk ? 'Текст 1080p' : 'Large 1080p';
    return isMk ? 'Текст 100%' : 'Normal 100%';
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs shrink-0 ring-1 ring-indigo-500/30 overflow-hidden p-1">
            <img src="/favicon.svg" alt="EduPrompt Architect Logo" className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 truncate">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-flex text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                MathDigitizer Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Bloom's Taxonomy Reference Guide Button */}
          {onOpenBloomsGuide && (
            <button
              type="button"
              onClick={onOpenBloomsGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer"
              title={t.bloomsGuideTooltip}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{t.bloomsGuideBadge}</span>
            </button>
          )}

          {/* Quick Presets Button */}
          <button
            type="button"
            onClick={onOpenPresets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">{t.presetsButton}</span>
          </button>

          {/* Saved Prompts Library */}
          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors cursor-pointer relative"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xs:inline">{t.libraryButton}</span>
            {savedCount > 0 && (
              <span className="ml-1 text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {/* Font Scale / Screen Visibility Toggle */}
          {onFontScaleChange && (
            <button
              type="button"
              onClick={cycleFontScale}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                fontScale === 'presentation'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/40 shadow-2xs'
                  : fontScale === 'comfort'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={
                isMk
                  ? `Големина на текст: ${getFontScaleLabel()} (Кликнете за промена: 1080p -> Проектор -> Стандардно)`
                  : `Font scale: ${getFontScaleLabel()} (Click to toggle: 1080p -> Projector -> Standard)`
              }
            >
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{getFontScaleLabel()}</span>
              <span className="sm:hidden font-mono text-[10px]">
                {fontScale === 'presentation' ? '125%' : fontScale === 'comfort' ? '110%' : '100%'}
              </span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => onLanguageChange('mk')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'mk'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Македонски"
            >
              MK
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
