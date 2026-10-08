import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Users, 
  HelpCircle, 
  Copy, 
  Check, 
  ArrowRight,
  Layers,
  Timer
} from 'lucide-react';
import { LessonTimelinePhase, SupportedLanguage } from '../types.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface LessonTimelineCardProps {
  timeline?: LessonTimelinePhase[];
  topic?: string;
  language: SupportedLanguage;
}

export const LessonTimelineCard: React.FC<LessonTimelineCardProps> = ({
  timeline = [],
  topic = 'Lesson Topic',
  language,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';
  const [copiedTimeline, setCopiedTimeline] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);

  if (!timeline || timeline.length === 0) return null;

  const totalMinutes = timeline.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) || 45;

  const handleCopyTimeline = async () => {
    const textLines = [
      `⏱️ ${isMk ? 'ВРЕМЕНСКА РАМКА НА ЧАСОТ (45 МИНУТИ)' : '45-MINUTE LESSON TIMELINE'}: ${topic}`,
      '='.repeat(50),
      ...timeline.map((p, idx) => [
        `\n[${p.startMinute} - ${p.endMinute} min (${p.durationMinutes} min)] ${p.phase}`,
        `• ${isMk ? 'Наставник' : 'Teacher'}: ${p.teacherActivity}`,
        `• ${isMk ? 'Ученици' : 'Students'}: ${p.studentActivity}`,
        p.formativeCheckpoint ? `• ${isMk ? 'Формативна проверка' : 'Checkpoint'}: ${p.formativeCheckpoint}` : ''
      ].filter(Boolean).join('\n')),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(textLines);
      setCopiedTimeline(true);
      setTimeout(() => setCopiedTimeline(false), 2000);
    } catch (err) {
      console.error('Failed to copy timeline:', err);
    }
  };

  const phaseColors = [
    { bg: 'bg-indigo-500', light: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
    { bg: 'bg-cyan-500', light: 'bg-cyan-50/70', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
    { bg: 'bg-amber-500', light: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 via-indigo-50/20 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.timelineTitle}
            </h3>
            <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
              45 {t.minutesBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.timelineSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTimeline}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          {copiedTimeline ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{isMk ? 'Копирано!' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>{isMk ? 'Копирај временска рамка' : 'Copy Timeline'}</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Timeline Progress Bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex justify-between">
          <span>0 {t.minutesBadge}</span>
          <span>10 {t.minutesBadge}</span>
          <span>25 {t.minutesBadge}</span>
          <span>38 {t.minutesBadge}</span>
          <span>45 {t.minutesBadge}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200/80">
          {timeline.map((phase, idx) => {
            const widthPct = Math.round(((phase.durationMinutes || 10) / totalMinutes) * 100);
            const color = phaseColors[idx % phaseColors.length];
            const isHovered = activePhaseIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActivePhaseIndex(idx)}
                onMouseLeave={() => setActivePhaseIndex(null)}
                style={{ width: `${widthPct}%` }}
                className={`${color.bg} transition-all duration-200 relative group cursor-pointer ${
                  isHovered ? 'brightness-110' : 'opacity-90'
                }`}
                title={`${phase.phase}: ${phase.startMinute}-${phase.endMinute} min (${phase.durationMinutes} min)`}
              />
            );
          })}
        </div>
      </div>

      {/* Sequential Phase Cards */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {timeline.map((phase, idx) => {
          const color = phaseColors[idx % phaseColors.length];
          const isSelected = activePhaseIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setActivePhaseIndex(idx)}
              onMouseLeave={() => setActivePhaseIndex(null)}
              className={`p-4 rounded-xl border transition-all ${
                isSelected 
                  ? `${color.border} ${color.light} shadow-xs ring-1 ring-indigo-400/30` 
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              {/* Phase Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${color.badge}`}>
                    {idx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    {phase.phase}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <Timer className="w-3 h-3 text-slate-400" />
                    <span>{phase.startMinute} - {phase.endMinute} {t.minutesBadge}</span>
                    <span className="text-slate-400">({phase.durationMinutes} {t.minutesBadge})</span>
                  </span>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                {/* Teacher Action */}
                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100/90 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.teacherRole}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {phase.teacherActivity}
                  </p>
                </div>

                {/* Student Action */}
                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100/90 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{t.studentRole}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                    {phase.studentActivity}
                  </p>
                </div>
              </div>

              {/* Formative Checkpoint */}
              {phase.formativeCheckpoint && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-2 text-xs">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-700 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </span>
                  <div className="text-[11px] leading-snug">
                    <strong className="text-emerald-900 font-semibold mr-1">{t.formativeCheck}:</strong>
                    <span className="text-emerald-800">{phase.formativeCheckpoint}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
