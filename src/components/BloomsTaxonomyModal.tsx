import React, { useState, useMemo } from 'react';
import { 
  X, 
  GraduationCap, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  ArrowRight, 
  Info,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { SupportedLanguage } from '../types.ts';
import { BLOOMS_TAXONOMY_LEVELS, BloomLevelData } from '../constants/bloomsTaxonomy.ts';
import { PEDAGOGICAL_FRAMEWORKS } from '../constants/frameworks.ts';
import { TRANSLATIONS } from '../constants/translations.ts';

interface BloomsTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onApplyObjective?: (objectiveText: string) => void;
  onSelectFrameworks?: (frameworkIds: string[]) => void;
  selectedFrameworks?: string[];
}

export const BloomsTaxonomyModal: React.FC<BloomsTaxonomyModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyObjective,
  onSelectFrameworks,
  selectedFrameworks = [],
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'frameworksMatrix'>('levels');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'LOTS' | 'HOTS'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [appliedObjectiveId, setAppliedObjectiveId] = useState<string | null>(null);
  const [appliedFrameworksLevelId, setAppliedFrameworksLevelId] = useState<string | null>(null);

  const isMk = language === 'mk';
  const t = TRANSLATIONS[language];

  // Filtered levels based on search and category
  const filteredLevels = useMemo(() => {
    return BLOOMS_TAXONOMY_LEVELS.filter((level) => {
      // Category filter (LOTS / HOTS)
      if (categoryFilter !== 'all' && level.category !== categoryFilter) {
        return false;
      }

      // Tab selection (specific level or all)
      if (selectedLevelId !== 'all' && level.id !== selectedLevelId) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const name = isMk ? level.nameMk.toLowerCase() : level.name.toLowerCase();
      const summary = isMk ? level.summaryMk.toLowerCase() : level.summary.toLowerCase();
      const verbs = isMk 
        ? level.verbsMk.join(' ').toLowerCase() 
        : level.verbs.join(' ').toLowerCase();
      const sample = isMk ? level.sampleObjectiveMk.toLowerCase() : level.sampleObjective.toLowerCase();
      const context = isMk ? level.stemContextMk.toLowerCase() : level.stemContext.toLowerCase();

      return (
        name.includes(q) ||
        summary.includes(q) ||
        verbs.includes(q) ||
        sample.includes(q) ||
        context.includes(q)
      );
    });
  }, [categoryFilter, selectedLevelId, searchQuery, isMk]);

  if (!isOpen) return null;

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1800);
  };

  const handleApplyObjective = (level: BloomLevelData) => {
    const text = isMk ? level.sampleObjectiveMk : level.sampleObjective;
    if (onApplyObjective) {
      onApplyObjective(text);
      setAppliedObjectiveId(level.id);
      setTimeout(() => setAppliedObjectiveId(null), 2500);
    }
  };

  const handleApplyFrameworks = (level: BloomLevelData) => {
    if (onSelectFrameworks && level.suggestedFrameworkIds.length > 0) {
      onSelectFrameworks(level.suggestedFrameworkIds);
      setAppliedFrameworksLevelId(level.id);
      setTimeout(() => setAppliedFrameworksLevelId(null), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {isMk ? 'Референтен водич за Блумова таксономија' : "Bloom's Taxonomy Reference Guide"}
                </h3>
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  {isMk ? 'Педагошки стандард' : 'Pedagogical Framework'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {isMk 
                  ? 'Изберете соодветни когнитивни нивоа, оперативни глаголи и формулирајте прецизни цели на часот со директна синергија со наставните рамки.'
                  : 'Select cognitive levels, discover operational action verbs, and formulate rigorous learning objectives aligned with pedagogical frameworks.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isMk ? 'Затвори' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar: View Switcher, Filter Pills & Search */}
        <div className="p-3.5 sm:px-5 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Main View Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('levels')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'levels'
                    ? 'bg-white text-indigo-950 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isMk ? 'Когнитивни нивоа (1-6)' : 'Cognitive Levels (1-6)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('frameworksMatrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'frameworksMatrix'
                    ? 'bg-white text-indigo-950 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isMk ? 'Матрица на рамки' : 'Framework Matrix'}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMk ? 'Пребарај глаголи или поими...' : 'Search verbs, keywords, topics...'}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cognitive Ladder Quick Selectors */}
          {activeTab === 'levels' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>{isMk ? 'Ниво:' : 'Level:'}</span>
              </span>

              <button
                type="button"
                onClick={() => { setSelectedLevelId('all'); setCategoryFilter('all'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedLevelId === 'all' && categoryFilter === 'all'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isMk ? 'Сите (1-6)' : 'All (1-6)'}
              </button>

              <button
                type="button"
                onClick={() => { setSelectedLevelId('all'); setCategoryFilter('LOTS'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  categoryFilter === 'LOTS' && selectedLevelId === 'all'
                    ? 'bg-sky-700 text-white font-semibold shadow-2xs'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
                }`}
              >
                {isMk ? 'LOTS (Ниво 1-3)' : 'LOTS (Levels 1-3)'}
              </button>

              <button
                type="button"
                onClick={() => { setSelectedLevelId('all'); setCategoryFilter('HOTS'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  categoryFilter === 'HOTS' && selectedLevelId === 'all'
                    ? 'bg-purple-700 text-white font-semibold shadow-2xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
                }`}
              >
                {isMk ? 'HOTS (Ниво 4-6)' : 'HOTS (Levels 4-6)'}
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

              {BLOOMS_TAXONOMY_LEVELS.map((level) => {
                const isSelected = selectedLevelId === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => { setSelectedLevelId(level.id); setCategoryFilter('all'); }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${level.badgeColor.accent}`} />
                    <span>{level.level}. {isMk ? level.nameMk.split(' ')[1] : level.name.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/40">
          
          {activeTab === 'levels' ? (
            <>
              {filteredLevels.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
                  <Info className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    {isMk ? 'Нема пронајдено резултати' : 'No matching cognitive levels or verbs found'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isMk ? 'Обидете се со друг поим за пребарување или ресетирајте го филтерот.' : 'Try a different search term or clear the filter.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setSelectedLevelId('all'); }}
                    className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {isMk ? 'Ресетирај филтри' : 'Reset filters'}
                  </button>
                </div>
              ) : (
                filteredLevels.map((level) => {
                  const isLots = level.category === 'LOTS';
                  const title = isMk ? level.nameMk : level.name;
                  const summary = isMk ? level.summaryMk : level.summary;
                  const verbs = isMk ? level.verbsMk : level.verbs;
                  const sampleObj = isMk ? level.sampleObjectiveMk : level.sampleObjective;
                  const stemContext = isMk ? level.stemContextMk : level.stemContext;
                  const rationale = isMk ? level.pedagogicalRationaleMk : level.pedagogicalRationale;
                  const isObjApplied = appliedObjectiveId === level.id;
                  const areFrameworksApplied = appliedFrameworksLevelId === level.id;

                  // Lookup frameworks names
                  const suggestedFrameworkNames = level.suggestedFrameworkIds
                    .map(id => PEDAGOGICAL_FRAMEWORKS.find(f => f.id === id))
                    .filter(Boolean);

                  return (
                    <div 
                      key={level.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Card Header Banner */}
                      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${level.badgeColor.accent}`}>
                            {level.level}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {title}
                              </h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                isLots 
                                  ? 'bg-sky-50 text-sky-800 border-sky-200' 
                                  : 'bg-purple-50 text-purple-800 border-purple-200'
                              }`}>
                                {isMk ? level.categoryLabelMk : level.categoryLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                              {summary}
                            </p>
                          </div>
                        </div>

                        {/* Top Action Quick Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {onApplyObjective && (
                            <button
                              type="button"
                              onClick={() => handleApplyObjective(level)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                isObjApplied
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70'
                              }`}
                              title={isMk ? 'Вметни ја оваа цел во прашалникот' : 'Append this target outcome to the form'}
                            >
                              {isObjApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isMk ? 'Додадено во цели!' : 'Appended to Form!'}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{isMk ? 'Користи како цел' : 'Use as Objective'}</span>
                                </>
                              )}
                            </button>
                          )}

                          {onSelectFrameworks && suggestedFrameworkNames.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleApplyFrameworks(level)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                areFrameworksApplied
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title={isMk ? 'Автоматски избери ги овие рамки во прашалникот' : 'Select suggested frameworks in form'}
                            >
                              {areFrameworksApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isMk ? 'Избрани!' : 'Selected!'}</span>
                                </>
                              ) : (
                                <>
                                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                                  <span>{isMk ? 'Поврзи рамки' : 'Sync Frameworks'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Content Grid */}
                      <div className="p-4 space-y-4 text-xs">
                        
                        {/* 1. Action Verbs Pills */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              <span>{isMk ? 'Оперативни глаголи за наставни цели (кликни за копирање):' : 'Action Verbs for Learning Objectives (click to copy):'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {verbs.length} {isMk ? 'глаголи' : 'verbs'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {verbs.map((verb) => {
                              const isCopied = copiedVerb === verb;
                              return (
                                <button
                                  key={verb}
                                  type="button"
                                  onClick={() => handleCopyVerb(verb)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white border-emerald-600 scale-105'
                                      : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border-slate-200/80'
                                  }`}
                                  title={isMk ? `Копирај: ${verb}` : `Copy verb: ${verb}`}
                                >
                                  <span>{verb}</span>
                                  {isCopied ? (
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Sample Classroom Target Outcome */}
                        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-indigo-600" />
                              <span>{isMk ? 'Пример за дефинирана цел на часот:' : 'Classroom-Ready Target Outcome:'}</span>
                            </span>
                            {onApplyObjective && (
                              <button
                                type="button"
                                onClick={() => handleApplyObjective(level)}
                                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isMk ? 'Вметни во прашалникот' : 'Append to Form'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-indigo-950/90 leading-relaxed font-sans italic bg-white p-2.5 rounded-lg border border-indigo-100/70">
                            "{sampleObj}"
                          </p>
                        </div>

                        {/* 3. STEM / Math Classroom Context & Framework Synergy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          
                          {/* STEM Context */}
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                              {isMk ? 'Математички & STEM контекст:' : 'STEM & Mathematics Context:'}
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {stemContext}
                            </p>
                          </div>

                          {/* Pedagogical Rationale & Framework Synergy */}
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                {isMk ? 'Синергија со педагошки рамки:' : 'Framework Synergy & Rationale:'}
                              </span>
                              <div className="flex items-center gap-1">
                                {suggestedFrameworkNames.map(fw => fw && (
                                  <span 
                                    key={fw.id} 
                                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                      selectedFrameworks.includes(fw.id)
                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                                        : 'bg-white text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {isMk ? fw.nameMk.split(' ')[0] : fw.name.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {rationale}
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            /* Frameworks Matrix Comparison View */
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    {isMk ? 'Матрица на корелација: Блумова таксономија и педагошки рамки' : "Correlation Matrix: Bloom's Taxonomy & Pedagogical Frameworks"}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMk
                    ? 'Оваа матрица им помага на наставниците да ги изберат најефикасните педагошки рамки во зависност од доминантните когнитивни цели на часот.'
                    : 'This matrix illustrates how each Bloom cognitive level maps to instructional and inclusive frameworks for seamless lesson design.'}
                </p>

                {/* Table representation */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">{isMk ? 'Блумово ниво' : "Bloom's Level"}</th>
                        <th className="p-3">{isMk ? 'Когнитивен фокус' : 'Cognitive Focus'}</th>
                        <th className="p-3">{isMk ? 'Примарни рамки' : 'Primary Frameworks'}</th>
                        <th className="p-3">{isMk ? 'Типична наставна активност' : 'Typical Lesson Activity'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="p-3 font-semibold text-sky-900">1. Запомни (Remember)</td>
                        <td className="p-3 text-slate-600">Факти, симболи, формули</td>
                        <td className="p-3 font-medium text-slate-800">Scaffolding, Gagné Events 1-3</td>
                        <td className="p-3 text-slate-600">Флеш-картички, дијагностички квиз, именување елементи</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-emerald-900">2. Разбери (Understand)</td>
                        <td className="p-3 text-slate-600">Парафразирање, визуелизација</td>
                        <td className="p-3 font-medium text-slate-800">UDL (Репрезентација), Скелиња</td>
                        <td className="p-3 text-slate-600">Цртање модели со плочки, толкување оски, објаснување со зборови</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-indigo-900">3. Примени (Apply)</td>
                        <td className="p-3 text-slate-600">Пресметки, стандардни задачи</td>
                        <td className="p-3 font-medium text-slate-800">Differentiated Instruction, Gagné 5-6</td>
                        <td className="p-3 text-slate-600">Решавање задачи во нивоа, пресметки на рампи/триаголници</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-amber-900">4. Анализирај (Analyze)</td>
                        <td className="p-3 text-slate-600">Деконструкција, детекција грешки</td>
                        <td className="p-3 font-medium text-slate-800">5E Instructional Model, Inquiry-Based</td>
                        <td className="p-3 text-slate-600">Error analysis (најди ја грешката), споредба на два метода</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-rose-900">5. Евалуирај (Evaluate)</td>
                        <td className="p-3 text-slate-600">Аргументација, одбрана на метод</td>
                        <td className="p-3 font-medium text-slate-800">Socratic Questioning, Проблемско учење</td>
                        <td className="p-3 text-slate-600">Математичка дебата, проверка на реалноста на резултатот</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-purple-900">6. Креирај (Create)</td>
                        <td className="p-3 text-slate-600">Синтеза, нов модел, истражување</td>
                        <td className="p-3 font-medium text-slate-800">Project-Based Learning, 5E Elaborate</td>
                        <td className="p-3 text-slate-600">Проектирање мост, формулирање задачи за соучениците</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pedagogical Guidance Tip */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-indigo-950">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    {isMk ? 'Педагошки совет за наставниците:' : 'Pedagogical Recommendation for Teachers:'}
                  </p>
                  <p className="text-indigo-900/90 leading-relaxed">
                    {isMk
                      ? 'Ефикасен наставен час никогаш не останува исклучиво на ниво 1 (Запомни). Најдобрите резултати се постигнуваат кога часот започнува со стабилна основа (Ниво 1-2), се движи кон примена (Ниво 3) и завршува со барем една активност од повисок ред (Анализа, Евалуација или Креирање) за поттикнување на длабоко математичко размислување.'
                      : 'High-impact lessons progress naturally from foundational recall (Levels 1-2) through procedural fluency (Level 3) into higher-order synthesis (Levels 4-6) to cultivate deep critical thinking.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              {isMk ? 'Кликнете на кој било оперативен глагол за да го копирате' : 'Click any action verb to copy it to clipboard'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            {isMk ? 'Затвори водич' : 'Close Guide'}
          </button>
        </div>

      </div>
    </div>
  );
};
