import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Hand, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MATCH_QUESTIONS } from '../../data/saslVocabulary';
import type { MatchSignQuestion } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface GameMatchSignProps {
  onScoreUpdate: (points: number) => void;
  onBackToMenu: () => void;
}

export const GameMatchSign: React.FC<GameMatchSignProps> = ({
  onScoreUpdate,
  onBackToMenu,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ: MatchSignQuestion = MATCH_QUESTIONS[currentIndex] || MATCH_QUESTIONS[0];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      setScore((s) => s + 10);
      onScoreUpdate(10);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0284c7', '#0d9488', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentIndex < MATCH_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Game Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
            1
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {t.learnSasl.game1Title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.learnSasl.questionProgress
                .replace('{current}', String(currentIndex + 1))
                .replace('{total}', String(MATCH_QUESTIONS.length))} &bull; {t.common.score}: <span className="text-sky-600 font-bold">{score} pts</span>
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

      {/* Visual Sign Prompt Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden shadow-inner border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-bold">
          <Hand className="w-3.5 h-3.5" />
          <span>SIGN DESCRIPTION</span>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold text-white font-sans max-w-xl mx-auto leading-relaxed">
          &ldquo;{currentQ.visualDescription}&rdquo;
        </p>

        <p className="text-xs text-slate-400 font-medium">
          {t.learnSasl.hintLabel}: {currentQ.hint}
        </p>
      </div>

      <p className="text-base font-extrabold text-slate-900 text-center">
        What does this SASL sign mean?
      </p>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((option) => {
          let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900';

          if (isAnswered) {
            if (option === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-600 border-emerald-600 text-white shadow-md';
            } else if (option === selectedAnswer) {
              btnStyle = 'bg-rose-500 border-rose-500 text-white';
            } else {
              btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={option}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`p-5 rounded-2xl border-2 font-extrabold text-lg text-center transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-95 ${btnStyle}`}
            >
              <span>{option}</span>
              {isAnswered && option === currentQ.correctAnswer && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
              {isAnswered && option === selectedAnswer && option !== currentQ.correctAnswer && (
                <XCircle className="w-6 h-6 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Visual Feedback Banner */}
      {isAnswered && (
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {selectedAnswer === currentQ.correctAnswer ? (
              <span className="text-emerald-700 font-extrabold text-base flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>{t.learnSasl.correctAlert}</span>
              </span>
            ) : (
              <span className="text-amber-700 font-extrabold text-base flex items-center gap-1.5">
                <RotateCcw className="w-5 h-5" />
                <span>{t.learnSasl.incorrectAlert}: {currentQ.correctAnswer}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm ml-auto active:scale-95"
          >
            <span>{t.learnSasl.nextQuestionBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
