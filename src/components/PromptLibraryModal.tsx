import React, { useState } from 'react';
import { X, Bookmark, Trash2, ArrowUpRight, Copy, Check } from 'lucide-react';
import { SavedPromptItem, SupportedLanguage } from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: SavedPromptItem[];
  onLoadPrompt: (item: SavedPromptItem) => void;
  onDeletePrompt: (id: string) => void;
  language: SupportedLanguage;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onLoadPrompt,
  onDeletePrompt,
  language,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.libraryTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.libraryDesc}
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
          {prompts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
              <p className="text-xs">{t.noSavedPrompts}</p>
            </div>
          ) : (
            prompts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">{item.subject}</span>
                    <span>·</span>
                    <span>{item.taskType}</span>
                    <span>·</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.unifiedCodeBlock)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title={language === 'mk' ? 'Копирај код блок' : 'Copy code block'}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadPrompt(item);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.loadIntoForm}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePrompt(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title={t.deletePrompt}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
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
