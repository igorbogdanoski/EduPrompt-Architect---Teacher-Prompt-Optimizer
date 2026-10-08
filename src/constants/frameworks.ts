import { PedagogicalFrameworkOption } from '../types.ts';

export const PEDAGOGICAL_FRAMEWORKS: PedagogicalFrameworkOption[] = [
  {
    id: "bloom",
    name: "Bloom's Revised Taxonomy",
    nameMk: "Ревидирана Блумова таксономија",
    category: "cognitive",
    description: "Guides cognitive progression: Remember, Understand, Apply, Analyze, Evaluate, Create.",
    descriptionMk: "Когнитивна прогресија: Памтење, Разбирање, Примена, Анализа, Евалуација, Создавање."
  },
  {
    id: "5e",
    name: "5E Instructional Model",
    nameMk: "5E Инструкциски модел",
    category: "instructional",
    description: "Sequential inquiry cycle: Engage, Explore, Explain, Elaborate, Evaluate.",
    descriptionMk: "Секвенцијален истражувачки циклус: Мотивација, Истражување, Објаснување, Продлабочување, Евалуација."
  },
  {
    id: "udl",
    name: "Universal Design for Learning (UDL)",
    nameMk: "Универзален дизајн за учење (UDL)",
    category: "inclusive",
    description: "Multiple means of Engagement, Representation, and Action & Expression.",
    descriptionMk: "Повеќекратни начини на ангажирање, претставување и дејствување/изразување."
  },
  {
    id: "inquiry",
    name: "Inquiry-Based Learning",
    nameMk: "Учење базирано на истражување",
    category: "inquiry",
    description: "Student-centered investigation driven by questions, hypothesis, and discovery.",
    descriptionMk: "Учење водено од прашања, поставување хипотези и самостојно откривање."
  },
  {
    id: "scaffolding",
    name: "Scaffolding & Vygotsky ZPD",
    nameMk: "Скеле / Зона на нареден развој (ЗНР)",
    category: "instructional",
    description: "Temporary instructional supports fading as student mastery increases.",
    descriptionMk: "Постапна педагошка поддршка која се намалува како што расте самостојноста."
  },
  {
    id: "differentiated",
    name: "Differentiated Instruction (Tomlinson)",
    nameMk: "Диференцирана настава",
    category: "inclusive",
    description: "Adapting content, process, products, and environment by readiness and interest.",
    descriptionMk: "Прилагодување на содржината, процесот и продуктот според подготвеноста на учениците."
  },
  {
    id: "socratic",
    name: "Socratic Questioning & Seminar",
    nameMk: "Сократов дијалог и прашања",
    category: "cognitive",
    description: "Disciplined questioning to probe deeper thinking, assumptions, and synthesis.",
    descriptionMk: "Систематски дијалог за продлабочување на критичкото размислување и аргументација."
  }
];

export const TASK_TYPES = [
  { id: 'lesson-plan', label: 'Lesson Plan (45-60 min)', labelMk: 'План за наставен час (45-60 мин)' },
  { id: 'diff-activity', label: 'Differentiated Group Activity', labelMk: 'Диференцирана групна активност' },
  { id: 'formative-rubric', label: 'Formative Assessment & Rubric', labelMk: 'Формативно оценување и рубрика' },
  { id: 'pbl-unit', label: 'Project-Based Learning (PBL) Unit', labelMk: 'Проектно ориентирана наставна целина' },
  { id: 'inquiry-lab', label: 'Hands-on Inquiry Lab / Experiment', labelMk: 'Практична истражувачка вежба / лабораторија' },
  { id: 'remediation', label: 'Remediation & Scaffolding Sheet', labelMk: 'Наставен лист за поддршка (ремедијација)' },
  { id: 'enrichment', label: 'Enrichment Challenge for Advanced Learners', labelMk: 'Предизвик за напредни ученици' }
];

