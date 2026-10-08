import React from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { TemplatePreset, SupportedLanguage } from '../types.ts';
import { TEMPLATE_PRESETS } from '../constants/presets.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: TemplatePreset) => void;
  language: SupportedLanguage;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  language,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.presetsButton}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mk' 
                  ? 'Изберете подготвен образовен шаблон за основно или средно училиште' 
                  : 'Select an authentic K-12 teacher scenario to load into the optimizer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {TEMPLATE_PRESETS.map((preset) => {
            const title = language === 'mk' ? preset.titleMk : preset.title;
            const subtitle = language === 'mk' ? preset.subtitleMk : preset.subtitle;
            const stageLabel = preset.state.stage === 'primary' 
              ? (language === 'mk' ? 'Одделенска' : 'Primary') 
              : preset.state.stage === 'middle'
              ? (language === 'mk' ? 'Предметна' : 'Middle School')
              : (language === 'mk' ? 'Средно' : 'High School');

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors">
                      {stageLabel}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">
                      {preset.state.taskType}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                </div>

                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
