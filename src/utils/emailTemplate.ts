import { PromptOptimizationResult, SupportedLanguage } from '../types.ts';

export interface LessonEmailDraft {
  subject: string;
  briefDescription: string;
  body: string;
  mailtoUrl: string;
}

/**
 * Constructs a structured email draft and native 'mailto:' link containing:
 * - A clear subject line: [Lesson Plan] {subject}: {topic} ({gradeLevel})
 * - A brief pedagogical description of the lesson
 * - The generated lesson plan content / specification
 * - Target objectives, vocabulary, and minimal JSON schema
 */
export function generateLessonPlanEmail(
  result: PromptOptimizationResult,
  language: SupportedLanguage = 'en',
  recipientEmail: string = ''
): LessonEmailDraft {
  const isMk = language === 'mk';
  const { input, jsonString, chainOfThought, keyVocabulary, generatedMaterial } = result;

  const subjectName = input.subject || (isMk ? 'Математика' : 'Mathematics');
  const topicName = input.topic || (isMk ? 'Наставна единица' : 'Core Lesson');
  const gradeName = input.gradeLevel || (isMk ? 'Основно образование' : 'K-12');
  const duration = input.lessonDuration || (isMk ? '45 мин.' : '45-60 min');
  const frameworks = Array.isArray(input.pedagogicalFrameworks) && input.pedagogicalFrameworks.length > 0
    ? input.pedagogicalFrameworks.join(', ')
    : "Bloom's Revised Taxonomy";

  // 1. Subject Line
  const subject = isMk
    ? `[Наставен план] ${subjectName}: ${topicName} (${gradeName})`
    : `[Lesson Plan] ${subjectName}: ${topicName} (${gradeName})`;

  // 2. Brief Description
  const briefDescription = isMk
    ? `План за наставен час по ${subjectName} за ${gradeName} на тема „${topicName}“, со фокус на ${input.learningObjectives || 'концептуално разбирање и примена'} (${duration}, педагошки модел: ${frameworks}).`
    : `Structured lesson plan for ${gradeName} ${subjectName} on "${topicName}", focusing on ${input.learningObjectives || 'conceptual mastery and application'} (${duration}, pedagogical framework: ${frameworks}).`;

  // 3. Key Vocabulary Section
  let vocabSection = '';
  if (keyVocabulary && keyVocabulary.length > 0) {
    const vocabLines = keyVocabulary
      .map(v => `  • ${v.term}: ${v.definition}`)
      .join('\n');
    vocabSection = isMk
      ? `\n\nКЛУЧЕН ВОКАБУЛАР И СТРУЧНИ ПОИМИ:\n${vocabLines}`
      : `\n\nKEY VOCABULARY & CURRICULUM TERMS:\n${vocabLines}`;
  }

  // 4. Classroom Lesson Content Section
  let lessonMaterialSection = '';
  if (generatedMaterial && generatedMaterial.trim().length > 0) {
    lessonMaterialSection = isMk
      ? `\n\nДЕТАЛНА НАСТАВНА СОДРЖИНА И ЧЕКОРИ ЗА ЧАСОТ:\n${generatedMaterial.trim()}`
      : `\n\nCLASSROOM LESSON PLAN & ACTIVITIES:\n${generatedMaterial.trim()}`;
  }

  // 5. Complete Email Body
  const body = isMk
    ? `Почитувани колеги,

Ви го испраќам подготвениот наставен план за претстојниот час:

КРАТОК ОПИС НА ЧАСОТ:
${briefDescription}

ОСНОВНИ ПАРАМЕТРИ:
• Предмет: ${subjectName}
• Одделение / Година: ${gradeName}
• Наставна содржина / Тема: ${topicName}
• Вид на активност: ${input.taskType || 'План за час'}
• Времетраење: ${duration}
• Педагошка рамка: ${frameworks}

ОЧЕКУВАНИ РЕЗУЛТАТИ (ЦЕЛИ НА УЧЕЊЕТО):
${input.learningObjectives || 'Развивање на концептуално разбирање и практична примена.'}${vocabSection}${lessonMaterialSection}

ПЕДАГОШКО РАСУДУВАЊЕ (CHAIN-OF-THOUGHT):
${chainOfThought || 'Спроведување на чекор-по-чекор когнитивна прогресија според Блумова таксономија.'}

МИНИМАЛНА ОБРАЗОВНА JSON ШЕМА:
${jsonString || '{}'}

--
Генерирано преку EduPrompt Architect · MathDigitizer Pro`
    : `Dear Colleagues,

Here is the prepared lesson plan and pedagogical specification for our upcoming class:

BRIEF LESSON DESCRIPTION:
${briefDescription}

CORE PARAMETERS:
• Subject: ${subjectName}
• Grade / Level: ${gradeName}
• Topic / Concept: ${topicName}
• Educational Task: ${input.taskType || 'Lesson Plan'}
• Duration: ${duration}
• Pedagogical Model: ${frameworks}

TARGET LEARNING OBJECTIVES:
${input.learningObjectives || 'Develop conceptual mastery and real-world problem-solving skills.'}${vocabSection}${lessonMaterialSection}

PEDAGOGICAL REASONING (CHAIN-OF-THOUGHT):
${chainOfThought || 'Step-by-step cognitive progression guided by Bloom\'s Revised Taxonomy.'}

MINIMAL EDUCATIONAL JSON SCHEMA:
${jsonString || '{}'}

--
Generated with EduPrompt Architect · MathDigitizer Pro`;

  // Standard mailto: URI with proper URL component encoding
  const cleanRecipient = recipientEmail.trim();
  const mailtoUrl = `mailto:${encodeURIComponent(cleanRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    subject,
    briefDescription,
    body,
    mailtoUrl,
  };
}

/**
 * Triggers the native browser mailto: link directly.
 */
export function triggerNativeMailto(
  result: PromptOptimizationResult,
  language: SupportedLanguage = 'en',
  recipientEmail: string = ''
): void {
  const { mailtoUrl } = generateLessonPlanEmail(result, language, recipientEmail);
  const link = document.createElement('a');
  link.href = mailtoUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 300);
}
