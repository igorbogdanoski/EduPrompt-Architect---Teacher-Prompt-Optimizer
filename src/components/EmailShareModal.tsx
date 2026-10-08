import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, X, Send } from 'lucide-react';
import { PromptOptimizationResult, SupportedLanguage } from '../types.ts';
import { generateLessonPlanEmail, triggerNativeMailto } from '../utils/emailTemplate.ts';

interface EmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PromptOptimizationResult | null;
  language: SupportedLanguage;
}

export const EmailShareModal: React.FC<EmailShareModalProps> = ({
  isOpen,
  onClose,
  result,
  language,
}) => {
  if (!isOpen || !result) return null;

  const isMk = language === 'mk';
  const [recipient, setRecipient] = useState('');
  const [copied, setCopied] = useState(false);

  const emailDraft = generateLessonPlanEmail(result, language, recipient);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${emailDraft.subject}\n\n${emailDraft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMailto = () => {
    triggerNativeMailto(result, language, recipient);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isMk ? 'Испрати наставен план на колега' : 'Email Lesson Plan to Colleague'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMk 
                  ? 'Форматира чист мејл со JSON шемата и отвора mailto: линк'
                  : 'Formats structured email template with JSON schema and opens mailto: link'}
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Recipient Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {isMk ? 'Е-пошта на колега (опционално):' : 'Colleague Email Address (optional):'}
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={isMk ? 'kolega@uchilishte.edu.mk' : 'colleague@school.edu'}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subject Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {isMk ? 'Наслов на пораката:' : 'Email Subject:'}
            </label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
              {emailDraft.subject}
            </div>
          </div>

          {/* Brief Description Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {isMk ? 'Краток опис на часот:' : 'Brief Lesson Description:'}
            </label>
            <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs font-sans text-slate-700 leading-relaxed">
              {emailDraft.briefDescription}
            </div>
          </div>

          {/* Email Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 block">
                {isMk ? 'Преглед на структурираната порака:' : 'Structured Email Body Preview:'}
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (isMk ? 'Копирано!' : 'Copied!') : (isMk ? 'Копирај текст' : 'Copy Text')}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={emailDraft.body}
              rows={8}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isMk ? 'Копирано!' : 'Copied!') : (isMk ? 'Копирај за Webmail' : 'Copy Draft')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {isMk ? 'Откажи' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                handleSendMailto();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isMk ? 'Отвори во Email (mailto:)' : 'Open in Mail Client (mailto:)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
