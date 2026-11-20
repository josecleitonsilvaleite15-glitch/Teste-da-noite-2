import React, { useState, useEffect, useMemo } from 'react';
import { TactileButton } from '../TactileButton';
import { GameCompletionPanel } from '../GameCompletionPanel';
import { GameId } from '../../types/game';
import { calmAudio } from '../../utils/audio';

interface SequenceGameProps {
  onSelectGame: (game: GameId) => void;
}

type SequenceCategory = 'todos' | 'formas' | 'numeros' | 'animais';

interface SequencePuzzle {
  id: string;
  category: Exclude<SequenceCategory, 'todos'>;
  items: string[];
  answer: string;
  options: string[];
  patternHint: string;
  repeatUnitSize: number;
}

const ALL_PUZZLES: SequencePuzzle[] = [
  // Formas
  {
    id: 'f1',
    category: 'formas',
    items: ['🔵', '🔵', '🟠', '🔵', '🔵'],
    answer: '🟠',
    options: ['🟠', '🔵', '🟢'],
    patternHint: 'Azul, azul, laranja...',
    repeatUnitSize: 3,
  },
  {
    id: 'f2',
    category: 'formas',
    items: ['🔺', '🟡', '🔺', '🟡', '🔺'],
    answer: '🟡',
    options: ['🟡', '🔺', '🟦'],
    patternHint: 'Triângulo, círculo amarelo...',
    repeatUnitSize: 2,
  },
  {
    id: 'f3',
    category: 'formas',
    items: ['🟩', '🟣', '🔵', '🟩', '🟣'],
    answer: '🔵',
    options: ['🔵', '🟩', '🟣'],
    patternHint: 'Verde, roxo, azul...',
    repeatUnitSize: 3,
  },
  // Números
  {
    id: 'n1',
    category: 'numeros',
    items: ['1', '2', '1', '2', '1'],
    answer: '2',
    options: ['2', '1', '3'],
    patternHint: '1, 2, 1, 2...',
    repeatUnitSize: 2,
  },
  {
    id: 'n2',
    category: 'numeros',
    items: ['2', '4', '6', '8'],
    answer: '10',
    options: ['10', '9', '12'],
    patternHint: 'Pulando de 2 em 2...',
    repeatUnitSize: 1,
  },
  {
    id: 'n3',
    category: 'numeros',
    items: ['1', '1', '3', '1', '1'],
    answer: '3',
    options: ['3', '1', '2'],
    patternHint: '1, 1, 3...',
    repeatUnitSize: 3,
  },
  // Animais
  {
    id: 'a1',
    category: 'animais',
    items: ['🐱', '🐶', '🐱', '🐶', '🐱'],
    answer: '🐶',
    options: ['🐶', '🐱', '🐰'],
    patternHint: 'Gato, cachorro, gato...',
    repeatUnitSize: 2,
  },
  {
    id: 'a2',
    category: 'animais',
    items: ['🐟', '🐟', '🐢', '🐟', '🐟'],
    answer: '🐢',
    options: ['🐢', '🐟', '🦋'],
    patternHint: 'Peixe, peixe, tartaruga...',
    repeatUnitSize: 3,
  },
  {
    id: 'a3',
    category: 'animais',
    items: ['🦋', '🐦', '🐰', '🦋', '🐦'],
    answer: '🐰',
    options: ['🐰', '🦋', '🐦'],
    patternHint: 'Borboleta, passarinho, coelho...',
    repeatUnitSize: 3,
  },
];

const PUZZLES_PER_ROUND = 6;
const HINT_DELAY_MS = 7000;

