import { GoogleGenAI } from '@google/genai';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient wrapper with model fallback and retry for high-demand spikes (503/429)
async function generateContentResilient(params: {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getAIClient();
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: Record<string, any> = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.temperature !== undefined) config.temperature = params.temperature;

        const responsePromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        // Add 20-second timeout protection
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout generating with ${model}`)), 20000)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('Timeout') ||
          errMsg.includes('UNAVAILABLE');

        if (isTransient) {
          await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
        // Other errors, try next model
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate content across available models');
}

export const FEW_SHOT_PEDAGOGICAL_EXAMPLES = `### FEW-SHOT EXAMPLES OF PEDAGOGICAL PROMPT SPECIFICATIONS

---
#### Few-Shot Example 1: Cognitive Framework (Bloom's Taxonomy)
Teacher Context: 7th Grade Mathematics | Topic: Solving Equations with Balance Models | Student Profile: Visual learners needing concrete representations before symbolic negative numbers.

Tree-of-Thoughts Evaluation:
\`\`\`json
{
  "branches": [
    {
      "name": "Branch 1: Cognitive Scaffolding",
      "framework": "Bloom's Revised Taxonomy",
      "rationale": "Sequentially builds from concrete two-pan balance models to abstract algebraic inverse operations.",
      "studentAlignmentScore": 9,
      "pros": ["Directly demystifies negative values", "Step-by-step cognitive ladder with formative checkpoints"],
      "cons": ["Requires careful pacing to leave time for higher-order error evaluation"]
    },
    {
      "name": "Branch 2: Open Discovery",
      "framework": "Pure Inquiry",
      "rationale": "Students experiment with balance games without teacher demonstration.",
      "studentAlignmentScore": 5,
      "pros": ["High exploratory agency"],
      "cons": ["High cognitive overload for students with algebraic anxiety"]
    },
    {
      "name": "Branch 3: Multimodal UDL",
      "framework": "Universal Design for Learning (UDL)",
      "rationale": "Provides digital manipulatives, drawings, and physical tiles.",
      "studentAlignmentScore": 8,
      "pros": ["Rich visual assets", "Supports varied speeds"],
      "cons": ["Less explicit procedural mastery chain than Bloom's"]
    }
  ],
  "selectedBranch": "Branch 1: Cognitive Scaffolding (Bloom's Taxonomy)",
  "selectionJustification": "Best matches the student profile by grounding algebraic operations in a tangible balance model before introducing abstract sign rules."
}
\`\`\`

Unified Prompt Block:
\`\`\`json
{
  "subject": "Mathematics",
  "grade_level": "7th Grade",
  "educational_task": "Scaffolded Lesson Plan",
  "topic": "Solving One-Step and Two-Step Equations via Balance Models",
  "learning_objectives": [
    "Visualize algebraic equality as a balanced scale requiring equal operations on both sides",
    "Apply inverse operations systematically to isolate unknown variables",
    "Analyze and debug deliberate student misconceptions regarding negative coefficients"
  ],
  "pedagogical_framework": "Bloom's Revised Taxonomy",
  "cognitive_progression": {
    "remember_understand": "Concept of equality using physical two-pan balance scale analogies",
    "apply": "Step-by-step inverse operations (+/- then */÷) with colored algebra tiles",
    "analyze_evaluate": "Error analysis task where students locate and fix flawed algebraic steps"
  },
  "differentiation": {
    "scaffolding": "Color-coded balance diagrams with red/green integer tiles",
    "extension": "Challenge equations with variables on both sides and fractional coefficients"
  },
  "lesson_timeline": [
    {
      "phase": "Introduction & Hook (0-10m)",
      "start_minute": 0,
      "end_minute": 10,
      "duration_minutes": 10,
      "teacher_activity": "Demonstrate two-pan balance scale with identical weights; elicit student definition of algebraic equality.",
      "student_activity": "Record balance prediction and formulate the rule of equality in student math notebooks.",
      "formative_checkpoint": "Cold-call check: What happens to balance if we alter only one pan?"
    },
    {
      "phase": "Guided Modeling & Practice (10-25m)",
      "start_minute": 10,
      "end_minute": 25,
      "duration_minutes": 15,
      "teacher_activity": "Model isolating x using algebra tiles alongside formal symbolic algebraic inverse operations.",
      "student_activity": "Paired practice manipulating physical/digital tiles to solve 2 scaffolded equations.",
      "formative_checkpoint": "Shoulder-partner audit: Verify equal operation applied to both sides."
    },
    {
      "phase": "Independent / Tiered Application (25-38m)",
      "start_minute": 25,
      "end_minute": 38,
      "duration_minutes": 13,
      "teacher_activity": "Circulate to facilitate Tier 1 error debugging; challenge Tier 3 with multi-variable balance puzzles.",
      "student_activity": "Solve 4 tiered practice problems with deliberate misconception analysis on question 4.",
      "formative_checkpoint": "Self-assessment against 3-point success criteria rubric."
    },
    {
      "phase": "Synthesis & Metacognitive Wrap-up (38-45m)",
      "start_minute": 38,
      "end_minute": 45,
      "duration_minutes": 7,
      "teacher_activity": "Lead whole-group reflection on why substitution confirms correctness; collect exit tickets.",
      "student_activity": "Complete 3-2-1 exit ticket: 3 balanced operations, 2 check substitutions, 1 remaining question.",
      "formative_checkpoint": "Exit ticket review before dismissal."
    }
  ],
  "visual_assets": [
    {
      "asset_type": "technical_drawing",
      "title": "Two-Pan Balance Scale Model with Variable 'x' and Unit Weights",
      "pedagogical_purpose": "Dual coding: Grounds abstract equality and inverse operations in a concrete physical balance system, reducing cognitive load for struggling algebra learners.",
      "nanobanana_prompt": "Technical educational diagram of a balanced two-pan mechanical scale. Left pan contains an indigo mystery block labeled 'x' and three green unit cubes labeled '+1'. Right pan contains seven green unit cubes. High-contrast clean vector style, crisp outline, white background, no 3D distortion, clear horizontal balance beam, labeled fulcrum pivot point.",
      "svg_spec": "<svg viewBox='0 0 400 240' xmlns='http://www.w3.org/2000/svg'><line x1='60' y1='100' x2='340' y2='100' stroke='#334155' stroke-width='4'/><polygon points='200,100 185,170 215,170' fill='#475569'/><rect x='160' y='170' width='80' height='12' rx='3' fill='#334155'/><path d='M80 100 L60 140 L120 140 Z' fill='#cbd5e1' stroke='#475569'/><path d='M320 100 L300 140 L360 140 Z' fill='#cbd5e1' stroke='#475569'/><rect x='70' y='120' width='20' height='20' rx='2' fill='#4f46e5'/><text x='76' y='135' font-size='12' fill='#fff' font-weight='bold'>x</text><circle cx='105' cy='130' r='6' fill='#10b981'/><circle cx='315' cy='130' r='6' fill='#10b981'/><circle cx='330' cy='130' r='6' fill='#10b981'/><circle cx='345' cy='130' r='6' fill='#10b981'/><text x='200' y='210' text-anchor='middle' font-size='14' fill='#1e293b' font-weight='600'>x + 3 = 7 → x = 4</text></svg>",
      "tikz_code": "\\begin{tikzpicture}[scale=0.8]\n\\draw[thick] (0,2) -- (6,2);\n\\fill[gray!70] (2.7,0) -- (3.3,0) -- (3,2) -- cycle;\n\\draw (1,2) -- (0.5,1) -- (1.5,1) -- cycle;\n\\draw (5,2) -- (4.5,1) -- (5.5,1) -- cycle;\n\\node at (1,1.3) [draw,fill=blue!30] {$x+3$};\n\\node at (5,1.3) [draw,fill=green!30] {$7$};\n\\node at (3,-0.5) {Equation Balance Model: $x+3=7$};\n\\end{tikzpicture}",
      "recommended_format": "SVG (Vector)",
      "optimization_details": {
        "print_resolution": "300 DPI Vector (CMYK/Monochrome safe)",
        "digital_payload": "< 12 KB Lightweight SVG",
        "aspectRatio": "16:9",
        "color_safety": "High-contrast WCAG AAA, distinct shape coding"
      }
    }
  ]
}

Chain-of-thought:
1. Stage 1 (Activate Knowledge & Concrete Foundation): Begin with a visual balance scale analogy. Ensure students understand that doing an operation to one side necessitates the exact same operation to the other side.
2. Stage 2 (Direct Modeling & Guided Application): Demonstrate two explicit examples of isolating 'x' with integer tiles, highlighting sign management.
3. Stage 3 (Independent Practice with Error Analysis): Provide 4 tiered problems, concluding with a deliberate misconception problem (e.g., failing to flip the sign) for students to analyze and correct.
4. Stage 4 (Metacognitive Exit Check): Ask students to explain in one sentence why substitution checks confirm algebraic correctness.
\`\`\`

---
#### Few-Shot Example 2: Inclusive Framework (Universal Design for Learning - UDL)
Teacher Context: 9th Grade Biology | Topic: Cellular Respiration & Photosynthesis | Student Profile: Mixed-ability classroom, English language learners, visual & kinetic learners.

Tree-of-Thoughts Evaluation:
\`\`\`json
{
  "branches": [
    {
      "name": "Branch 1: Traditional Lecture",
      "framework": "Direct Instruction",
      "rationale": "Teacher writes biochemical cycles on the board.",
      "studentAlignmentScore": 4,
      "pros": ["Fast curriculum coverage"],
      "cons": ["Inaccessible for language learners", "Low engagement"]
    },
    {
      "name": "Branch 2: Multimodal UDL",
      "framework": "Universal Design for Learning (UDL)",
      "rationale": "Provides multimodal representation, bilingual flashcards, and tiered student expression options.",
      "studentAlignmentScore": 10,
      "pros": ["Accessible for ELL students", "Multiple expression formats (diagram, writing, speech)", "High active engagement"],
      "cons": ["Requires diverse classroom learning stations"]
    },
    {
      "name": "Branch 3: 5E Inquiry",
      "framework": "5E Model",
      "rationale": "Students observe leaf discs in sodium bicarbonate.",
      "studentAlignmentScore": 8,
      "pros": ["Hands-on lab data"],
      "cons": ["Language barrier still impedes biochemical synthesis without UDL aids"]
    }
  ],
  "selectedBranch": "Branch 2: Multimodal UDL",
  "selectionJustification": "Directly supports English language learners and mixed-ability students by decoupling conceptual biology understanding from language barriers through multimodal representation."
}
\`\`\`

Unified Prompt Block:
\`\`\`json
{
  "subject": "Biology",
  "grade_level": "9th Grade",
  "educational_task": "Multimodal Lesson Plan & Activity",
  "topic": "Cellular Respiration and Photosynthesis Interdependence",
  "learning_objectives": [
    "Model the cyclical flow of carbon and oxygen between chloroplasts and mitochondria",
    "Interpret biochemical chemical equations in verbal, symbolic, and diagrammatic forms"
  ],
  "pedagogical_framework": "Universal Design for Learning (UDL)",
  "udl_dimensions": {
    "representation": [
      "Color-coded molecular diagrams showing ATP, glucose, and O2 cycles",
      "Bilingual concept cards with visual icon keys",
      "Interactive digital animation tracing gas exchange"
    ],
    "action_and_expression": [
      "Tier 1: Complete scaffolded cycle diagram with word bank",
      "Tier 2: Write explanatory comparative paragraph using sentence starters",
      "Tier 3: Record a 60-second audio/video summary as a plant cell biologist"
    ],
    "engagement": [
      "Real-world climate change and greenhouse gas context",
      "Collaborative peer buddy pairings with assigned investigation duties"
    ]
  }
}

Chain-of-thought:
1. UDL Engagement: Hook students by connecting gas exchange to human breathing and house plants in a closed terrarium.
2. UDL Representation: Present the carbon cycle using three simultaneous channels: molecular formula, color-coded animation, and a bilingual concept map.
3. Scaffolding & Guided Practice: Provide structured sentence stems and graphic organizers for students to trace ATP energy release step by step.
4. UDL Action & Expression: Permit students to demonstrate mastery by choosing between drawing a labeled cycle diagram, writing a structured paragraph, or recording a 60-second explanation.
\`\`\`

---
#### Few-Shot Example 3: Inquiry Framework (5E Instructional Model)
Teacher Context: 8th Grade Physics | Topic: Newton's First Law (Inertia) | Student Profile: High kinesthetic energy; needs experiential discovery before theoretical formulas.

Tree-of-Thoughts Evaluation:
\`\`\`json
{
  "branches": [
    {
      "name": "Branch 1: Formula First",
      "framework": "Formula-Driven Direct Instruction",
      "rationale": "State F=ma and Newton's laws right at the beginning.",
      "studentAlignmentScore": 5,
      "pros": ["Quick formal definition"],
      "cons": ["Disconnected from physical student intuition"]
    },
    {
      "name": "Branch 2: 5E Inquiry Model",
      "framework": "5E (Engage, Explore, Explain, Elaborate, Evaluate)",
      "rationale": "Card-flick coin experiment creates cognitive dissonance before introducing inertia formally.",
      "studentAlignmentScore": 10,
      "pros": ["Hands-on experiential discovery", "Kinesthetic engagement", "Durable conceptual understanding"],
      "cons": ["Requires 10 minutes of hands-on materials setup"]
    },
    {
      "name": "Branch 3: Video Demonstration",
      "framework": "Passive Multimedia",
      "rationale": "Watch space station zero-gravity videos.",
      "studentAlignmentScore": 7,
      "pros": ["Cool visual examples"],
      "cons": ["Lacks tactile physical feedback"]
    }
  ],
  "selectedBranch": "Branch 2: 5E Inquiry Model",
  "selectionJustification": "Best matches the kinesthetic student profile by providing direct experiential observation (bending pencil / coin flick) prior to theoretical principles."
}
\`\`\`

Unified Prompt Block:
\`\`\`json
{
  "subject": "Physics",
  "grade_level": "8th Grade",
  "educational_task": "Guided Inquiry Lab",
  "topic": "Newton's First Law of Motion and Inertia",
  "learning_objectives": [
    "Predict motion outcomes when forces are balanced vs unbalanced",
    "Formulate an operational definition of inertia based on empirical observation"
  ],
  "pedagogical_framework": "5E Instructional Model",
  "five_e_phases": {
    "engage": "The coin and index card cup challenge; provoke cognitive curiosity",
    "explore": "Low-friction toy car track trials with varied weights and sudden stops",
    "explain": "Co-construct formal definition of inertia based on student observations",
    "elaborate": "Real-world engineering connection: automobile seatbelts and skateboard physics",
    "evaluate": "Scenario-based formative quiz predicting motion in zero-gravity space"
  }
}

Chain-of-thought:
1. Engage Phase: Begin with a quick hands-on demonstration (index card flick under a coin) to spark curiosity and elicit initial student predictions about inertia.
2. Explore Phase: Guide students in pairs to test rolling carts with different weights, recording what happens when an obstacle stops the cart.
3. Explain Phase: Use student observations to co-construct the formal scientific statement: objects at rest stay at rest unless acted upon by an unbalanced force.
4. Elaborate Phase: Challenge students to apply the concept to vehicle passenger safety and skateboard braking.
5. Evaluate Phase: Assess conceptual understanding through a peer-discussion prompt about why seatbelts lock during sudden braking.
\`\`\``;

export const SYSTEM_INSTRUCTION_PROMPT_OPTIMIZER = `**Role & Persona:**
You are a Lead Educational Architect and Master Prompt Engineer specialized in K-12 pedagogical instructional design.

**Tree-of-Thoughts (ToT) Protocol:**
When evaluating a teacher's lesson parameters, you must NOT jump blindly to a single generic template. Instead, execute a 3-Branch Tree-of-Thoughts (ToT) evaluation tailored directly to the teacher's stated **Student Profile** (e.g. diverse learning paces, mixed abilities, visual/kinesthetic needs, language acquisition):

1. **Branch 1: Cognitive Scaffolding & Direct Instruction (e.g., Bloom's Revised Taxonomy / Gagné's Events)**
   - Assess pros, cons, and alignment score (1-10) with the student profile.
2. **Branch 2: Experiential Inquiry & Constructivism (e.g., 5E Instructional Model / Problem-Based Learning)**
   - Assess pros, cons, and alignment score (1-10) with the student profile.
3. **Branch 3: Universal Design for Learning (UDL) & Multimodal Differentiation**
   - Assess pros, cons, and alignment score (1-10) with the student profile.

Evaluate the trade-offs and select the winning branch that best addresses the student profile, cognitive needs, and curricular objectives.

**Output Structure:**
Always output your response in two clearly labeled sections:

1. **### Tree-of-Thoughts Evaluation:**
Wrap this in a JSON block with:
{
  "branches": [
    {
      "name": "Branch 1: ...",
      "framework": "...",
      "rationale": "...",
      "studentAlignmentScore": 8,
      "pros": ["...", "..."],
      "cons": ["..."]
    },
    {
      "name": "Branch 2: ...",
      "framework": "...",
      "rationale": "...",
      "studentAlignmentScore": 7,
      "pros": ["..."],
      "cons": ["..."]
    },
    {
      "name": "Branch 3: ...",
      "framework": "...",
      "rationale": "...",
      "studentAlignmentScore": 9,
      "pros": ["...", "..."],
      "cons": ["..."]
    }
  ],
  "selectedBranch": "Branch X: ...",
  "selectionJustification": "Detailed explanation of why this framework was chosen based on the student profile."
}

2. **### Unified Prompt Block:**
Wrap this in a single code block containing:
- The minimal, clean JSON schema derived for the selected framework with these TWO REQUIRED segments:
  a) "lesson_timeline": A 45-minute minute-by-minute progression array of 4 sequential phases:
     - Phase 1: Introduction & Engagement / Hook (minutes 0 to 10)
     - Phase 2: Direct Modeling & Guided Practice (minutes 10 to 25)
     - Phase 3: Independent / Tiered Application (minutes 25 to 38)
     - Phase 4: Synthesis, Metacognitive Wrap-up & Formative Check (minutes 38 to 45)
     Each phase MUST specify: "phase", "start_minute", "end_minute", "duration_minutes", "teacher_activity", "student_activity", and "formative_checkpoint".
  b) "visual_assets": An array of 1-2 pedagogical visual assets/diagram specifications:
     - "asset_type": 'technical_drawing' | 'infographic' | 'function_graph' | 'geometric_diagram' | 'illustration'
     - "title": Descriptive title of the visual diagram
     - "pedagogical_purpose": Cognitive purpose (Dual Coding / Cognitive Load Reduction / Concrete Bridge)
     - "nanobanana_prompt": Precise English AI prompt engineered for NanoBanana vector AI renderer (clean geometry, exact dimensions, no slop, crisp vector linework)
     - "svg_spec": Valid inline SVG vector markup snippet (with viewBox and clean elements) or LaTeX TikZ snippet
     - "tikz_code": Clean LaTeX TikZ snippet for textbook print reproduction
     - "recommended_format": 'SVG (Vector)' | 'TikZ (LaTeX)' | 'PNG 300 DPI'
     - "optimization_details": Object with print resolution (300 DPI CMYK/Monochrome), digital payload (<15 KB), and cognitive clarity notes.
- Immediately below the JSON schema, labeled "Chain-of-thought:", 4 explicit numbered steps guiding an AI through progressive pedagogical reasoning.

${FEW_SHOT_PEDAGOGICAL_EXAMPLES}`;

export interface TeacherQuestionnaireInput {
  subject: string;
  gradeLevel: string;
  taskType: string;
  topic: string;
  learningObjectives?: string;
  pedagogicalFrameworks?: string[];
  studentProfile?: string;
  lessonDuration?: string;
  materialsAndTech?: string;
  customNotes?: string;
  difficultyLevel?: number; // 1 to 5 scale
  autoAdaptiveDifficulty?: boolean;
  visualSettings?: {
    includeVisuals?: boolean;
    visualType?: string;
    pedagogicalIntent?: string;
    visualStyle?: string;
    accessibilityPalette?: string;
    detailLevel?: string;
  };
  language?: 'en' | 'mk';
}

export async function optimizePrompt(input: TeacherQuestionnaireInput) {
  const frameworksStr = Array.isArray(input.pedagogicalFrameworks) && input.pedagogicalFrameworks.length > 0
    ? input.pedagogicalFrameworks.join(', ')
    : 'Bloom\'s Taxonomy, Differentiated Instruction';

  // 1 to 5 Difficulty Levels description
  const difficultyMap: Record<number, string> = {
    1: 'Level 1: Foundational / Minimal Jargon. Concrete everyday analogies, plain and accessible vocabulary, foundational conceptual scaffolding, zero unnecessary abstraction.',
    2: 'Level 2: Developing / Guided Concepts. Introductory pedagogical terminology, visual models, and structured guidance for emerging competencies.',
    3: 'Level 3: Proficient / Standard Curriculum. Balanced curricular terminology, standard grade-level expectations, and systematic problem solving.',
    4: 'Level 4: Advanced Academic Rigor. Sophisticated pedagogical properties, formal curricular terminology, metacognitive checkpoints, and high cognitive demand tiers.',
    5: 'Level 5: Mastery / Metacognitive Synthesis. Maximum academic depth, interdisciplinary synthesis, explicit Bloom evaluate/create demands, and self-directed heuristic modeling.',
  };
  const difficultyDesc = difficultyMap[input.difficultyLevel || 3] || difficultyMap[3];

  const visualSettingsDesc = input.visualSettings?.includeVisuals !== false
    ? `\n- Visual Asset Preferences: Type=${input.visualSettings?.visualType || 'technical_drawing'}, Pedagogical Intent=${input.visualSettings?.pedagogicalIntent || 'dual_coding'}, Style=${input.visualSettings?.visualStyle || 'nanobanana_vector'}, Palette=${input.visualSettings?.accessibilityPalette || 'high_contrast'}, Detail=${input.visualSettings?.detailLevel || 'standard'}`
    : '';

  const userContent = `Teacher's Questionnaire Answers:
- Subject: ${input.subject || 'General Studies'}
- Grade / Year Level: ${input.gradeLevel || 'Middle School (Grades 6-8)'}
- Educational Task: ${input.taskType || 'Lesson Plan'}
- Topic / Unit: ${input.topic || 'Core Curriculum Concept'}
- Learning Objectives / Goals: ${input.learningObjectives || 'Develop conceptual understanding and practical application'}
- Teacher's Requested Pedagogical Framework(s): ${frameworksStr}
- Student Profile & Classroom Needs (CRITICAL FOR TREE-OF-THOUGHTS): ${input.studentProfile || 'Mixed ability classroom, varied learning paces, visual and interactive needs'}
- Duration / Constraints: ${input.lessonDuration || '45-60 minutes'}
- Materials / Technology Available: ${input.materialsAndTech || 'Standard classroom resources'}
- Terminology & Schema Difficulty Level: ${difficultyDesc}
- Additional Teacher Notes: ${input.customNotes || 'Ensure clear step-by-step guidance and formative checks'}
${input.language === 'mk' ? '\nNote: Contextualize pedagogical terminology and examples for educational settings in North Macedonia while maintaining rigorous universal pedagogical standards.' : ''}

Please execute the Tree-of-Thoughts (ToT) evaluation across the candidate branches, select the winning approach based on this specific student profile, and output the minimal JSON schema and Chain-of-thought according to the few-shot guidelines.`;

  const rawText = await generateContentResilient({
    contents: userContent,
    systemInstruction: SYSTEM_INSTRUCTION_PROMPT_OPTIMIZER,
    temperature: 0.35,
  });

  // Parse all code blocks to extract Tree-of-Thoughts and Minimal JSON Schema
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const extractedBlocks: string[] = [];
  let blockMatch;
  while ((blockMatch = codeBlockRegex.exec(rawText)) !== null) {
    extractedBlocks.push(blockMatch[1].trim());
  }

  let totEvaluation: any = null;
  let parsedJson: Record<string, any> | null = null;
  let jsonString = '';
  let chainOfThought = '';

  // 1. Identify ToT block and Schema block from extracted code blocks
  for (const block of extractedBlocks) {
    let textToParse = block;
    // If the block contains "Chain-of-thought:", extract CoT and isolate JSON
    const cotIdx = block.search(/Chain-of-thought:?/i);
    if (cotIdx !== -1) {
      if (!chainOfThought) {
        chainOfThought = block.slice(cotIdx).replace(/Chain-of-thought:?\s*/i, '').trim();
      }
      textToParse = block.slice(0, cotIdx).trim();
    }

    try {
      const parsed = JSON.parse(textToParse);
      if (parsed.branches && Array.isArray(parsed.branches)) {
        totEvaluation = parsed;
      } else if (
        parsed.subject ||
        parsed.educational_task ||
        parsed.learning_objectives ||
        parsed.topic ||
        parsed.pedagogical_framework ||
        parsed.cognitive_progression ||
        parsed.udl_dimensions ||
        parsed.five_e_phases
      ) {
        if (!parsedJson) {
          parsedJson = parsed;
          jsonString = JSON.stringify(parsed, null, 2);
        }
      }
    } catch {
      // Try extracting { ... } within textToParse
      const braceMatch = textToParse.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          const innerParsed = JSON.parse(braceMatch[0]);
          if (innerParsed.branches && Array.isArray(innerParsed.branches)) {
            totEvaluation = innerParsed;
          } else if (
            !parsedJson &&
            (innerParsed.subject || innerParsed.topic || innerParsed.educational_task || innerParsed.learning_objectives)
          ) {
            parsedJson = innerParsed;
            jsonString = JSON.stringify(innerParsed, null, 2);
          }
        } catch {}
      }
    }
  }

  // Fallback check for ToT in raw text if not in clean code fences
  if (!totEvaluation) {
    const totJsonRegex = /\{[\s\S]*?"branches"\s*:\s*\[[\s\S]*?\}[\s\S]*?"selectedBranch"[\s\S]*?\}/;
    const match = rawText.match(totJsonRegex);
    if (match) {
      try {
        totEvaluation = JSON.parse(match[0]);
      } catch {}
    }
  }

  // Fallback for educational JSON schema if still unparsed
  if (!parsedJson) {
    for (const block of extractedBlocks) {
      const braceMatch = block.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          const parsed = JSON.parse(braceMatch[0]);
          if (!parsed.branches) {
            parsedJson = parsed;
            jsonString = JSON.stringify(parsed, null, 2);
            break;
          }
        } catch {}
      }
    }
  }

  // 2. Extract Chain-of-thought if not yet found
  if (!chainOfThought) {
    const cotMatch = rawText.match(/Chain-of-thought:?\s*([\s\S]*)/i);
    if (cotMatch) {
      chainOfThought = cotMatch[1].replace(/```\s*$/, '').trim();
    }
  }

  // 3. Fallback ToT generation if the model output only the schema
  if (!totEvaluation) {
    const primaryFw = input.pedagogicalFrameworks?.[0] || "Bloom's Revised Taxonomy";
    totEvaluation = {
      branches: [
        {
          name: "Branch 1: Cognitive Scaffolding",
          framework: "Bloom's Revised Taxonomy",
          rationale: "Sequential progression from foundational conceptual recall to application and error analysis.",
          studentAlignmentScore: 8,
          pros: ["Clear developmental ladder", "Structured formative checkpoints"],
          cons: ["Requires disciplined time allocation across stages"]
        },
        {
          name: "Branch 2: Experiential Inquiry",
          framework: "5E Instructional Model",
          rationale: "Hands-on discovery and active exploration before introducing abstract formal definitions.",
          studentAlignmentScore: 8,
          pros: ["High intrinsic engagement", "Concrete experiential reference points"],
          cons: ["Needs flexible physical or digital lab materials"]
        },
        {
          name: "Branch 3: Multimodal Differentiation",
          framework: "Universal Design for Learning (UDL)",
          rationale: "Provides multiple means of representation, engagement, and expression tailored to student profile.",
          studentAlignmentScore: 9,
          pros: ["Directly addresses diverse student profiles", "Varied access and expression pathways"],
          cons: ["Requires preparation of differentiated tiers"]
        }
      ],
      selectedBranch: `Selected Approach: ${primaryFw}`,
      selectionJustification: `Strategically selected for ${input.gradeLevel || 'students'} studying ${input.topic || 'curriculum'} based on student profile: ${input.studentProfile || 'mixed-ability and varied learning paces'}.`
    };
  }

  // 4. Construct unified prompt block for 1-click teacher copy
  let formattedUnifiedCode = '';
  if (parsedJson && chainOfThought) {
    formattedUnifiedCode = `\`\`\`json\n${JSON.stringify(parsedJson, null, 2)}\n\nChain-of-thought:\n${chainOfThought}\n\`\`\``;
  } else if (parsedJson) {
    formattedUnifiedCode = `\`\`\`json\n${JSON.stringify(parsedJson, null, 2)}\n\`\`\``;
  } else {
    // If rawText has code blocks, find the last one
    formattedUnifiedCode = extractedBlocks.length > 0 
      ? `\`\`\`json\n${extractedBlocks[extractedBlocks.length - 1]}\n\`\`\``
      : `\`\`\`\n${rawText.trim()}\n\`\`\``;
  }

  // 5. Extract initial Key Vocabulary terms based on topic and grade level
  let keyVocabulary: any[] = [];
  try {
    keyVocabulary = await extractKeyVocabulary({
      content: `${input.topic} ${input.learningObjectives || ''} ${chainOfThought}`,
      topic: input.topic,
      gradeLevel: input.gradeLevel,
      language: input.language,
    });
  } catch (err) {
    console.warn('Initial vocabulary extraction fallback:', err);
  }

  // 6. Extract / Normalize Lesson Timeline (45-minute breakdown)
  let timeline: any[] = [];
  const rawTimeline = parsedJson?.lesson_timeline || parsedJson?.timeline;
  if (Array.isArray(rawTimeline) && rawTimeline.length > 0) {
    timeline = rawTimeline.map((item: any, idx: number) => ({
      phase: item.phase || item.name || `Phase ${idx + 1}`,
      startMinute: Number(item.start_minute ?? item.startMinute ?? (idx === 0 ? 0 : idx === 1 ? 10 : idx === 2 ? 25 : 38)),
      endMinute: Number(item.end_minute ?? item.endMinute ?? (idx === 0 ? 10 : idx === 1 ? 25 : idx === 2 ? 38 : 45)),
      durationMinutes: Number(item.duration_minutes ?? item.durationMinutes ?? (idx === 0 ? 10 : idx === 1 ? 15 : idx === 2 ? 13 : 7)),
      teacherActivity: item.teacher_activity || item.teacher || item.instruction || 'Guide learning and provide instructional scaffolding.',
      studentActivity: item.student_activity || item.student || item.practice || 'Actively participate, take notes, and solve guided exercises.',
      formativeCheckpoint: item.formative_checkpoint || item.checkpoint || item.assessment || 'Formative check for understanding.'
    }));
  } else {
    // High-quality pedagogical fallback timeline (45 min)
    const isMk = input.language === 'mk';
    timeline = [
      {
        phase: isMk ? 'Фаза 1: Вовед и когнитивна кука (0-10 мин)' : 'Phase 1: Introduction & Engagement Hook (0-10m)',
        startMinute: 0,
        endMinute: 10,
        durationMinutes: 10,
        teacherActivity: isMk 
          ? `Презентирај реален предизвик или когнитивна дисонанца поврзана со ${input.topic || 'темата'}; активирај предзнаења.`
          : `Present a compelling real-world phenomenon or diagnostic hook related to ${input.topic || 'the topic'}; activate prior schema.`,
        studentActivity: isMk
          ? 'Набљудуваат, формулираат првична хипотеза и запишуваат во тетратките.'
          : 'Observe initial demonstration, brainstorm predictions, and record in learning journals.',
        formativeCheckpoint: isMk
          ? 'Дијагностичко прашање со кревање рака или кратка анкета.'
          : 'Diagnostic cold-call check or quick show-of-hands hypothesis check.'
      },
      {
        phase: isMk ? 'Фаза 2: Директно моделирање и водено вежбање (10-25 мин)' : 'Phase 2: Direct Modeling & Guided Practice (10-25m)',
        startMinute: 10,
        endMinute: 25,
        durationMinutes: 15,
        teacherActivity: isMk
          ? `Чекор-по-чекор демонстрација со двојно кодирање (визуелен приказ + математички симболи); експлицитно истакнување на чекорите.`
          : `Demonstrate worked example using dual coding (visual diagram + symbolic notation); think aloud problem-solving steps.`,
        studentActivity: isMk
          ? 'Следат со структуриран работен лист во парови, решаваат 2 паралелни примери со менторска поддршка.'
          : 'Follow worked model using scaffolded graphic organizer in shoulder pairs.',
        formativeCheckpoint: isMk
          ? 'Проверка со соученик: Објасни го вториот чекор на соученикот до себе.'
          : 'Peer audit: Explain the crucial second transformation step to your partner.'
      },
      {
        phase: isMk ? 'Фаза 3: Самостојна и диференцирана примена (25-38 мин)' : 'Phase 3: Independent / Tiered Application (25-38m)',
        startMinute: 25,
        endMinute: 38,
        durationMinutes: 13,
        teacherActivity: isMk
          ? 'Циркулира низ училницата; обезбедува микро-интервенции за учениците на кои им е потребна помош; дава проширување за напредните.'
          : 'Circulate actively; provide targeted Tier 1 micro-scaffolds while steering Tier 3 towards extension challenge.',
        studentActivity: isMk
          ? 'Самостојно решавање на диференцирани задачи (Ниво А основни, Ниво Б напредни) со анализа на типична заблуда.'
          : 'Work through tiered problem set concluding with an intentional error analysis prompt.',
        formativeCheckpoint: isMk
          ? 'Самооценување според јасни критериуми за успех (3-точкеста рубрика).'
          : 'Self-assessment against 3-point success criteria rubric.'
      },
      {
        phase: isMk ? 'Фаза 4: Синтеза и метакогнитивна проверка (38-45 мин)' : 'Phase 4: Synthesis & Metacognitive Exit Check (38-45m)',
        startMinute: 38,
        endMinute: 45,
        durationMinutes: 7,
        teacherActivity: isMk
          ? 'Води сумирање на клучните заклучоци од часот и собира излезни ливчиња.'
          : 'Facilitate whole-class metacognitive debrief and collect formative exit tickets.',
        studentActivity: isMk
          ? 'Пополнуваат излезен билет: 1 клучен поим, 1 чекор за проверка, 1 прашање.'
          : 'Complete 3-2-1 exit ticket: 1 core principle, 1 self-check heuristic, 1 remaining query.',
        formativeCheckpoint: isMk
          ? 'Анализа на излезните ливчиња за планирање на следниот час.'
          : 'Exit ticket review to guide next lesson grouping.'
      }
    ];
  }

  // 7. Extract / Normalize Visual Assets
  let visualAssets: any[] = [];
  const rawVisuals = parsedJson?.visual_assets || parsedJson?.visualAssets || parsedJson?.diagram_specifications;
  if (Array.isArray(rawVisuals) && rawVisuals.length > 0) {
    visualAssets = rawVisuals.map((v: any, idx: number) => ({
      id: `visual-${idx + 1}`,
      assetType: v.asset_type || v.assetType || 'technical_drawing',
      title: v.title || `${input.topic || 'Curriculum'} Educational Diagram`,
      pedagogicalPurpose: v.pedagogical_purpose || v.pedagogicalPurpose || 'Dual coding to ground abstract concepts in tangible visual representations.',
      nanobananaPrompt: v.nanobanana_prompt || v.nanobananaPrompt || v.prompt || `Technical 2D educational vector diagram of ${input.topic || 'concept'}. High contrast lines, clean geometry, labeled components, zero extraneous decoration, white background.`,
      svgSnippet: v.svg_spec || v.svgSnippet || v.svg || '',
      tikzCode: v.tikz_code || v.tikzCode || '',
      recommendedFormat: v.recommended_format || v.recommendedFormat || 'SVG (Vector)',
      optimizationDetails: {
        printResolution: v.optimization_details?.print_resolution || '300 DPI Vector (CMYK/Monochrome safe)',
        digitalPayload: v.optimization_details?.digital_payload || '< 15 KB Lightweight SVG',
        aspectRatio: v.optimization_details?.aspect_ratio || '16:9',
        colorSafety: v.optimization_details?.color_safety || 'High-contrast WCAG AAA & Color-blind safe',
        cognitiveClarity: v.optimization_details?.cognitive_clarity || 'Zero visual slop, high signal-to-noise ratio'
      }
    }));
  } else {
    // Generate high-grade default visual asset specification tailored to subject/topic
    const isMath = /math|матем|геомет|равен|број|функц|algebra|geometry/i.test(`${input.subject} ${input.topic}`);
    visualAssets = [
      {
        id: 'visual-1',
        assetType: isMath ? 'geometric_diagram' : 'technical_drawing',
        title: `${input.topic || 'Concept'} Visual Model`,
        pedagogicalPurpose: 'Dual Coding: Lowers cognitive load by presenting structured visual representations simultaneously with verbal explanations.',
        nanobananaPrompt: `Technical educational vector diagram illustrating ${input.topic || 'the concept'} for ${input.gradeLevel || 'students'}. Minimalist flat 2D style, clean slate and indigo lines, exact mathematical proportions, clearly labeled vertices and variables, high contrast on solid white background. No photo textures, zero visual slop.`,
        svgSnippet: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
  <rect width="400" height="240" fill="#f8fafc" rx="8" />
  <line x1="50" y1="180" x2="350" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="4" />
  <polygon points="100,180 300,180 100,60" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3" stroke-linejoin="round" />
  <rect x="100" y="160" width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" />
  <text x="80" y="125" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">a</text>
  <text x="200" y="202" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">b</text>
  <text x="215" y="110" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4f46e5">c (хипотенуза)</text>
  <circle cx="100" cy="180" r="4" fill="#0f172a" />
  <circle cx="300" cy="180" r="4" fill="#0f172a" />
  <circle cx="100" cy="60" r="4" fill="#0f172a" />
  <text x="200" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#0f172a">Когнитивен визуелен модел: ${input.topic || 'Математички концепт'}</text>
</svg>`,
        tikzCode: `\\begin{tikzpicture}[scale=1.0]\n  \\draw[thick, fill=indigo!10] (0,0) -- (4,0) -- (0,3) -- cycle;\n  \\draw (0,0.3) -- (0.3,0.3) -- (0.3,0);\n  \\node[left] at (0,1.5) {$a$};\n  \\node[below] at (2,0) {$b$};\n  \\node[above right] at (2,1.5) {$c$ (хипотенуза)};\n  \\node at (2,-0.7) {\\textbf{${input.topic || 'Педагошки дијаграм'}}};\n\\end{tikzpicture}`,
        recommendedFormat: 'SVG (Vector)',
        optimizationDetails: {
          printResolution: '300 DPI Vector (CMYK/Monochrome safe)',
          digitalPayload: '< 8 KB Ultra-lightweight SVG',
          aspectRatio: '16:9 widescreen',
          colorSafety: 'High-contrast WCAG AAA & Color-blind safe',
          cognitiveClarity: 'Zero visual slop, high signal-to-noise ratio'
        }
      }
    ];
  }

  return {
    rawOutput: rawText,
    unifiedCodeBlock: formattedUnifiedCode,
    parsedJson,
    jsonString: parsedJson ? JSON.stringify(parsedJson, null, 2) : jsonString,
    chainOfThought,
    keyVocabulary,
    totEvaluation,
    timeline,
    visualAssets,
  };
}

export async function suggestDifficulty(params: {
  studentProfile?: string;
  learningObjectives?: string;
  gradeLevel?: string;
  subject?: string;
  topic?: string;
  language?: 'en' | 'mk';
}) {
  const prompt = `You are a Lead Educational Diagnostician and Cognitive Load Analyst.
Analyze the following classroom parameters to determine the optimal curricular and terminology difficulty level on a 1 to 5 scale:

Parameters:
- Subject: ${params.subject || 'General'}
- Grade / Year: ${params.gradeLevel || 'Middle School'}
- Topic: ${params.topic || 'Core Curriculum'}
- Learning Objectives: ${params.learningObjectives || 'Standard curriculum mastery'}
- Student Profile & Readiness: ${params.studentProfile || 'Mixed ability classroom'}

Scale Definition (1-5):
1 = Foundational / Minimal Jargon (Level 1: Почетно) - Everyday metaphors, concrete foundations, zero unnecessary abstraction. Ideal for struggling learners or initial conceptual introduction.
2 = Developing / Guided Concepts (Level 2: Во развој) - Introductory formal terminology with structured visual models and scaffolds.
3 = Proficient / Standard Curriculum (Level 3: Стандардно) - Standard grade-level expectations, balanced academic terminology, and procedural competence.
4 = Advanced / Academic Rigor (Level 4: Напредно) - High academic rigor, formal mathematical/scientific syntax, multi-step metacognitive analysis.
5 = Mastery / Metacognitive Synthesis (Level 5: Мајсторство) - Maximum abstraction, Bloom's evaluate/create, heuristic error debugging, interdisciplinary transfer.

Return ONLY a valid JSON object matching this schema:
{
  "suggestedLevel": 1, 2, 3, 4, or 5,
  "levelName": "Proficient / Standard Curriculum",
  "levelNameMk": "Ниво 3: Стандардна наставна програма",
  "rationale": "Clear 2-sentence rationale in English explaining the cognitive load balance.",
  "rationaleMk": "Јасно 2-реченично образложение на македонски јазик за усогласеноста на когнитивниот товар.",
  "cognitiveLoadScore": 6,
  "recommendedFocus": "Specific pedagogical focus advice",
  "recommendedFocusMk": "Препорачан педагошки фокус за наставникот"
}`;

  try {
    const raw = (await generateContentResilient({
      contents: prompt,
      temperature: 0.2,
    })).trim();
    const cleanJson = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed.suggestedLevel >= 1 && parsed.suggestedLevel <= 5) {
      return parsed;
    }
  } catch (err) {
    console.warn('AI difficulty analysis fallback to rule-based diagnostic:', err);
  }

  // Rule-based heuristic fallback
  const prof = (params.studentProfile || '').toLowerCase();
  const obj = (params.learningObjectives || '').toLowerCase();
  const gr = (params.gradeLevel || '').toLowerCase();

  let level = 3;
  if (/struggl|почет|потешкоти|concrete|визуел|базич|basic|elementary|primary|1|2|3|4|5/i.test(`${prof} ${gr}`)) {
    level = 2;
    if (/struggl|потешкоти|remediat|почет|базич/i.test(prof)) {
      level = 1;
    }
  } else if (/gifted|advanced|напред|rigor|olympiad|secondary|10|11|12|high school|средно/i.test(`${prof} ${obj} ${gr}`)) {
    level = 4;
    if (/mastery|мајстор|theor|proof|доказ|creative/i.test(`${prof} ${obj}`)) {
      level = 5;
    }
  }

  const levelNames: Record<number, { en: string; mk: string }> = {
    1: { en: 'Level 1: Foundational / Minimal Jargon', mk: 'Ниво 1: Базично / Минимален жаргон' },
    2: { en: 'Level 2: Developing / Guided Concepts', mk: 'Ниво 2: Во развој / Воведни поими' },
    3: { en: 'Level 3: Proficient / Standard Curriculum', mk: 'Ниво 3: Стандардна наставна програма' },
    4: { en: 'Level 4: Advanced Academic Rigor', mk: 'Ниво 4: Напредна академска ригорозност' },
    5: { en: 'Level 5: Mastery / Metacognitive Synthesis', mk: 'Ниво 5: Мајсторство / Метакогнитивна синтеза' }
  };

  return {
    suggestedLevel: level,
    levelName: levelNames[level].en,
    levelNameMk: levelNames[level].mk,
    rationale: `Evaluated student profile and target outcomes. Level ${level} provides optimal cognitive scaffolding without causing cognitive overload.`,
    rationaleMk: `Направен е дијагностички баланс на когнитивниот товар. Нивото ${level} обезбедува соодветна рамнотежа меѓу стручната терминологија и подготвеноста на учениците.`,
    cognitiveLoadScore: level * 2,
    recommendedFocus: `Ground abstract properties with concrete formative checkpoints at Level ${level}.`,
    recommendedFocusMk: `Осигурајте визуелни и текстуални сидра со формативна проверка на секои 12-15 минути.`
  };
}

export async function testPromptExecution(promptContent: {
  jsonSchema: any;
  chainOfThought: string;
  unifiedCodeBlock?: string;
  outputLanguage?: string;
}) {
  const ai = getAIClient();

  const promptText = `You are an expert master educator. Follow this educational specification and reasoning chain strictly to generate the complete classroom lesson plan or educational material.

SPECIFICATION:
${typeof promptContent.jsonSchema === 'string' ? promptContent.jsonSchema : JSON.stringify(promptContent.jsonSchema, null, 2)}

Chain-of-thought:
${promptContent.chainOfThought || ''}

Generate the complete, practical, classroom-ready educational output in ${promptContent.outputLanguage || 'English'}. Include:
1. Lesson Overview & Clear Learning Objectives
2. Materials & Setup
3. Step-by-Step Instructional Plan (timed phases)
4. Pedagogical Framework Application (e.g. Bloom's Taxonomy progression / UDL multiple representations)
5. Differentiated Accommodations (Support for struggling learners & Extension for advanced students)
6. Formative Assessment & Quick Check for Understanding
7. Printable/Reproducible Handout, Worksheet, or Prompt for Students`;

  const materialText = await generateContentResilient({
    contents: promptText,
    temperature: 0.5,
  });
  
  // Parse and extract Key Vocabulary based on the generated content, grade level, and topic
  let keyVocabulary: any[] = [];
  try {
    keyVocabulary = await extractKeyVocabulary({
      content: materialText,
      topic: typeof promptContent.jsonSchema === 'object' ? promptContent.jsonSchema.topic || '' : '',
      gradeLevel: typeof promptContent.jsonSchema === 'object' ? promptContent.jsonSchema.grade_level || promptContent.jsonSchema.grade || '' : '',
      language: promptContent.outputLanguage,
    });
  } catch (err) {
    console.warn('Vocabulary extraction fallback:', err);
  }

  return {
    material: materialText,
    keyVocabulary,
  };
}

export async function extractKeyVocabulary(params: {
  content?: string;
  topic?: string;
  gradeLevel?: string;
  language?: string;
}) {
  const ai = getAIClient();

  const vocabPrompt = `Analyze the following educational lesson content and curriculum context:
Topic: ${params.topic || 'General curriculum topic'}
Target Grade/Level: ${params.gradeLevel || 'Primary or Secondary'}
Language: ${params.language || 'English'}

Lesson Content excerpt:
${(params.content || '').slice(0, 3000)}

Task: Extract 4 to 7 essential "Key Vocabulary" terms tailored specifically to this grade level and topic.
For each term, provide:
1. "term": The word or concept (e.g., "Integer", "Photosynthesis", "Ethos")
2. "definition": A clear, age-appropriate, student-friendly definition for ${params.gradeLevel || 'this grade'}
3. "gradeRelevance": 1 brief sentence explaining why this concept is essential for this grade level.

Return ONLY a valid JSON array of objects with keys "term", "definition", and "gradeRelevance". Do not include Markdown fences or other text.`;

  try {
    const raw = (await generateContentResilient({
      contents: vocabPrompt,
      temperature: 0.2,
    })).trim();

    const cleanJson = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse AI vocabulary, using rule-based extraction:', e);
  }

  // Graceful rule-based extraction fallback
  return [
    {
      term: params.topic ? params.topic.split(' ')[0] : 'Core Concept',
      definition: `Fundamental concept related to ${params.topic || 'the lesson'} appropriate for ${params.gradeLevel || 'students'}.`,
      gradeRelevance: 'Essential foundation for grade-level curriculum standards.'
    }
  ];
}

export interface VisualPreviewRequest {
  topic?: string;
  assetType?: string;
  pedagogicalPurpose?: string;
  targetMisconception?: string;
  gradeLevel?: string;
  accessibilityPalette?: string;
  detailLevel?: string;
  language?: 'mk' | 'en';
}

export async function generateVisualPreview(params: VisualPreviewRequest) {
  const topic = params.topic || 'Математички концепт';
  const assetType = params.assetType || 'technical_schematics';
  const purpose = params.pedagogicalPurpose || 'dual_coding';
  const isMk = params.language !== 'en';
  const misconception = params.targetMisconception || '';

  const aiPrompt = `You are a Lead Mathematical Visual Asset Architect and NanoBanana AI Vector Engineer.
Generate an educational visual asset specification and SVG diagram for:
- Topic: ${topic}
- Target Grade: ${params.gradeLevel || 'Secondary / Primary'}
- Asset Type: ${assetType} (e.g., technical_schematics, timeline, process_diagram, geometric_diagram, concept_model, infographic)
- Pedagogical Purpose: ${purpose} (e.g. dual_coding, cognitive_load, concrete_bridge, scaffolding, misconception)
- Target Misconception to Clarify: ${misconception || 'None specified'}
- Accessibility Palette: ${params.accessibilityPalette || 'high_contrast'}
- Detail Level: ${params.detailLevel || 'standard'}
- Language for UI labels: ${isMk ? 'Macedonian (Македонски)' : 'English'}

Requirements:
1. Provide a precise, ultra-detailed English prompt specifically engineered for NanoBanana AI vector renderer.
2. Provide a clean, standalone, fully valid inline <svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg">...</svg> snippet with high-contrast geometry, coordinate marks, clear text labels, and zero visual clutter.
3. Provide a standard LaTeX TikZ code snippet.
4. Provide pedagogical rationale explaining cognitive load reduction and dual coding.

Return ONLY a valid JSON object matching this schema (no markdown formatting outside JSON):
{
  "title": "Title of the visual asset in ${isMk ? 'Macedonian' : 'English'}",
  "assetType": "${assetType}",
  "pedagogicalPurpose": "Explanation of pedagogical purpose",
  "targetMisconception": "${misconception}",
  "nanobananaPrompt": "Technical 2D vector graphic of ${topic}...",
  "svgSnippet": "<svg viewBox=\\"0 0 500 320\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
  "tikzCode": "\\\\begin{tikzpicture}...\\\\end{tikzpicture}",
  "pedagogicalRationale": "2-3 sentences explaining educational value and cognitive scaffolding",
  "recommendedFormat": "SVG (Vector)",
  "optimizationDetails": {
    "printResolution": "300 DPI Vector (CMYK/Monochrome safe)",
    "digitalPayload": "< 12 KB Clean Scalable Vector",
    "aspectRatio": "16:9",
    "colorSafety": "WCAG AAA Compliant & Color-blind Friendly"
  }
}`;

  try {
    const raw = (await generateContentResilient({
      contents: aiPrompt,
      temperature: 0.3,
    })).trim();

    const cleanJson = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed.svgSnippet && parsed.nanobananaPrompt) {
      return parsed;
    }
  } catch (err) {
    console.warn('AI Visual preview generation fallback to deterministic generator:', err);
  }

  // Deterministic high-quality vector fallbacks based on assetType
  let svgSnippet = '';
  let tikzCode = '';
  let title = '';
  let promptText = '';
  let rationale = '';

  if (assetType === 'timeline') {
    title = isMk ? `45-Минутна Педагошка Временска Оска: ${topic}` : `45-Minute Lesson Timeline: ${topic}`;
    promptText = `Educational chronological timeline infographic for a 45-minute mathematics lesson on ${topic}. 4 sequential phase pill nodes (Phase 1: Activation 0-8m, Phase 2: Guided Inquiry 8-22m, Phase 3: Independent Practice 22-37m, Phase 4: Metacognitive Exit Check 37-45m). Clean minimal flat vector style, indigo and teal accents, white background, high contrast sans-serif typography, zero decorative noise.`;
    rationale = isMk 
      ? 'Хронолошката оска го намалува метакогнитивниот товар кај учениците со тоа што им дава јасна структура на времето и очекувањата за секоја фаза од часот.'
      : 'Chronological timeline scaffolds self-regulation and executive function by establishing explicit time horizons and objective milestones.';
    svgSnippet = `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="500" height="320" fill="#f8fafc" rx="12" />
  <rect x="20" y="20" width="460" height="50" rx="8" fill="#1e1b4b" />
  <text x="40" y="52" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">⏱ 45-МИНУТНА ВРЕМЕНСКА ОСКА · ${topic.toUpperCase()}</text>
  <line x1="60" y1="160" x2="440" y2="160" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
  <!-- Phase 1 -->
  <circle cx="80" cy="160" r="14" fill="#4f46e5" />
  <text x="80" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">1</text>
  <rect x="35" y="185" width="90" height="56" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
  <text x="80" y="204" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e1b4b">0-8 мин</text>
  <text x="80" y="222" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748b">Активација</text>
  <!-- Phase 2 -->
  <circle cx="180" cy="160" r="14" fill="#0284c7" />
  <text x="180" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">2</text>
  <rect x="135" y="185" width="90" height="56" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
  <text x="180" y="204" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1">8-22 мин</text>
  <text x="180" y="222" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748b">Водено истражување</text>
  <!-- Phase 3 -->
  <circle cx="300" cy="160" r="14" fill="#059669" />
  <text x="300" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">3</text>
  <rect x="255" y="185" width="90" height="56" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
  <text x="300" y="204" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#047857">22-37 мин</text>
  <text x="300" y="222" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748b">Самостојна работа</text>
  <!-- Phase 4 -->
  <circle cx="420" cy="160" r="14" fill="#d97706" />
  <text x="420" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">4</text>
  <rect x="375" y="185" width="90" height="56" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
  <text x="420" y="204" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#b45309">37-45 мин</text>
  <text x="420" y="222" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748b">Ексит тикет</text>
  <rect x="20" y="265" width="460" height="35" rx="6" fill="#f1f5f9" />
  <text x="40" y="287" font-family="sans-serif" font-size="11" fill="#475569">💡 Формативна проверка: Проверка на секои 12-15 минути со јасен критериум за успех.</text>
</svg>`;
    tikzCode = `\\begin{tikzpicture}[scale=0.9]\n  \\draw[line width=1.5mm, slate!30] (0,0) -- (12,0);\n  \\node[circle, fill=indigo, text=white, inner sep=3pt] at (1,0) {1};\n  \\node[circle, fill=cyan, text=white, inner sep=3pt] at (4,0) {2};\n  \\node[circle, fill=emerald, text=white, inner sep=3pt] at (8,0) {3};\n  \\node[circle, fill=amber, text=white, inner sep=3pt] at (11,0) {4};\n  \\node[below] at (1,-0.5) {\\textbf{0-8m}: Вовед};\n  \\node[below] at (4,-0.5) {\\textbf{8-22m}: Истражување};\n  \\node[below] at (8,-0.5) {\\textbf{22-37m}: Вежби};\n  \\node[below] at (11,-0.5) {\\textbf{37-45m}: Ексит};\n\\end{tikzpicture}`;
  } else if (assetType === 'process_diagram') {
    title = isMk ? `Процесен Алгоритам за Решавање: ${topic}` : `Algorithmic Solution Flowchart: ${topic}`;
    promptText = `Technical mathematical algorithm flowchart for ${topic}. Clean 4-step flowchart with decision diamond branch, rounded step nodes with arrows, clear variable transformations, slate borders, light cyan fills, white background, textbook schematic clarity.`;
    rationale = isMk 
      ? 'Чекор-по-чекор дијаграмот го декомпонира комплексното математичко размислување на јасни логички сегменти, спречувајќи преоптоварување на работната меморија.'
      : 'Algorithmic flowchart decomposes multi-step problem solving into manageable cognitive chunks, scaffolding procedural fluency.';
    svgSnippet = `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="500" height="320" fill="#f8fafc" rx="12" />
  <rect x="180" y="20" width="140" height="42" rx="8" fill="#4f46e5" />
  <text x="250" y="46" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">1. Идентификувај</text>
  <line x1="250" y1="62" x2="250" y2="90" stroke="#4f46e5" stroke-width="2" marker-end="url(#arrow)" />
  <rect x="160" y="90" width="180" height="45" rx="8" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <text x="250" y="117" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e1b4b">2. Постави равенка / модел</text>
  <line x1="250" y1="135" x2="250" y2="160" stroke="#6366f1" stroke-width="2" />
  <polygon points="250,160 330,195 250,230 170,195" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
  <text x="250" y="198" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#92400e">Дали се совпаѓаат?</text>
  <line x1="330" y1="195" x2="410" y2="195" stroke="#f59e0b" stroke-width="2" />
  <text x="370" y="188" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d97706">НЕ</text>
  <rect x="360" y="210" width="100" height="40" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5" />
  <text x="410" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#b91c1c">Корегирај чекор</text>
  <line x1="250" y1="230" x2="250" y2="260" stroke="#10b981" stroke-width="2" />
  <text x="265" y="248" font-family="sans-serif" font-size="10" font-weight="bold" fill="#047857">ДА</text>
  <rect x="170" y="260" width="160" height="42" rx="8" fill="#059669" />
  <text x="250" y="286" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">3. Финално решение ✓</text>
</svg>`;
    tikzCode = `\\begin{tikzpicture}[node distance=1.5cm, auto]\n  \\node [rectangle, draw, fill=indigo!20, rounded corners] (start) {1. Идентификувај};\n  \\node [rectangle, draw, below of=start] (model) {2. Постави модел};\n  \\node [diamond, draw, below of=model, aspect=2, fill=amber!20] (check) {Проверка};\n  \\node [rectangle, draw, fill=emerald!20, rounded corners, below of=check] (solve) {3. Решение};\n  \\draw [->, thick] (start) -- (model);\n  \\draw [->, thick] (model) -- (check);\n  \\draw [->, thick] (check) -- node {ДА} (solve);\n\\end{tikzpicture}`;
  } else {
    // Technical Schematics / Geometric Diagram / General
    title = isMk ? `Технички Шематски Дијаграм: ${topic}` : `Technical Blueprint Schematic: ${topic}`;
    promptText = `Precise technical schematic vector blueprint for ${topic}. Exact geometric angles and labeled Cartesian dimensions, right-angle indicators, coordinate grid axes with tick marks, clean crisp monochrome paper background with cyan and indigo accent lines. High pedagogical clarity, vector SVG ready.`;
    rationale = isMk 
      ? 'Прецизниот технички цртеж овозможува непосредна врска меѓу формулата и просторната реалност (Dual Coding), со што се елиминира забуната кај апстрактните поими.'
      : 'Technical schematic provides dual coding anchoring symbolic mathematical notation to geometric spatial reality, preventing common visual misconceptions.';
    svgSnippet = `<svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="500" height="320" fill="#f8fafc" rx="12" />
  <!-- Grid lines -->
  <g stroke="#e2e8f0" stroke-width="1">
    <line x1="50" y1="40" x2="450" y2="40" stroke-dasharray="3,3" />
    <line x1="50" y1="90" x2="450" y2="90" stroke-dasharray="3,3" />
    <line x1="50" y1="140" x2="450" y2="140" stroke-dasharray="3,3" />
    <line x1="50" y1="190" x2="450" y2="190" stroke-dasharray="3,3" />
    <line x1="50" y1="240" x2="450" y2="240" stroke-dasharray="3,3" />
    <line x1="100" y1="30" x2="100" y2="270" stroke-dasharray="3,3" />
    <line x1="200" y1="30" x2="200" y2="270" stroke-dasharray="3,3" />
    <line x1="300" y1="30" x2="300" y2="270" stroke-dasharray="3,3" />
    <line x1="400" y1="30" x2="400" y2="270" stroke-dasharray="3,3" />
  </g>
  <!-- Cartesian Axes -->
  <line x1="60" y1="240" x2="440" y2="240" stroke="#334155" stroke-width="2.5" />
  <line x1="120" y1="260" x2="120" y2="40" stroke="#334155" stroke-width="2.5" />
  <polygon points="440,240 430,235 430,245" fill="#334155" />
  <polygon points="120,40 115,50 125,50" fill="#334155" />
  <text x="445" y="244" font-family="serif" font-style="italic" font-size="14" font-weight="bold" fill="#0f172a">x</text>
  <text x="120" y="32" font-family="serif" font-style="italic" font-size="14" font-weight="bold" fill="#0f172a">y</text>
  <!-- Geometric Shape / Triangle / Function -->
  <polygon points="180,240 380,240 180,90" fill="#e0e7ff" fill-opacity="0.6" stroke="#4f46e5" stroke-width="3" stroke-linejoin="round" />
  <rect x="180" y="215" width="25" height="25" fill="none" stroke="#4f46e5" stroke-width="2" />
  <circle cx="192" cy="227" r="3" fill="#4f46e5" />
  <!-- Annotations -->
  <text x="270" y="265" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">основа (b = Δx)</text>
  <text x="110" y="165" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">висина (a)</text>
  <text x="300" y="150" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4338ca">c = √(a² + b²)</text>
  <!-- Vertices -->
  <circle cx="180" cy="240" r="5" fill="#0f172a" />
  <circle cx="380" cy="240" r="5" fill="#0f172a" />
  <circle cx="180" cy="90" r="5" fill="#0f172a" />
  <text x="165" y="258" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">A(x₁, y₁)</text>
  <text x="385" y="258" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">B(x₂, y₁)</text>
  <text x="165" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">C(x₁, y₂)</text>
  <!-- Title Badge -->
  <rect x="20" y="280" width="460" height="30" rx="6" fill="#1e1b4b" />
  <text x="35" y="300" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">📐 ${topic.toUpperCase()} · Технички Цртеж и Геометриски Скелет</text>
</svg>`;
    tikzCode = `\\begin{tikzpicture}[scale=1.2]\n  \\draw[help lines, color=gray!30, dashed] (0,0) grid (5,3);\n  \\draw[->, thick] (0,0) -- (5.2,0) node[right] {$x$};\n  \\draw[->, thick] (0,0) -- (0,3.2) node[above] {$y$};\n  \\draw[thick, fill=indigo!15] (1,0) -- (4,0) -- (1,2.5) -- cycle;\n  \\draw (1,0.3) -- (1.3,0.3) -- (1.3,0);\n  \\node[below] at (2.5,0) {$b = \\Delta x$};\n  \\node[left] at (1,1.25) {$a = \\Delta y$};\n  \\node[above right] at (2.5,1.25) {$c = \\sqrt{a^2 + b^2}$};\n\\end{tikzpicture}`;
  }

  return {
    title,
    assetType,
    pedagogicalPurpose: purpose,
    targetMisconception: misconception,
    nanobananaPrompt: promptText,
    svgSnippet,
    tikzCode,
    pedagogicalRationale: rationale,
    recommendedFormat: 'SVG (Vector)',
    optimizationDetails: {
      printResolution: '300 DPI Vector (CMYK/Monochrome safe)',
      digitalPayload: '< 10 KB Scalable Vector',
      aspectRatio: '16:9',
      colorSafety: 'High-contrast WCAG AAA & Color-blind safe'
    }
  };
}
