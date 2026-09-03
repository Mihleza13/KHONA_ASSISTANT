import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Sparkles, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COMPLETE_PHRASE_QUESTIONS } from '../../data/saslVocabulary';
import type { CompletePhraseQuestion } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface GameCompletePhraseProps {
  onScoreUpdate: (points: number) => void;
  onBackToMenu: () => void;
}

export const GameCompletePhrase: React.FC<GameCompletePhraseProps> = ({
  onScoreUpdate,
  onBackToMenu,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ: CompletePhraseQuestion =
    COMPLETE_PHRASE_QUESTIONS[currentIndex] || COMPLETE_PHRASE_QUESTIONS[0];

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.missingWord) {
      setScore((s) => s + 10);
      onScoreUpdate(10);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#9333ea', '#a855f7', '#06b6d4', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < COMPLETE_PHRASE_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const renderPhrase = () => {
    const parts = currentQ.phraseTemplate.split('______');
    return (
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans leading-relaxed">
        <span>{parts[0]}</span>
        <span className={`inline-block px-4 py-1.5 mx-1.5 rounded-2xl border-b-4 font-mono transition-all ${
          !isAnswered
            ? 'bg-amber-100 border-amber-400 text-amber-900 min-w-[120px] text-center'
            : selectedOption === currentQ.missingWord
            ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-xs'
            : 'bg-rose-100 border-rose-500 text-rose-900'
        }`}>
          {selectedOption ? selectedOption : '______'}
        </span>
        <span>{parts[1]}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
            3
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {t.learnSasl.game3Title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.learnSasl.questionProgress
                .replace('{current}', String(currentIndex + 1))
                .replace('{total}', String(COMPLETE_PHRASE_QUESTIONS.length))} &bull; {t.common.score}: <span className="text-purple-600 font-bold">{score} pts</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {t.learnSasl.backToHubBtn}
        </button>
      </div>

      {/* Main Phrase Card */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border-2 border-slate-200 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CLINIC PHRASE EXERCISE</span>
        </div>

        {renderPhrase()}

        <p className="text-xs text-slate-500 font-medium">
          Context: {currentQ.contextMeaning}
        </p>
      </div>

      <p className="text-base font-extrabold text-slate-900 text-center">
        Select the missing SASL vocabulary word:
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {currentQ.options.map((option) => {
          let style = 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900';

          if (isAnswered) {
            if (option === currentQ.missingWord) {
              style = 'bg-emerald-600 border-emerald-600 text-white shadow-md';
            } else if (option === selectedOption) {
              style = 'bg-rose-500 border-rose-500 text-white';
            } else {
              style = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={option}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(option)}
              className={`p-5 rounded-2xl border-2 font-extrabold text-lg text-center transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${style}`}
            >
              <span>{option}</span>
              {isAnswered && option === currentQ.missingWord && (
                <CheckCircle2 className="w-6 h-6 text-white" />
              )}
              {isAnswered && option === selectedOption && option !== currentQ.missingWord && (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Advance */}
      {isAnswered && (
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            {selectedOption === currentQ.missingWord ? (
              <span className="text-emerald-700 font-extrabold text-base flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>{t.learnSasl.correctAlert}</span>
              </span>
            ) : (
              <span className="text-amber-700 font-extrabold text-base flex items-center gap-1.5">
                <RotateCcw className="w-5 h-5" />
                <span>{t.learnSasl.incorrectAlert}: {currentQ.missingWord}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ml-auto"
          >
            <span>{currentIndex < COMPLETE_PHRASE_QUESTIONS.length - 1 ? t.learnSasl.nextQuestionBtn : t.learnSasl.playAgainBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
