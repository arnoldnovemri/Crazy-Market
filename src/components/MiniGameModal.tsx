import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { MINI_GAME_QUESTIONS, MiniGameQuestion } from '../utils/gameData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface MiniGameModalProps {
  stallName: string;
  itemName: string;
  bonusPercent: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  stallName,
  itemName,
  bonusPercent,
  onSuccess,
  onClose,
}) => {
  const [question, setQuestion] = useState<MiniGameQuestion>(() => {
    const randomIdx = Math.floor(Math.random() * MINI_GAME_QUESTIONS.length);
    return MINI_GAME_QUESTIONS[randomIdx];
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);

  useEffect(() => {
    if (hasSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // auto time out
          setHasSubmitted(true);
          setIsCorrect(false);
          sounds.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasSubmitted]);

  const handleSubmit = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
    setHasSubmitted(true);

    const correct = question.options[index]?.isCorrect ?? false;
    setIsCorrect(correct);

    if (correct) {
      sounds.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } else {
      sounds.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-amber-300">
                Double Discount Mini-Game!
              </h3>
              <p className="text-xs text-slate-400">
                Solve arithmetic at {stallName} for +{bonusPercent}% Double Discount on {itemName}!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-amber-400" />
            Time Remaining
          </span>
          <span className={`font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-300'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 10 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${(timeLeft / 25) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="mt-5 p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-2.5">
          {question.options.map((option, idx) => {
            let btnClass = 'w-full p-3 text-left text-xs font-semibold rounded-xl border transition-all ';
            if (!hasSubmitted) {
              btnClass += 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/80 hover:border-amber-400/60 text-slate-200';
            } else {
              if (option.isCorrect) {
                btnClass += 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
              } else if (selectedOption === idx) {
                btnClass += 'bg-rose-950/80 border-rose-500 text-rose-200';
              } else {
                btnClass += 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => handleSubmit(idx)}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {hasSubmitted && option.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {hasSubmitted && selectedOption === idx && !option.isCorrect && (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {hasSubmitted && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-200'
                : 'bg-rose-950/50 border-rose-600/50 text-rose-200'
            }`}
          >
            <p className="font-bold mb-1">
              {isCorrect ? '🎉 Correct! Extra discount unlocked!' : '❌ Not quite right!'}
            </p>
            <p className="text-slate-300">{question.explanation}</p>
          </div>
        )}

        {/* Footer */}
        {hasSubmitted && !isCorrect && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
