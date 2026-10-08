import React from 'react';
import { PromptOptimizationResult, SupportedLanguage } from '../types.ts';

interface PrintableLessonDocumentProps {
  result: PromptOptimizationResult | null;
  language: SupportedLanguage;
}

export const PrintableLessonDocument: React.FC<PrintableLessonDocumentProps> = ({
  result,
  language,
}) => {
  if (!result) return null;

  const isMk = language === 'mk';
  const currentDate = new Date().toLocaleDateString(isMk ? 'mk-MK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = result.input.subject || (isMk ? 'Општ предмет' : 'General Subject');
  const grade = result.input.gradeLevel || (isMk ? 'Основно / Средно' : 'K-12');
  const topic = result.input.topic || (isMk ? 'Наставна тема' : 'Curriculum Topic');
  const duration = result.input.lessonDuration || '45-60 min';
  const frameworks = Array.isArray(result.input.pedagogicalFrameworks)
    ? result.input.pedagogicalFrameworks.join(', ')
    : "Bloom's Taxonomy";

  return (
    <div id="printable-lesson-doc">
      {/* Document Header */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {isMk ? 'НАСТАВЕН ПЛАН И МАТЕРИЈАЛ' : 'LESSON PLAN & TEACHING MATERIAL'}
          </h1>
          <span style={{ fontSize: '9pt', color: '#64748b' }}>
            EduPrompt Architect · {currentDate}
          </span>
        </div>
        <p style={{ fontSize: '11pt', color: '#334155', marginTop: '4px', marginBottom: 0, fontWeight: 600 }}>
          {topic}
        </p>
      </div>

      {/* Lesson Metadata Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
        <tbody>
          <tr>
            <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, width: '22%', border: '1px solid #cbd5e1' }}>
              {isMk ? 'Наставен предмет:' : 'Subject:'}
            </td>
            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', width: '28%' }}>
              {subject}
            </td>
            <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, width: '22%', border: '1px solid #cbd5e1' }}>
              {isMk ? 'Одделение / Година:' : 'Grade / Level:'}
            </td>
            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', width: '28%' }}>
              {grade}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, border: '1px solid #cbd5e1' }}>
              {isMk ? 'Вид на активност:' : 'Task / Activity:'}
            </td>
            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
              {result.input.taskType || 'Lesson Plan'}
            </td>
            <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, border: '1px solid #cbd5e1' }}>
              {isMk ? 'Времетраење:' : 'Duration:'}
            </td>
            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
              {duration}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, border: '1px solid #cbd5e1' }}>
              {isMk ? 'Педагошки рамки:' : 'Pedagogical Model:'}
            </td>
            <td colSpan={3} style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
              {frameworks}
            </td>
          </tr>
          {result.input.studentProfile && (
            <tr>
              <td style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                {isMk ? 'Профил на ученици:' : 'Learner Needs:'}
              </td>
              <td colSpan={3} style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                {result.input.studentProfile}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Objectives Box */}
      {result.input.learningObjectives && (
        <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #4f46e5', padding: '10px 14px', marginBottom: '18px', fontSize: '10pt' }}>
          <strong style={{ display: 'block', marginBottom: '3px', color: '#1e1b4b' }}>
            {isMk ? 'Цели на учењето (Очекувани резултати):' : 'Learning Objectives & Outcomes:'}
          </strong>
          <span style={{ color: '#334155', lineHeight: 1.5 }}>
            {result.input.learningObjectives}
          </span>
        </div>
      )}

      {/* 45-Minute Lesson Timeline Table */}
      {result.timeline && result.timeline.length > 0 && (
        <div style={{ marginBottom: '18px' }} className="print-avoid-break">
          <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
            {isMk ? 'Временска рамка на часот (45 минути)' : '45-Minute Lesson Progression Timeline'}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', width: '22%' }}>{isMk ? 'Фаза' : 'Phase'}</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', width: '12%' }}>{isMk ? 'Време' : 'Time'}</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', width: '33%' }}>{isMk ? 'Активност на наставник' : 'Teacher Activity'}</th>
                <th style={{ padding: '6px 8px', border: '1px solid #cbd5e1', width: '33%' }}>{isMk ? 'Активност на ученици & Проверка' : 'Student Activity & Check'}</th>
              </tr>
            </thead>
            <tbody>
              {result.timeline.map((p, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{p.phase}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{p.startMinute}-{p.endMinute} min</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{p.teacherActivity}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>
                    <div>{p.studentActivity}</div>
                    {p.formativeCheckpoint && (
                      <div style={{ marginTop: '3px', color: '#166534', fontWeight: 600, fontSize: '8pt' }}>
                        ✓ {p.formativeCheckpoint}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visual Assets & Diagrams Specification */}
      {result.visualAssets && result.visualAssets.length > 0 && (
        <div style={{ backgroundColor: '#fdf4ff', borderLeft: '4px solid #a855f7', padding: '10px 14px', marginBottom: '18px', fontSize: '9pt' }} className="print-avoid-break">
          <strong style={{ display: 'block', marginBottom: '4px', color: '#581c87' }}>
            {isMk ? 'Едукативни визуелни содржини & NanoBanana дијаграми (Dual Coding):' : 'Visual Assets & Mathematical Diagrams (Dual Coding):'}
          </strong>
          {result.visualAssets.map((va, i) => (
            <div key={i} style={{ marginBottom: i < result.visualAssets!.length - 1 ? '8px' : 0 }}>
              <div style={{ fontWeight: 700, color: '#6b21a8' }}>{va.title} ({va.assetType})</div>
              <div style={{ color: '#4a044e', fontSize: '8.5pt' }}>{va.pedagogicalPurpose}</div>
              <div style={{ fontSize: '8pt', color: '#581c87', fontStyle: 'italic', marginTop: '2px' }}>
                NanoBanana Prompt: {va.nanobananaPrompt.slice(0, 180)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Vocabulary Box */}
      {result.keyVocabulary && result.keyVocabulary.length > 0 && (
        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '10px 14px', marginBottom: '18px', fontSize: '9.5pt' }}>
          <strong style={{ display: 'block', marginBottom: '6px', color: '#14532d' }}>
            {isMk ? 'Клучен вокабулар и стручни поими за одделението:' : 'Key Vocabulary & Grade-Level Terminology:'}
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {result.keyVocabulary.map((v, i) => (
              <div key={i} style={{ fontSize: '9pt' }}>
                <span style={{ fontWeight: 700, color: '#15803d' }}>{v.term}:</span>{' '}
                <span style={{ color: '#334155' }}>{v.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedagogical Chain of Thought Reasoning Box (if desired for documentation) */}
      {result.chainOfThought && (
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '10px 14px', marginBottom: '18px', fontSize: '9pt' }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#78350f' }}>
            {isMk ? 'Педагошко расудување (Chain-of-thought · Блумова таксономија):' : 'Pedagogical Reasoning (Chain-of-thought · Bloom\'s Taxonomy):'}
          </strong>
          <div style={{ whiteSpace: 'pre-wrap', color: '#451a03', lineHeight: 1.4 }}>
            {result.chainOfThought}
          </div>
        </div>
      )}

      {/* Main Educational Material Content or Specification */}
      <div style={{ marginTop: '16px' }} className="print-avoid-break">
        <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
          {result.generatedMaterial 
            ? (isMk ? 'Наставна содржина и детален тек на часот' : 'Instructional Plan & Classroom Content')
            : (isMk ? 'Педагошка спецификација и изведена JSON шема' : 'Pedagogical Specification & Minimal JSON Schema')}
        </h2>
        {result.generatedMaterial ? (
          <div style={{ fontSize: '10pt', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {result.generatedMaterial}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '10px', fontSize: '9pt', fontFamily: 'monospace' }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: '#334155', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {isMk ? 'Минимална образовна JSON шема:' : 'Minimal Educational JSON Schema:'}
              </strong>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                <code>{result.jsonString || JSON.stringify(result.parsedJson, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Notes & Reflection Space */}
      <div className="print-avoid-break" style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
        <h3 style={{ fontSize: '10pt', fontWeight: 700, color: '#475569', marginBottom: '18px' }}>
          {isMk ? 'Белешки и рефлексија од одржаниот час:' : 'Teacher Notes & Lesson Reflection:'}
        </h3>
        <div style={{ height: '50px', borderBottom: '1px dotted #cbd5e1', marginBottom: '14px' }}></div>
        <div style={{ height: '50px', borderBottom: '1px dotted #cbd5e1' }}></div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '8pt', color: '#94a3b8' }}>
        EduPrompt Architect · Generated for classroom teaching · {subject} · {grade}
      </div>
    </div>
  );
};
