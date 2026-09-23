'use client';
import {T} from '@/components/LocaleProvider';


import React, { useState } from 'react';
import { ClarificationQuestion, QuestionOption, UserAnswerSubmission } from '@/lib/types';
import { Locale, translations } from '@/lib/i18n';
import { HelpCircle, ArrowRight, SkipForward } from 'lucide-react';

interface ClarificationCardProps {
  question: ClarificationQuestion;
  questionIndex: number;
  totalQuestions: number;
  locale?: Locale;
  onSubmitAnswer: (submission: UserAnswerSubmission) => void;
  onSkip?: () => void;
  onUncertain?: () => void;
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  locale = 'en',
  onSubmitAnswer,
  onSkip,
  onUncertain
}) => {
  const [selectedType, setSelectedType] = useState<'option' | 'custom' | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [customText, setCustomText] = useState('');

  const t = translations[locale].studio.clarification;

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedType('option');
    setSelectedOptionId(optId);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomText(e.target.value);
    setSelectedType('custom');
    setSelectedOptionId(null);
  };

  const handleCustomFocus = () => {
    setSelectedType('custom');
    setSelectedOptionId(null);
  };

  const handleSubmit = () => {
    if (selectedType === 'option' && selectedOptionId) {
      onSubmitAnswer({
        questionId: question.id,
        answerType: 'option',
        optionId: selectedOptionId
      });
    } else if (selectedType === 'custom' && customText.trim()) {
      onSubmitAnswer({
        questionId: question.id,
        answerType: 'custom',
        customText: customText.trim()
      });
    }
  };

  const canSubmit = (selectedType === 'option' && selectedOptionId !== null) ||
                    (selectedType === 'custom' && customText.trim().length > 0);

  const getSeverityBadge = () => {
    switch (question.severity) {
      case 'identity':
        return <span className="badge badge-forest"><T text={"Needed to identify product"}/></span>;
      case 'applicability':
        return <span className="badge badge-saffron"><T text={"Needed to check applicability"}/></span>;
      default:
        return <span className="badge badge-muted"><T text={"Helpful detail"}/></span>;
    }
  };

  return (
    <div className="clarification-card"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header with question index and severity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="eyebrow">
          {t.questionProgress} {questionIndex + 1}<T text={" OF "}/>{totalQuestions}
        </span>
        {getSeverityBadge()}
      </div>

      {/* Main Question Heading */}
      <h3 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--ink-950)', marginBottom: '8px' }}>
        {<T text={question.prompt}/>}
      </h3>

      {/* Short reason explaining why detail matters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-500)', fontSize: '13px', marginBottom: '24px' }}>
        <HelpCircle size={15} />
        <span>{t.reasonLabel} {<T text={question.reason}/>}</span>
      </div>

      {/* Choices Grid (2x2 on desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}
        role="radiogroup"
        aria-label={question.prompt}
      >
        {question.options.map((opt: QuestionOption) => {
          const isSelected = selectedType === 'option' && selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--forest-700)' : '1px solid var(--line)',
                backgroundColor: isSelected ? 'var(--forest-tint)' : 'var(--surface)',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '64px',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
              role="radio"
              aria-checked={isSelected}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 600,
                  fontSize: '12px',
                  backgroundColor: isSelected ? 'var(--forest-700)' : '#E8ECE8',
                  color: isSelected ? '#FFFFFF' : 'var(--ink-950)',
                  flexShrink: 0
                }}
              >
                {opt.id}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-950)' }}>
                {<T text={opt.label}/>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fifth Row: Something else / Custom Text Input */}
      {question.customAllowed && (
        <div
          onClick={handleCustomFocus}
          style={{
            border: selectedType === 'custom' ? '2px solid var(--forest-700)' : '1px solid var(--line)',
            backgroundColor: selectedType === 'custom' ? 'var(--forest-tint)' : 'var(--surface)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            cursor: 'text',
            transition: 'border-color 0.15s, background-color 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: selectedType === 'custom' ? '5px solid var(--forest-700)' : '2px solid var(--control-line)',
                display: 'inline-block'
              }}
            />
            <strong style={{ fontSize: '13px', color: 'var(--ink-950)' }}>
              {t.customOption}
            </strong>
          </div>
          <textarea
            value={customText}
            onChange={handleCustomChange}
            onFocus={handleCustomFocus}
            placeholder={t.customPlaceholder}
            style={{
              width: '100%',
              minHeight: selectedType === 'custom' ? '96px' : '44px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: 'var(--ink-950)',
              resize: 'vertical'
            }}
            maxLength={1000}
          />
        </div>
      )}

      {/* Question Footer Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid var(--line)',
          paddingTop: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onUncertain && (
            <button
              type="button"
              onClick={onUncertain}
              className="btn-outline"
              style={{ fontSize: '13px', minHeight: '38px', padding: '6px 14px' }}
            >
              {t.notSureBtn}
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="btn-outline"
              style={{ fontSize: '13px', minHeight: '38px', padding: '6px 14px' }}
            >
              <SkipForward size={14} />
              {t.skipBtn}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn btn-primary"
          style={{
            opacity: canSubmit ? 1 : 0.45,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
        >
          <span>{t.useAnswerBtn}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
