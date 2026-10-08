import React, { useState, useEffect, useCallback } from 'react';
import { Header, FontScale } from './components/Header.tsx';
import { QuestionnaireForm } from './components/QuestionnaireForm.tsx';
import { OutputConsole } from './components/OutputConsole.tsx';
import { PresetsModal } from './components/PresetsModal.tsx';
import { PromptLibraryModal } from './components/PromptLibraryModal.tsx';
import { BloomsTaxonomyModal } from './components/BloomsTaxonomyModal.tsx';
import { TrainingPresentationBanner } from './components/TrainingPresentationBanner.tsx';
import { 
  TeacherFormState, 
  PromptOptimizationResult, 
  SavedPromptItem, 
  TemplatePreset, 
  SupportedLanguage 
} from './types.ts';
import { TEMPLATE_PRESETS } from './constants/presets.ts';
import { TRANSLATIONS } from './constants/translations.ts';

const LOCAL_STORAGE_KEY_PROMPTS = 'eduprompt_saved_library_v1';
const LOCAL_STORAGE_KEY_LANG = 'eduprompt_language_preference';
const LOCAL_STORAGE_KEY_FONTSCALE = 'eduprompt_font_scale_pref';

const INITIAL_FORM_STATE: TeacherFormState = {
  subject: 'Математика',
  gradeLevel: '7мо одделение',
  stage: 'middle',
  taskType: 'План за наставен час (45-60 мин)',
  topic: 'Вовед во негативни броеви и бројна оска',
  learningObjectives: 'Учениците да го разберат значењето на броевите помали од нула преку реални примери (температура, надморска височина) и правилно да ги лоцираат на бројната оска.',
  pedagogicalFrameworks: ['bloom', 'inquiry'],
  studentProfile: 'Мешани способности; неколку ученици имаат потешкотии со апстрактно размислување и имаат потреба од визуелни модели.',
  lessonDuration: '45 минути',
  materialsAndTech: 'Бројна оска на табла, скала на термометар, работни листови.',
  customNotes: 'Започнете со истражувачко прашање и обезбедете формативно излезно ливче.',
  difficultyLevel: 3,
  autoAdaptiveDifficulty: true,
  visualSettings: {
    includeVisuals: true,
    visualType: 'technical_drawing',
    pedagogicalIntent: 'dual_coding',
    visualStyle: 'nanobanana_vector',
    accessibilityPalette: 'high_contrast',
    detailLevel: 'standard'
  }
};

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('mk');
  const [form, setForm] = useState<TeacherFormState>(INITIAL_FORM_STATE);
  const [result, setResult] = useState<PromptOptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>([]);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBloomsModalOpen, setIsBloomsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState<FontScale>('comfort');

  // Load language preference, font scale, and saved prompts from local storage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY_LANG) as SupportedLanguage | null;
      if (savedLang === 'en' || savedLang === 'mk') {
        setLanguage(savedLang);
      }

      const savedScale = localStorage.getItem(LOCAL_STORAGE_KEY_FONTSCALE) as FontScale | null;
      const effectiveScale = savedScale || 'comfort';
      setFontScale(effectiveScale);
      document.documentElement.setAttribute('data-font-scale', effectiveScale);

      const rawSaved = localStorage.getItem(LOCAL_STORAGE_KEY_PROMPTS);
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) {
          setSavedPrompts(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, lang);
    showToast(lang === 'mk' ? 'Јазикот е сменет на Македонски' : 'Language switched to English');
  };

  const handleFontScaleChange = (scale: FontScale) => {
    setFontScale(scale);
    localStorage.setItem(LOCAL_STORAGE_KEY_FONTSCALE, scale);
    document.documentElement.setAttribute('data-font-scale', scale);
    showToast(
      language === 'mk'
        ? scale === 'presentation'
          ? 'Големина: Режим за Проектор / Презентација (125%)'
          : scale === 'comfort'
          ? 'Големина: Оптимално за 1080p монитори (110%)'
          : 'Големина: Стандардна големина (100%)'
        : scale === 'presentation'
        ? 'Scale: Projector / Presentation mode (125%)'
        : scale === 'comfort'
        ? 'Scale: Comfortable for 1080p (110%)'
        : 'Scale: Standard (100%)'
    );
  };

  const handleFormChange = (updated: Partial<TeacherFormState>) => {
    setForm(prev => ({ ...prev, ...updated }));
  };

  const handleResetForm = () => {
    setForm({
      subject: '',
      gradeLevel: '',
      stage: 'middle',
      taskType: language === 'mk' ? 'План за наставен час (45-60 мин)' : 'Lesson Plan (45-60 min)',
      topic: '',
      learningObjectives: '',
      pedagogicalFrameworks: ['bloom'],
      studentProfile: '',
      lessonDuration: '45 min',
      materialsAndTech: '',
      customNotes: '',
      difficultyLevel: 2
    });
    setResult(null);
    showToast(language === 'mk' ? 'Формата е ресетирана' : 'Form reset');
  };

  const handleSelectPreset = (preset: TemplatePreset) => {
    setForm(preset.state);
    showToast(TRANSLATIONS[language].presetLoaded);
  };

  // Submit questionnaire to optimize prompt
  const handleOptimizePrompt = async () => {
    if (!form.topic.trim()) {
      showToast(language === 'mk' ? 'Ве молам внесете наставна содржина / тема' : 'Please provide a lesson topic');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          language
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server returned an error');
      }

      const data = await response.json();
      let resolvedVisualAssets = data.visualAssets || [];
      if (form.visualSettings?.previewThumbnail) {
        resolvedVisualAssets = [
          form.visualSettings.previewThumbnail,
          ...resolvedVisualAssets.filter((v: any) => v.id !== form.visualSettings?.previewThumbnail?.id)
        ];
      }

      const newResult: PromptOptimizationResult = {
        id: `opt-${Date.now()}`,
        timestamp: Date.now(),
        input: { ...form },
        rawOutput: data.rawOutput || '',
        unifiedCodeBlock: data.unifiedCodeBlock || '',
        parsedJson: data.parsedJson || null,
        jsonString: data.jsonString || '',
        chainOfThought: data.chainOfThought || '',
        keyVocabulary: data.keyVocabulary || [],
        totEvaluation: data.totEvaluation,
        timeline: data.timeline,
        visualAssets: resolvedVisualAssets,
      };

      setResult(newResult);
      showToast(language === 'mk' ? 'Промптот е успешно оптимизиран!' : 'Prompt successfully optimized!');
    } catch (err: any) {
      console.error('Error optimizing prompt:', err);
      showToast(err.message || (language === 'mk' ? 'Грешка при оптимизација' : 'Optimization failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Run test in sandbox (Execute prompt to generate actual teaching material)
  const handleRunSandboxTest = async () => {
    if (!result) return;
    setIsTesting(true);

    try {
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonSchema: result.parsedJson || result.jsonString,
          chainOfThought: result.chainOfThought,
          outputLanguage: language === 'mk' ? 'Macedonian' : 'English',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate educational material');
      }

      const data = await response.json();
      setResult(prev => prev ? { 
        ...prev, 
        generatedMaterial: data.material,
        keyVocabulary: data.keyVocabulary && data.keyVocabulary.length > 0 ? data.keyVocabulary : prev.keyVocabulary 
      } : null);
      showToast(language === 'mk' ? 'Наставниот материјал е успешно генериран!' : 'Classroom material generated successfully!');
    } catch (err: any) {
      console.error('Error generating material:', err);
      showToast(err.message || 'Generation failed');
    } finally {
      setIsTesting(false);
    }
  };

  // Save prompt to local library
  const handleSaveToLibrary = () => {
    if (!result) return;
    const exists = savedPrompts.some(p => p.id === result.id || p.unifiedCodeBlock === result.unifiedCodeBlock);
    if (exists) {
      showToast(TRANSLATIONS[language].alreadySaved);
      return;
    }

    const newItem: SavedPromptItem = {
      id: result.id,
      title: `${result.input.subject || 'Lesson'}: ${result.input.topic || 'Unit'}`,
      timestamp: Date.now(),
      stage: result.input.stage,
      subject: result.input.subject || 'General',
      taskType: result.input.taskType || 'Lesson Plan',
      unifiedCodeBlock: result.unifiedCodeBlock,
      parsedJson: result.parsedJson,
      chainOfThought: result.chainOfThought,
      keyVocabulary: result.keyVocabulary,
      frameworks: result.input.pedagogicalFrameworks,
      difficultyLevel: result.input.difficultyLevel,
      gradeLevel: result.input.gradeLevel,
      topic: result.input.topic,
    };

    const updated = [newItem, ...savedPrompts];
    setSavedPrompts(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROMPTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
    showToast(language === 'mk' ? 'Зачувано во вашата библиотека!' : 'Saved to prompt library!');
  };

  const handleDeleteSavedPrompt = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROMPTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage delete failed:', e);
    }
  };

  const handleLoadSavedPrompt = (item: SavedPromptItem) => {
    if (item.parsedJson) {
      setForm(prev => ({
        ...prev,
        subject: item.parsedJson?.subject || prev.subject,
        gradeLevel: item.parsedJson?.grade_level || item.parsedJson?.grade || prev.gradeLevel,
        topic: item.parsedJson?.topic || item.parsedJson?.lesson_topic || prev.topic,
        taskType: item.taskType || prev.taskType,
      }));
    }
    setResult({
      id: item.id,
      timestamp: item.timestamp,
      input: { ...form, subject: item.subject, taskType: item.taskType },
      rawOutput: item.unifiedCodeBlock,
      unifiedCodeBlock: item.unifiedCodeBlock,
      parsedJson: item.parsedJson,
      jsonString: item.parsedJson ? JSON.stringify(item.parsedJson, null, 2) : '',
      chainOfThought: item.chainOfThought,
    });
    showToast(language === 'mk' ? 'Зачуваниот промпт е вчитан!' : 'Saved prompt loaded!');
  };

  const handleApplyBloomObjective = (objectiveText: string) => {
    setForm((prev) => {
      const existing = prev.learningObjectives.trim();
      if (!existing) {
        return { ...prev, learningObjectives: objectiveText };
      }
      if (existing.includes(objectiveText)) {
        return prev;
      }
      return { ...prev, learningObjectives: `${existing}\n- ${objectiveText}` };
    });
    showToast(language === 'mk' ? 'Целта е успешно додадена во прашалникот!' : 'Learning objective appended to questionnaire!');
  };

  const handleSelectBloomFrameworks = (frameworkIds: string[]) => {
    setForm((prev) => {
      const merged = Array.from(new Set([...prev.pedagogicalFrameworks, ...frameworkIds]));
      return { ...prev, pedagogicalFrameworks: merged };
    });
    showToast(language === 'mk' ? 'Педагошките рамки се успешно усогласени!' : 'Pedagogical frameworks updated in form!');
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to optimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isLoading) {
          handleOptimizePrompt();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, form]);

  const isCurrentResultSaved = result
    ? savedPrompts.some(p => p.id === result.id || p.unifiedCodeBlock === result.unifiedCodeBlock)
    : false;

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navigation */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenBloomsGuide={() => setIsBloomsModalOpen(true)}
        fontScale={fontScale}
        onFontScaleChange={handleFontScaleChange}
        savedCount={savedPrompts.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Presentation & Teacher Training Guide Banner */}
        <TrainingPresentationBanner
          language={language}
          onLoadShowcaseDemo={() => handleSelectPreset(TEMPLATE_PRESETS[0])}
        />

        {/* Editorial Subtitle / Context Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 sm:px-6 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                {language === 'mk' ? 'Педагошка оптимизација' : 'Pedagogical Optimization'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {language === 'mk' ? 'Минимален JSON + Синџир на расудување' : 'Minimal JSON Schema + Chain-of-thought'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPresetsOpen(true)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg border border-indigo-200/60 transition-colors cursor-pointer"
            >
              {language === 'mk' ? 'Види примери за час' : 'Explore Teacher Examples'}
            </button>
          </div>
        </div>

        {/* 2-Column Split: Questionnaire (Left) + Output Console (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Questionnaire Form (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <QuestionnaireForm
              form={form}
              onChange={handleFormChange}
              onSubmit={handleOptimizePrompt}
              onReset={handleResetForm}
              isLoading={isLoading}
              language={language}
              onOpenBloomsGuide={() => setIsBloomsModalOpen(true)}
            />
          </div>

          {/* Right Column: Output Console (7 cols on lg) */}
          <div className="lg:col-span-7 sticky top-22">
            <OutputConsole
              result={result}
              history={savedPrompts}
              currentForm={form}
              onAdoptResult={(adopted) => {
                setResult(adopted);
                showToast(language === 'mk' ? 'Варијантата е поставена како главен излез!' : 'Adopted variant as active result!');
              }}
              isLoading={isLoading}
              onRunTest={handleRunSandboxTest}
              isTesting={isTesting}
              onSavePrompt={handleSaveToLibrary}
              isSaved={isCurrentResultSaved}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* Educational Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">
              {t.appTitle} · {language === 'mk' ? 'Оптимизатор за наставници' : 'Teacher Prompt Optimizer'}
            </p>
            <p className="text-[11px] text-slate-400">
              {language === 'mk'
                ? 'Форматира чисти минимални JSON шеми и чекор-по-чекор педагошко расудување базирано на Блумова таксономија.'
                : 'Engineered for clean minimal JSON schemas and step-by-step pedagogical chain-of-thought.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Primary (1-5)</span>
            <span>·</span>
            <span>Middle (6-8)</span>
            <span>·</span>
            <span>Secondary (9-12)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
        language={language}
      />

      <PromptLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        prompts={savedPrompts}
        onLoadPrompt={handleLoadSavedPrompt}
        onDeletePrompt={handleDeleteSavedPrompt}
        language={language}
      />

      {/* Bloom's Taxonomy Reference Guide Modal */}
      <BloomsTaxonomyModal
        isOpen={isBloomsModalOpen}
        onClose={() => setIsBloomsModalOpen(false)}
        language={language}
        onApplyObjective={handleApplyBloomObjective}
        onSelectFrameworks={handleSelectBloomFrameworks}
        selectedFrameworks={form.pedagogicalFrameworks}
      />
    </div>
  );
}