export const SUBJECT_OPTIONS = [
  { id: 'math', label: 'Mathematics', labelMk: 'Математика' },
  { id: 'science', label: 'Natural Sciences', labelMk: 'Природни науки' },
  { id: 'physics', label: 'Physics', labelMk: 'Физика' },
  { id: 'chemistry', label: 'Chemistry', labelMk: 'Хемија' },
  { id: 'biology', label: 'Biology', labelMk: 'Биологија' },
  { id: 'language', label: 'Language Arts / Literature', labelMk: 'Мајчин јазик и литература' },
  { id: 'english', label: 'English as Second Language (ESL)', labelMk: 'Англиски јазик' },
  { id: 'history', label: 'History & Social Studies', labelMk: 'Историја и општество' },
  { id: 'geography', label: 'Geography', labelMk: 'Географија' },
  { id: 'cs', label: 'Informatics & Computer Science', labelMk: 'Информатика и програмирање' },
  { id: 'art', label: 'Visual Arts & Music', labelMk: 'Ликовно и музичко образование' }
];

export const STUDENT_PROFILE_PRESETS = [
  { id: 'mixed', label: 'Mixed ability with varied learning paces', labelMk: 'Мешани способности со различно темпо на учење' },
  { id: 'concrete', label: 'Concrete-first learners needing visual models', labelMk: 'Ученици кои бараат визуелни и конкретни модели' },
  { id: 'abstract-struggle', label: 'Struggling with abstract concepts & vocabulary', labelMk: 'Потешкотии со апстрактни поими и стручна терминологија' },
  { id: 'ell', label: 'English language learners requiring linguistic scaffolds', labelMk: 'Јазични бариери, потребна визуелна и јазична поддршка' },
  { id: 'high-readiness', label: 'High-readiness students needing cognitive stretch', labelMk: 'Напредни ученици со потреба од продлабочен предизвик' },
  { id: 'kinesthetic', label: 'Active hands-on / kinesthetic learners', labelMk: 'Кинестетички ученици, потреба од практични манипулативи' }
];

export interface PromptReasoningParadigmOption {
  id: 'tot' | 'cot' | 'socratic_curious' | 'multi_perspective';
  label: string;
  labelMk: string;
  badge: string;
  badgeMk: string;
  description: string;
  descriptionMk: string;
}

export const PROMPT_REASONING_PARADIGMS: PromptReasoningParadigmOption[] = [
  {
    id: 'tot',
    label: 'Tree-of-Thoughts (ToT)',
    labelMk: 'Tree-of-Thoughts (ToT) · Гранење на мисли',
    badge: 'ToT Engine',
    badgeMk: 'ToT Гранење',
    description: 'Explores multiple pedagogical branches, evaluates their cognitive tradeoffs, and synthesizes the optimal instructional path.',
    descriptionMk: 'Истражува повеќе алтернативни педагошки гранки, ги евалиуира нивните предности и синтетизира оптимална наставна траекторија.'
  },
  {
    id: 'cot',
    label: 'Chain-of-Thought (CoT)',
    labelMk: 'Chain-of-Thought (CoT) · Чекор-по-чекор',
    badge: 'CoT Linear',
    badgeMk: 'CoT Линеарно',
    description: 'Rigorous sequential step-by-step reasoning guiding the AI through pedagogical progression before output.',
    descriptionMk: 'Строго секвенцијално чекор-по-чекор логичко расудување кое го води моделот низ наставните фази пред финалниот излез.'
  },
  {
    id: 'socratic_curious',
    label: 'Curious Student / Flipped Socratic',
    labelMk: 'ВИ како љубопитен ученик · Обратна улога',
    badge: 'Flipped Socratic',
    badgeMk: 'Обратна улога',
    description: 'Inverts the dynamic: AI acts as an inquisitive student asking targeted questions so students argue and explain.',
    descriptionMk: 'Ја инвертира динамиката: ВИ делува како љубопитен ученик што поставува прашања, а учениците аргументираат и објаснуваат.'
  },
  {
    id: 'multi_perspective',
    label: 'Multi-Perspective Dialectic',
    labelMk: 'Мултиперспективна дебата & Критичко мислење',
    badge: 'Dialectic Debate',
    badgeMk: 'Дебата & Анализа',
    description: 'Simulates conflicting viewpoints and stakeholder debates to foster high-order critical reasoning.',
    descriptionMk: 'Симулира спротивставени гледни точки и дебата меѓу чинители за развој на длабоко критичко размислување.'
  }
];

