import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Users, 
  Layers, 
  Check, 
  HelpCircle,
  Sliders,
  Wand2,
  ChevronDown,
  ChevronUp,
  Image,
  Palette,
  CheckCircle2,
  Cpu,
  FileCode
} from 'lucide-react';
import { 
  TeacherFormState, 
  SupportedLanguage, 
  EducationStage,
  AdaptiveDifficultyEvaluation,
  VisualAssetSettings
} from '../types.ts';
import { VisualAssetConfigurator } from './VisualAssetConfigurator.tsx';
import { 
  PEDAGOGICAL_FRAMEWORKS, 
  TASK_TYPES, 
  SUBJECT_OPTIONS, 
  STUDENT_PROFILE_PRESETS 
} from '../constants/frameworks.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface QuestionnaireFormProps {
  form: TeacherFormState;
  onChange: (updated: Partial<TeacherFormState>) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  language: SupportedLanguage;
  onOpenBloomsGuide?: () => void;
}

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  form,
  onChange,
  onSubmit,
  onReset,
  isLoading,
  language,
  onOpenBloomsGuide,
}) => {
  const t = TRANSLATIONS[language];
  const isMk = language === 'mk';
  const [isAnalyzingDifficulty, setIsAnalyzingDifficulty] = useState(false);
  const [adaptiveDiagnosis, setAdaptiveDiagnosis] = useState<AdaptiveDifficultyEvaluation | null>(null);
  const [isVisualsExpanded, setIsVisualsExpanded] = useState(true);

  const handleAnalyzeDifficulty = async (customProfile?: string, customObjectives?: string) => {
    setIsAnalyzingDifficulty(true);
    try {
      const res = await fetch('/api/suggest-difficulty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: customProfile !== undefined ? customProfile : form.studentProfile,
          learningObjectives: customObjectives !== undefined ? customObjectives : form.learningObjectives,
          gradeLevel: form.gradeLevel,
          subject: form.subject,
          topic: form.topic,
          language,
        }),
      });
      if (res.ok) {
        const data: AdaptiveDifficultyEvaluation = await res.json();
        setAdaptiveDiagnosis(data);
        onChange({
          difficultyLevel: data.suggestedLevel,
          adaptiveRationale: isMk ? data.rationaleMk : data.rationale,
        });
      }
    } catch (err) {
      console.error('Failed to analyze difficulty:', err);
    } finally {
      setIsAnalyzingDifficulty(false);
    }
  };

  const handleToggleAutoAdaptive = () => {
    const nextState = !form.autoAdaptiveDifficulty;
    onChange({ autoAdaptiveDifficulty: nextState });
    if (nextState) {
      handleAnalyzeDifficulty();
    }
  };

  const updateVisualSetting = (keyOrObject: keyof VisualAssetSettings | Partial<VisualAssetSettings>, value?: any) => {
    const current: VisualAssetSettings = form.visualSettings || {
      includeVisuals: true,
      visualType: 'technical_schematics',
      pedagogicalIntent: 'dual_coding',
      visualStyle: 'nanobanana_vector',
      accessibilityPalette: 'high_contrast',
      detailLevel: 'standard'
    };
    if (typeof keyOrObject === 'object') {
      onChange({
        visualSettings: {
          ...current,
          ...keyOrObject
        }
      });
    } else {
      onChange({
        visualSettings: {
          ...current,
          [keyOrObject]: value
        }
      });
    }
  };

  const handleStageSelect = (stage: EducationStage) => {
    let defaultGrade = '';
    if (stage === 'primary') defaultGrade = language === 'mk' ? '3то одделение' : '3rd Grade';
    if (stage === 'middle') defaultGrade = language === 'mk' ? '7мо одделение' : '7th Grade';
    if (stage === 'secondary') defaultGrade = language === 'mk' ? '10то одделение (II год.)' : '10th Grade';

    onChange({ stage, gradeLevel: defaultGrade });
  };

  const toggleFramework = (frameworkId: string) => {
    const current = form.pedagogicalFrameworks || [];
    if (current.includes(frameworkId)) {
      onChange({ pedagogicalFrameworks: current.filter(id => id !== frameworkId) });
    } else {
      onChange({ pedagogicalFrameworks: [...current, frameworkId] });
    }
  };

  const appendStudentProfileSnippet = (snippet: string) => {
    const existing = form.studentProfile.trim();
    if (!existing) {
      onChange({ studentProfile: snippet });
    } else if (!existing.includes(snippet)) {
      onChange({ studentProfile: `${existing}; ${snippet}` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Questionnaire Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {t.questionnaireTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            title={t.resetForm}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetForm}</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {t.questionnaireDesc}
        </p>
      </div>

      {/* 1. Education Stage Segmented Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
          {language === 'mk' ? 'Ниво на образование' : 'Education Stage'}
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleStageSelect('primary')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center cursor-pointer ${
              form.stage === 'primary'
                ? 'bg-white text-indigo-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.stagePrimary}
          </button>
          <button
            type="button"
            onClick={() => handleStageSelect('middle')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center cursor-pointer ${
              form.stage === 'middle'
                ? 'bg-white text-indigo-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.stageMiddle}
          </button>
          <button
            type="button"
            onClick={() => handleStageSelect('secondary')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center cursor-pointer ${
              form.stage === 'secondary'
                ? 'bg-white text-indigo-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.stageSecondary}
          </button>
        </div>
      </div>

      {/* 2. Terminology & Schema Rigor Level Slider + Auto-Adaptive Difficulty */}
      <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Header with Title and Auto-Adaptive Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.difficultyLabel}</span>
          </label>

          {/* Auto-Adaptive Difficulty Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAutoAdaptive}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                form.autoAdaptiveDifficulty
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
              title={t.autoAdaptiveDesc}
            >
              <Sparkles className={`w-3.5 h-3.5 ${form.autoAdaptiveDifficulty ? 'text-amber-200' : 'text-indigo-500'}`} />
              <span>{t.autoAdaptiveToggle}</span>
            </button>

            {form.autoAdaptiveDifficulty && (
              <button
                type="button"
                onClick={() => handleAnalyzeDifficulty()}
                disabled={isAnalyzingDifficulty}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-60"
              >
                {isAnalyzingDifficulty ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>{t.analyzingDifficulty}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-indigo-600" />
                    <span>{t.analyzeDifficultyBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Current Level Badge & Description */}
        <div className="flex items-center justify-between text-xs">
          <p className="text-[11px] text-slate-500 max-w-sm leading-snug">
            {t.difficultyHint}
          </p>
          <span className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200/80 px-2.5 py-0.5 rounded-md shadow-2xs shrink-0">
            {form.difficultyLevel === 1 
              ? (isMk ? 'Ниво 1: Базично' : 'Level 1: Foundations')
              : form.difficultyLevel === 2 
              ? (isMk ? 'Ниво 2: Во развој' : 'Level 2: Developing')
              : form.difficultyLevel === 4 
              ? (isMk ? 'Ниво 4: Напредно' : 'Level 4: Advanced')
              : form.difficultyLevel === 5 
              ? (isMk ? 'Ниво 5: Мајсторство' : 'Level 5: Mastery')
              : (isMk ? 'Ниво 3: Стандардно' : 'Level 3: Proficient')}
          </span>
        </div>

        {/* 1 to 5 Slider */}
        <div className="pt-1 px-1">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={form.difficultyLevel || 3}
            onChange={(e) => onChange({ difficultyLevel: parseInt(e.target.value, 10) })}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1.5 px-0.5">
            <span className={form.difficultyLevel === 1 ? 'font-bold text-indigo-700' : ''}>
              {isMk ? '1: Базично' : '1: Foundational'}
            </span>
            <span className={form.difficultyLevel === 2 ? 'font-bold text-indigo-700' : ''}>
              {isMk ? '2: Во развој' : '2: Developing'}
            </span>
            <span className={(!form.difficultyLevel || form.difficultyLevel === 3) ? 'font-bold text-indigo-700' : ''}>
              {isMk ? '3: Стандардно' : '3: Proficient'}
            </span>
            <span className={form.difficultyLevel === 4 ? 'font-bold text-indigo-700' : ''}>
              {isMk ? '4: Напредно' : '4: Advanced'}
            </span>
            <span className={form.difficultyLevel === 5 ? 'font-bold text-indigo-700' : ''}>
              {isMk ? '5: Мајсторство' : '5: Mastery'}
            </span>
          </div>
        </div>

        {/* Adaptive Diagnostic Rationale Card (if active or diagnosed) */}
        {(form.autoAdaptiveDifficulty || form.adaptiveRationale || adaptiveDiagnosis) && (
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/90 text-xs space-y-1 mt-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.adaptiveRationaleTitle}</span>
              <span className="text-[10px] font-mono text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-indigo-200">
                {t.adaptiveSuggested}: Ниво {form.difficultyLevel || 3}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {form.adaptiveRationale || adaptiveDiagnosis?.rationaleMk || adaptiveDiagnosis?.rationale || (
                isMk 
                  ? 'Авто-адаптивниот алгоритам го анализира когнитивниот товар на целите и профилот на учениците за оптимална тежина.'
                  : 'Auto-adaptive algorithm continuously evaluates cognitive load against student readiness.'
              )}
            </p>
          </div>
        )}
      </div>

      {/* 3. Subject, Grade & Task Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t.subjectLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder={t.subjectPlaceholder}
              required
              className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
          {/* Quick subject shortcuts */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {SUBJECT_OPTIONS.slice(0, 4).map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onChange({ subject: language === 'mk' ? sub.labelMk : sub.label })}
                className="text-[11px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                {language === 'mk' ? sub.labelMk : sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t.gradeLabel}
          </label>
          <input
            type="text"
            value={form.gradeLevel}
            onChange={(e) => onChange({ gradeLevel: e.target.value })}
            placeholder={t.gradePlaceholder}
            required
            className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Task Type */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          {t.taskTypeLabel}
        </label>
        <select
          value={form.taskType}
          onChange={(e) => onChange({ taskType: e.target.value })}
          className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
        >
          {TASK_TYPES.map(task => (
            <option key={task.id} value={language === 'mk' ? task.labelMk : task.label}>
              {language === 'mk' ? task.labelMk : task.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Topic & Learning Objectives */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t.topicLabel}
          </label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder={t.topicPlaceholder}
            required
            className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {t.objectivesLabel}
            </label>
            {onOpenBloomsGuide && (
              <button
                type="button"
                onClick={onOpenBloomsGuide}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/90 px-2.5 py-1 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer shadow-2xs"
                title={t.bloomsGuideTooltip}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.bloomsGuideButton}</span>
              </button>
            )}
          </div>
          <textarea
            value={form.learningObjectives}
            onChange={(e) => onChange({ learningObjectives: e.target.value })}
            placeholder={t.objectivesPlaceholder}
            rows={2}
            className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* 4. Pedagogical Frameworks Multi-Select (Crucial per prompt requirements) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 block">
            {t.frameworksLabel}
          </label>
          <div className="flex items-center gap-2">
            {onOpenBloomsGuide && (
              <button
                type="button"
                onClick={onOpenBloomsGuide}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                title={t.bloomsGuideTooltip}
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{language === 'mk' ? 'Блумов водич за рамки' : "Bloom's matrix guide"}</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              {form.pedagogicalFrameworks.length} {language === 'mk' ? 'избрани' : 'selected'}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {t.frameworksHint}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {PEDAGOGICAL_FRAMEWORKS.map(framework => {
            const isSelected = form.pedagogicalFrameworks.includes(framework.id);
            const title = language === 'mk' ? framework.nameMk : framework.name;
            const desc = language === 'mk' ? framework.descriptionMk : framework.description;

            return (
              <button
                key={framework.id}
                type="button"
                onClick={() => toggleFramework(framework.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-indigo-500/60 bg-indigo-50/40 text-slate-900 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Student Learner Profile & Diversity */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">
          {t.studentProfileLabel}
        </label>
        <textarea
          value={form.studentProfile}
          onChange={(e) => onChange({ studentProfile: e.target.value })}
          placeholder={t.studentProfilePlaceholder}
          rows={2}
          className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
        />
        {/* Quick Suggestion Pills */}
        <div className="pt-1">
          <span className="text-[11px] text-slate-400 block mb-1">
            {t.quickLearnerTags}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STUDENT_PROFILE_PRESETS.map(preset => {
              const label = language === 'mk' ? preset.labelMk : preset.label;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => appendStudentProfileSnippet(label)}
                  className="text-[11px] text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  + {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Practical Details: Duration & Materials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t.durationLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.lessonDuration}
              onChange={(e) => onChange({ lessonDuration: e.target.value })}
              placeholder={t.durationPlaceholder}
              className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t.materialsLabel}
          </label>
          <input
            type="text"
            value={form.materialsAndTech}
            onChange={(e) => onChange({ materialsAndTech: e.target.value })}
            placeholder={t.materialsPlaceholder}
            className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 7. Additional Teacher Notes */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          {t.customNotesLabel}
        </label>
        <input
          type="text"
          value={form.customNotes}
          onChange={(e) => onChange({ customNotes: e.target.value })}
          placeholder={t.customNotesPlaceholder}
          className="w-full text-sm bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* 8. Visual Media, Diagrams & Technical Graphics Specification */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Palette className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {t.visualAssetsSectionTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t.visualAssetsSectionDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVisualsExpanded(!isVisualsExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            {isVisualsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between pt-1 pb-1 border-t border-slate-200/60">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.visualSettings?.includeVisuals ?? true}
              onChange={(e) => updateVisualSetting('includeVisuals', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <span>{t.includeVisualsToggle}</span>
          </label>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
            NanoBanana · SVG · TikZ
          </span>
        </div>

        {/* Expanded Visual Asset Configurator */}
        {isVisualsExpanded && (form.visualSettings?.includeVisuals ?? true) && (
          <div className="pt-2">
            <VisualAssetConfigurator
              settings={form.visualSettings || {
                includeVisuals: true,
                visualType: 'technical_schematics',
                pedagogicalIntent: 'dual_coding',
                visualStyle: 'nanobanana_vector',
                accessibilityPalette: 'high_contrast',
                detailLevel: 'standard'
              }}
              topic={form.topic}
              gradeLevel={form.gradeLevel}
              language={language}
              onChange={(updated) => updateVisualSetting(updated)}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{t.optimizingButton}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{t.optimizeButton}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