export const SequenceGame: React.FC<SequenceGameProps> = ({ onSelectGame }) => {
  const [category, setCategory] = useState<SequenceCategory>('todos');
  const [roundSeed, setRoundSeed] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showVisualHint, setShowVisualHint] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'neutral' | 'success' | 'try' }>({
    text: 'Escolha o item que completa a sequência.',
    tone: 'neutral',
  });
  const [locked, setLocked] = useState(false);
  const [completed, setCompleted] = useState(false);

  const puzzles = useMemo(() => {
    const pool =
      category === 'todos'
        ? ALL_PUZZLES
        : ALL_PUZZLES.filter((p) => p.category === category);

    // Shuffle options deterministically per round
    const ordered = [...pool].sort(() => Math.random() - 0.5);
    const list =
      ordered.length >= PUZZLES_PER_ROUND
        ? ordered.slice(0, PUZZLES_PER_ROUND)
        : [...ordered, ...ordered].slice(0, PUZZLES_PER_ROUND);

    return list.map((p) => ({
      ...p,
      options: [...p.options].sort(() => Math.random() - 0.5),
    }));
  }, [category, roundSeed]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPuzzle = puzzles[currentIdx];

  // Automatic gentle visual hint if child takes a while
  useEffect(() => {
    if (completed || locked) return;
    setShowVisualHint(false);

    const timer = window.setTimeout(() => {
      setShowVisualHint(true);
    }, HINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [currentIdx, roundSeed, category, completed, locked]);

  const handleCategoryChange = (next: SequenceCategory) => {
    setCategory(next);
    setCurrentIdx(0);
    setShowVisualHint(false);
    setLocked(false);
    setCompleted(false);
    setFeedback({
      text: 'Escolha o item que completa a sequência.',
      tone: 'neutral',
    });
  };

  const handleReplay = () => {
    setRoundSeed((s) => s + 1);
    setCurrentIdx(0);
    setShowVisualHint(false);
    setLocked(false);
    setCompleted(false);
    setFeedback({
      text: 'Escolha o item que completa a sequência.',
      tone: 'neutral',
    });
  };

  const handleOptionClick = (opt: string) => {
    if (locked || completed) return;

    if (opt === currentPuzzle.answer) {
      calmAudio.playSuccess();
      setLocked(true);
      setFeedback({
        text: 'Muito bem! Você completou! ✅',
        tone: 'success',
      });

      window.setTimeout(() => {
        if (currentIdx + 1 >= puzzles.length) {
          calmAudio.playCelebrate();
          setCompleted(true);
        } else {
          setCurrentIdx((i) => i + 1);
          setFeedback({
            text: 'Escolha o item que completa a sequência.',
            tone: 'neutral',
          });
        }
        setLocked(false);
      }, 900);
    } else {
      calmAudio.playTryAgain();
      setShowVisualHint(true);
      setFeedback({
        text: 'Tente de novo, observe o ritmo da sequência! 💪',
        tone: 'try',
      });
    }
  };

  if (completed) {
    return (
      <div className="py-6 px-4">
        <GameCompletionPanel
          currentGame="sequence"
          title="Parabéns! Todas as sequências completas!"
          subtitle="Você observou cada padrão com calma e descobriu o que vinha depois."
          onReplay={handleReplay}
          onSelectGame={onSelectGame}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-3.5 py-4 flex flex-col items-center">
      {/* Category Filter & Progress */}
      <div className="w-full flex flex-col items-center gap-2.5 mb-4">
        <span className="text-xs font-semibold text-[#4A6B8C] tabular-nums">
          Sequência {currentIdx + 1} de {puzzles.length}
        </span>

        <div className="w-full grid grid-cols-4 gap-1 p-1 bg-sky-100/80 border border-sky-200 rounded-2xl">
          {(
            [
              { id: 'todos', label: 'Misturado' },
              { id: 'formas', label: 'Formas' },
              { id: 'numeros', label: 'Números' },
              { id: 'animais', label: 'Animais' },
            ] as Array<{ id: SequenceCategory; label: string }>
          ).map((cat) => (
            <TactileButton
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-1.5 py-1.5 min-h-[36px] rounded-xl text-[11px] font-semibold whitespace-nowrap ${
                category === cat.id
                  ? 'bg-white text-[#1A365D] shadow-xs'
                  : 'text-[#4A6B8C] hover:text-[#1A365D]'
              }`}
            >
              {cat.label}
            </TactileButton>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`w-full mb-4 px-4 py-3 rounded-2xl border text-center font-display font-semibold text-sm ${
          feedback.tone === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : feedback.tone === 'try'
            ? 'bg-sky-50 border-sky-200 text-[#1A365D]'
            : 'bg-white border-sky-200 text-[#1A365D]'
        }`}
      >
        {feedback.text}
      </div>

      {/* Sequence Display Card */}
      <div className="w-full bg-white border border-sky-200 rounded-3xl px-3 py-5 shadow-xs mb-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {currentPuzzle.items.map((item, idx) => {
            const isRepeatHighlight =
              showVisualHint && idx < currentPuzzle.repeatUnitSize;
            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-2 transition-all duration-300 ${
                  isRepeatHighlight
                    ? 'bg-sky-100 border-[#3B9AE1] scale-105'
                    : 'bg-sky-50/70 border-sky-100 text-[#1A365D]'
                }`}
              >
                {item}
              </div>
            );
          })}

          {/* Missing Slot */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold border-2 border-dashed ${
              locked
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                : 'bg-sky-50 border-[#3B9AE1] text-[#3B9AE1]'
            }`}
            aria-label="Espaço para completar"
          >
            {locked ? currentPuzzle.answer : '__'}
          </div>
        </div>

        {/* Gentle Visual Hint when taking time */}
        {showVisualHint && !locked && (
          <div className="mt-4 pt-3 border-t border-sky-100 text-center text-xs font-semibold text-[#2B6CB0]">
            Dica visual: {currentPuzzle.patternHint} (olhe a opção destacada abaixo)
          </div>
        )}
      </div>

      {/* Choice Options */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {currentPuzzle.options.map((opt, idx) => {
          const isHintedOption = showVisualHint && opt === currentPuzzle.answer && !locked;
          return (
            <TactileButton
              key={`${currentPuzzle.id}-${idx}-${opt}`}
              type="button"
              disabled={locked}
              onClick={() => handleOptionClick(opt)}
              aria-label={`Escolher ${opt}`}
              className={`h-20 rounded-2xl bg-white border-2 flex items-center justify-center text-3xl font-display font-bold text-[#1A365D] shadow-xs hover:bg-sky-50 transition-all ${
                isHintedOption
                  ? 'border-[#3B9AE1] animate-hint-glow bg-sky-50/60'
                  : 'border-sky-200'
              }`}
            >
              {opt}
            </TactileButton>
          );
        })}
      </div>
    </div>
  );
};