export interface PromptStrategyItem {
  id: string;
  category: 'role_cognitive' | 'authentic_context' | 'differentiation_inclusion';
  categoryTitleMk: string;
  categoryTitleEn: string;
  nameMk: string;
  nameEn: string;
  descriptionMk: string;
  descriptionEn: string;
  technique: string;
}

export const PEDAGOGICAL_PROMPT_STRATEGIES: PromptStrategyItem[] = [
  // Секција 1: Педагошки Улоги & Когнитивна Активација (Image 1)
  {
    id: 'expert_simulation',
    category: 'role_cognitive',
    categoryTitleMk: 'Педагошки улоги и когнитивна активација',
    categoryTitleEn: 'Pedagogical Roles & Cognitive Activation',
    nameMk: 'Симулација на експертски перспективи',
    nameEn: 'Expert Perspective Simulation',
    descriptionMk: 'Доделување специфична улога на моделот (ментор, историска личност, научен соработник).',
    descriptionEn: 'Assigns a specific persona to the model (mentor, historical figure, scientific researcher).',
    technique: 'Persona Prompting'
  },
  {
    id: 'curious_student',
    category: 'role_cognitive',
    categoryTitleMk: 'Педагошки улоги и когнитивна активација',
    categoryTitleEn: 'Pedagogical Roles & Cognitive Activation',
    nameMk: 'ВИ како љубопитен ученик',
    nameEn: 'AI as Inquisitive Student',
    descriptionMk: 'Примена на обратна улога каде моделот поставува прашања, а учениците аргументираат и објаснуваат.',
    descriptionEn: 'Flipped role prompting where the model asks probing questions and students explain & justify.',
    technique: 'Reverse Socratic / Feynman'
  },
  {
    id: 'deep_cognitive',
    category: 'role_cognitive',
    categoryTitleMk: 'Педагошки улоги и когнитивна активација',
    categoryTitleEn: 'Pedagogical Roles & Cognitive Activation',
    nameMk: 'Длабока когнитивна активација',
    nameEn: 'Deep Cognitive Activation',
    descriptionMk: 'Поттикнување на повисоки мисловни процеси (анализа, евалуација, синтеза) преку комплексни сценарија.',
    descriptionEn: 'Stimulating higher-order thinking (analyze, evaluate, create) via complex curricular dilemmas.',
    technique: 'Higher-Order Bloom'
  },
  {
    id: 'debate_critical',
    category: 'role_cognitive',
    categoryTitleMk: 'Педагошки улоги и когнитивна активација',
    categoryTitleEn: 'Pedagogical Roles & Cognitive Activation',
    nameMk: 'Развој на дебата и критичко мислење',
    nameEn: 'Debate & Critical Thinking',
    descriptionMk: 'Согледување на еден наставен проблем низ различни, спротивставени гледни точки.',
    descriptionEn: 'Examining an instructional problem through contrasting, opposing viewpoints and arguments.',
    technique: 'Dialectic Debate'
  },

  // Секција 2: Автентични Наставни Контексти & Интердисциплинарност (Image 2)
  {
    id: 'authentic_context',
    category: 'authentic_context',
    categoryTitleMk: 'Автентични контексти и интердисциплинарност',
    categoryTitleEn: 'Authentic Contexts & Interdisciplinary Links',
    nameMk: 'Автентични наставни контексти',
    nameEn: 'Authentic Instructional Contexts',
    descriptionMk: 'Брзо креирање реални сценарија и проблеми за интердисциплинарни проекти.',
    descriptionEn: 'Rapid creation of real-world scenarios and authentic dilemmas for interdisciplinary projects.',
    technique: 'PBL Contextualization'
  },
  {
    id: 'multi_perspective',
    category: 'authentic_context',
    categoryTitleMk: 'Автентични контексти и интердисциплинарност',
    categoryTitleEn: 'Authentic Contexts & Interdisciplinary Links',
    nameMk: 'Мултиперспективност',
    nameEn: 'Multi-Perspective Stakeholders',
    descriptionMk: 'Истовремено симулирање на гледишта на различни општествени, економски или научни чинители.',
    descriptionEn: 'Simultaneously simulating viewpoints of diverse social, economic, or scientific stakeholders.',
    technique: 'Multi-Stakeholder Simulation'
  },
  {
    id: 'interdisciplinary',
    category: 'authentic_context',
    categoryTitleMk: 'Автентични контексти и интердисциплинарност',
    categoryTitleEn: 'Authentic Contexts & Interdisciplinary Links',
    nameMk: 'Интердисциплинарно поврзување',
    nameEn: 'Cross-Curricular Interdisciplinarity',
    descriptionMk: 'Креирање задачи што природно ги спојуваат содржините од повеќе наставни предмети.',
    descriptionEn: 'Synthesizing tasks that naturally fuse concepts across multiple school subjects (STEAM).',
    technique: 'Interdisciplinary Synthesis'
  },
  {
    id: 'applied_motivation',
    category: 'authentic_context',
    categoryTitleMk: 'Автентични контексти и интердисциплинарност',
    categoryTitleEn: 'Authentic Contexts & Interdisciplinary Links',
    nameMk: 'Зголемена мотивација и ангажираност',
    nameEn: 'Heightened Motivation & Problem Solving',
    descriptionMk: 'Трансформација на апстрактните наставни концепти во практично решавање проблеми.',
    descriptionEn: 'Transforming abstract educational concepts into hands-on practical problem-solving.',
    technique: 'Inquiry Motivation'
  },

  // Секција 3: Диференцијација, Инклузија & Рамноправност (Image 3)
  {
    id: 'multi_level',
    category: 'differentiation_inclusion',
    categoryTitleMk: 'Диференцијација, инклузија и рамноправност',
    categoryTitleEn: 'Differentiation, Inclusion & Equity',
    nameMk: 'Повеќе нивоа на комплексност',
    nameEn: 'Tiered Complexity Levels',
    descriptionMk: 'Генерирање варијанти на ист наставен материјал за почетно, средно и напредно ниво.',
    descriptionEn: 'Generating 3 distinct tiers of the same task: foundational, standard, and advanced.',
    technique: 'Tiered Differentiation'
  },
  {
    id: 'learning_styles',
    category: 'differentiation_inclusion',
    categoryTitleMk: 'Диференцијација, инклузија и рамноправност',
    categoryTitleEn: 'Differentiation, Inclusion & Equity',
    nameMk: 'Прилагодување според стилот на учење',
    nameEn: 'Multi-Modal Learning Modalities',
    descriptionMk: 'Преформулирање на истиот концепт во текстуален, дијалошки или чекор-по-чекор водич.',
    descriptionEn: 'Reformatting the same concept into textual, dialogic, or visual step-by-step guides (UDL).',
    technique: 'UDL Multi-Modality'
  },
  {
    id: 'inclusive_scaffold',
    category: 'differentiation_inclusion',
    categoryTitleMk: 'Диференцијација, инклузија и рамноправност',
    categoryTitleEn: 'Differentiation, Inclusion & Equity',
    nameMk: 'Инклузивен пристап',
    nameEn: 'Inclusive Cognitive Load Reduction',
    descriptionMk: 'Намалување на когнитивното оптоварување за ученици со потешкотии, без губење на суштината на наставниот исход.',
    descriptionEn: 'Minimizing extraneous cognitive load for struggling learners while preserving curricular rigor.',
    technique: 'Cognitive Load Reduction'
  },
  {
    id: 'equitable_support',
    category: 'differentiation_inclusion',
    categoryTitleMk: 'Диференцијација, инклузија и рамноправност',
    categoryTitleEn: 'Differentiation, Inclusion & Equity',
    nameMk: 'Рамноправно учество',
    nameEn: 'Equitable Adaptive Participation',
    descriptionMk: 'Обезбедување персонализирана поддршка за секој ученик во рамките на истата наставна единица.',
    descriptionEn: 'Delivering individualized pedagogical scaffolds so every student participates meaningfully.',
    technique: 'Adaptive Scaffolding'
  }
];
