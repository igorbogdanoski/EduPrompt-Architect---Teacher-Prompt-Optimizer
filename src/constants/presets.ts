import { TemplatePreset } from '../types.ts';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'flagship-math-pythagorean',
    title: 'Grade 8 Math: Pythagorean Theorem & Geometric Visual Proof',
    titleMk: '8мо одд. Математика: Питагорова теорема и геометриски доказ',
    subtitle: 'Bloom\'s Taxonomy + Inquiry on a 45-min timeline with NanoBanana vectors',
    subtitleMk: 'Блумова таксономија + 45-мин оска + NanoBanana вектори (Спремно за презентација)',
    state: {
      subject: 'Математика',
      gradeLevel: '8мо одделение',
      stage: 'middle',
      taskType: 'План за наставен час (45-60 мин)',
      topic: 'Питагорова теорема (a² + b² = c²) и визуелен плоштински доказ',
      learningObjectives: 'Учениците да ја разберат врската меѓу плоштините на квадратите конструирани над катетите и хипотенузата кај правоаголен триаголник (a² + b² = c²) и да решаваат проблеми преку визуелно моделирање.',
      pedagogicalFrameworks: ['bloom', 'inquiry', 'scaffolding'],
      studentProfile: 'Мешани способности; дел од учениците имаат потреба од визуелно сидро за плоштина пред да применат апстрактна формула за квадратен корен.',
      lessonDuration: '45 минути',
      materialsAndTech: 'Милиметарска хартија, геометриски триаголници, дигитален проектор за векторски дијаграми.',
      customNotes: 'Започнете со когнитивна кука (египетски јазолен триаголник 3-4-5), спроведете водено истражување и завршете со излезен билет со 3-точкеста рубрика.',
      difficultyLevel: 3,
      autoAdaptiveDifficulty: true,
      visualSettings: {
        includeVisuals: true,
        visualType: 'technical_schematics',
        pedagogicalIntent: 'dual_coding',
        visualStyle: 'nanobanana_vector',
        accessibilityPalette: 'high_contrast',
        detailLevel: 'standard',
        targetMisconception: 'Учениците често забораваат да квадрираат или ја мешаат најдолгата страна (хипотенуза) со катетите.',
        customFocusNotes: 'Ознака за прав агол, оски x и y, коти a=3, b=4, c=5 со површини 9 + 16 = 25.'
      }
    }
  },
  {
    id: 'math-7-negative-numbers',
    title: 'Grade 7 Math: Introduction to Negative Numbers',
    titleMk: '7мо одд. Математика: Вовед во негативни броеви',
    subtitle: 'Bloom\'s Taxonomy + Inquiry on a 45-min timeline',
    subtitleMk: 'Блумова таксономија + истражувачки пристап (45 мин)',
    state: {
      subject: 'Mathematics',
      gradeLevel: '7th Grade',
      stage: 'middle',
      taskType: 'Lesson Plan (45-60 min)',
      topic: 'Introduction to Negative Numbers and Integer Number Line',
      learningObjectives: 'Students will understand real-world representations of integers below zero (temperature, elevation, debt) and place them accurately on a number line.',
      pedagogicalFrameworks: ["bloom", "inquiry"],
      studentProfile: 'Mixed ability classroom; several students struggle with abstract representations and benefit from visual/physical scales.',
      lessonDuration: '45 minutes',
      materialsAndTech: 'Vertical thermometer diagram, printable integer line, zero-sum counters, whiteboard.',
      customNotes: 'Ensure a strong inquiry hook at the start and include explicit formative checks before transitioning to independent practice.',
      difficultyLevel: 2
    }
  },
  {
    id: 'primary-3-fractions',
    title: 'Grade 3 Math: Fraction Parts of a Whole',
    titleMk: '3то одд. Математика: Дропки како дел од цело',
    subtitle: 'Universal Design for Learning (UDL) with manipulatives',
    subtitleMk: 'Универзален дизајн за учење (UDL) со манипулативи',
    state: {
      subject: 'Mathematics',
      gradeLevel: '3rd Grade',
      stage: 'primary',
      taskType: 'Differentiated Group Activity',
      topic: 'Fractions as Equal Parts of a Whole (halves, thirds, fourths)',
      learningObjectives: 'Identify equal vs. unequal shares, name fractional parts (1/2, 1/3, 1/4), and construct visual models using fraction strips or food models.',
      pedagogicalFrameworks: ["udl", "scaffolding"],
      studentProfile: 'Primary learners with varying spatial intuition; includes learners requiring concrete tactile manipulatives and visual scaffolds.',
      lessonDuration: '40 minutes',
      materialsAndTech: 'Paper strip foldables, colored counters, magnetic whiteboard shapes.',
      customNotes: 'Provide tiered activities for three readiness tiers: Tier 1 (identifying equal parts), Tier 2 (labeling fractions), Tier 3 (comparing fractions).',
      difficultyLevel: 1
    }
  },
  {
    id: 'science-8-photosynthesis',
    title: 'Grade 8 Science: Photosynthesis & Plant Energy',
    titleMk: '8мо одд. Природни науки: Фотосинтеза и енергија',
    subtitle: '5E Instructional Model + Bloom\'s Analysis',
    subtitleMk: '5E Инструкциски модел + Блумова анализа',
    state: {
      subject: 'Natural Sciences',
      gradeLevel: '8th Grade',
      stage: 'middle',
      taskType: 'Hands-on Inquiry Lab / Experiment',
      topic: 'Photosynthesis equation, chloroplast function, and sunlight energy conversion',
      learningObjectives: 'Formulate a hypothesis on how light intensity affects plant oxygen release, collect observational data, and articulate the chemical input/output relationship.',
      pedagogicalFrameworks: ["5e", "inquiry", "bloom"],
      studentProfile: 'General middle school cohort; need guided laboratory protocols with clear safety procedures and structured data recording tables.',
      lessonDuration: '60 minutes',
      materialsAndTech: 'Elodea water plants, test tubes, sodium bicarbonate solution, lamp light sources, ruler.',
      customNotes: 'Include formative exit ticket questions targeting Bloom\'s \'Analyze\' level regarding what happens when CO2 or light is removed.',
      difficultyLevel: 2
    }
  },
  {
    id: 'sec-10-persuasive-rhetoric',
    title: 'Grade 10 English: Rhetorical Appeals & Persuasive Essay',
    titleMk: '10то одд. / II година: Реторички средства во есеј',
    subtitle: 'Bloom\'s Taxonomy (Evaluate & Create) + Rubric',
    subtitleMk: 'Блумова таксономија (Евалуација и создавање) + Рубрика',
    state: {
      subject: 'Language Arts / Literature',
      gradeLevel: '10th Grade (Secondary)',
      stage: 'secondary',
      taskType: 'Formative Assessment & Rubric',
      topic: 'Aristotelian Appeals: Ethos, Pathos, and Logos in Historical & Contemporary Speeches',
      learningObjectives: 'Critically analyze how speakers combine ethos, pathos, and logos to persuade audiences, and produce an original 3-paragraph persuasive argument evaluated against a 4-tier rubric.',
      pedagogicalFrameworks: ["bloom", "socratic"],
      studentProfile: 'Secondary students with diverse vocabulary levels; require model mentor texts and sentence starters for structured debate.',
      lessonDuration: '90 minutes (Block Period)',
      materialsAndTech: 'Printouts of historical speech excerpts (e.g. Churchill / King), highlighter pens, digital projector.',
      customNotes: 'Provide an analytical scoring rubric with clear criteria for each appeal, logical reasoning, and evidence grounding.',
      difficultyLevel: 3
    }
  },
  {
    id: 'sec-11-physics-newton',
    title: 'Grade 11 Physics: Newton\'s Third Law & Momentum',
    titleMk: '11то одд. / III година Физика: Њутнов трет закон',
    subtitle: 'Differentiated Instruction + Real-World Problem Solving',
    subtitleMk: 'Диференцирана настава + Реални инжинерски проблеми',
    state: {
      subject: 'Physics',
      gradeLevel: '11th Grade (Secondary)',
      stage: 'secondary',
      taskType: 'Lesson Plan (45-60 min)',
      topic: 'Action-Reaction Force Pairs and Conservation of Momentum in Collisions',
      learningObjectives: 'Distinguish between balanced forces on a single object vs. action-reaction pairs acting on separate objects, and calculate resulting velocities in elastic/inelastic collisions.',
      pedagogicalFrameworks: ["differentiated", "bloom"],
      studentProfile: 'Advanced STEM cohort with varying mathematical fluency in algebraic vectors.',
      lessonDuration: '50 minutes',
      materialsAndTech: 'Dynamics collision carts, motion sensors / digital timers, smartphone slow-motion camera recording.',
      customNotes: 'Directly address common student misconceptions (e.g., that the larger mass exerts greater force than the smaller mass).',
      difficultyLevel: 3
    }
  }
];
