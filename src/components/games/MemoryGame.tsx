import React, { useState, useEffect, useCallback } from 'react';
import { TactileButton } from '../TactileButton';
import { HandDrawnDandelionCardBack } from '../illustrations/GameIcons';
import { GameCompletionPanel } from '../GameCompletionPanel';
import { GameId } from '../../types/game';
import { calmAudio } from '../../utils/audio';

interface MemoryGameProps {
  onSelectGame: (game: GameId) => void;
}

interface CardSymbol {
  key: string;
  label: string;
  emoji: string;
  bg: string;
  border: string;
}

const CARD_SYMBOLS: CardSymbol[] = [
  { key: 'sol', label: 'Sol', emoji: '☀️', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'estrela', label: 'Estrela', emoji: '⭐', bg: 'bg-sky-50', border: 'border-sky-200' },
  { key: 'lua', label: 'Lua', emoji: '🌙', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'nuvem', label: 'Nuvem', emoji: '☁️', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { key: 'flor', label: 'Flor', emoji: '🌸', bg: 'bg-pink-50', border: 'border-pink-200' },
  { key: 'folha', label: 'Folha', emoji: '🍃', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

// Progressive stages: 4 cards -> 6 cards -> 8 cards
const STAGE_COUNTS = [4, 6, 8];

interface CardItem {
  uid: number;
  symbol: CardSymbol;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(totalCards: number): CardItem[] {
  const pairCount = totalCards / 2;
  const chosen = [...CARD_SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairCount);
  const doubled = [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((symbol, idx) => ({
      uid: idx,
      symbol,
      flipped: false,
      matched: false,
    }));
  return doubled;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onSelectGame }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [cards, setCards] = useState<CardItem[]>(() => buildDeck(STAGE_COUNTS[0]));
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'neutral' | 'success' | 'try' }>({
    text: 'Toque em duas cartas para encontrar o par igual.',
    tone: 'neutral',
  });
  const [stageWon, setStageWon] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  const startStage = useCallback((nextIdx: number) => {
    setStageIndex(nextIdx);
    setCards(buildDeck(STAGE_COUNTS[nextIdx]));
    setSelectedIndices([]);
    setLocked(false);
    setStageWon(false);
    setAllCompleted(false);
    setFeedback({
      text: 'Toque em duas cartas para encontrar o par igual.',
      tone: 'neutral',
    });
  }, []);

  const handleRestartAll = () => {
    startStage(0);
  };

  useEffect(() => {
    if (selectedIndices.length !== 2) return;
    setLocked(true);

    const [firstIdx, secondIdx] = selectedIndices;
    const firstCard = cards[firstIdx];
    const secondCard = cards[secondIdx];

    if (firstCard.symbol.key === secondCard.symbol.key) {
      calmAudio.playSuccess();
      setFeedback({
        text: 'Muito bem! Você encontrou! ✅',
        tone: 'success',
      });

      const timer = setTimeout(() => {
        setCards((prev) => {
          const updated = prev.map((c, idx) =>
            idx === firstIdx || idx === secondIdx ? { ...c, matched: true } : c
          );
          const allMatched = updated.every((c) => c.matched);
          if (allMatched) {
            calmAudio.playCelebrate();
            if (stageIndex >= STAGE_COUNTS.length - 1) {
              setAllCompleted(true);
            } else {
              setStageWon(true);
            }
          }
          return updated;
        });
        setSelectedIndices([]);
        setLocked(false);
      }, 450);

      return () => clearTimeout(timer);
    } else {
      calmAudio.playTryAgain();
      setFeedback({
        text: 'Tente de novo, você consegue! 💪',
        tone: 'try',
      });

      const timer = setTimeout(() => {
        setCards((prev) =>
          prev.map((c, idx) =>
            idx === firstIdx || idx === secondIdx ? { ...c, flipped: false } : c
          )
        );
        setSelectedIndices([]);
        setLocked(false);
      }, 1050);

      return () => clearTimeout(timer);
    }
  }, [selectedIndices, cards, stageIndex]);

  const handleCardClick = (index: number) => {
    if (locked || stageWon || allCompleted) return;
    const target = cards[index];
    if (target.flipped || target.matched) return;

    calmAudio.playFlip();
    setCards((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, flipped: true } : c))
    );
    setSelectedIndices((prev) => [...prev, index]);
  };

  if (allCompleted) {
    return (
      <div className="py-6 px-4">
        <GameCompletionPanel
          currentGame="memory"
          title="Parabéns! Você completou todas as fases!"
          subtitle="Você encontrou todos os pares de 4, 6 e 8 cartas com muita calma e atenção."
          onReplay={handleRestartAll}
          onSelectGame={onSelectGame}
        />
      </div>
    );
  }

  const cardCount = STAGE_COUNTS[stageIndex];
  const gridColsClass =
    cardCount === 4
      ? 'grid-cols-2 gap-3.5 max-w-[300px]'
      : cardCount === 6
      ? 'grid-cols-3 gap-2.5'
      : 'grid-cols-4 gap-2';

  return (
    <div className="w-full px-3.5 py-4 flex flex-col items-center">
      {/* Quiet Progress Indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#4A6B8C] mb-3">
        <span>Fase {stageIndex + 1} de {STAGE_COUNTS.length}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{cardCount} cartas</span>
      </div>

      {/* Positive Feedback Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`w-full mb-4 px-4 py-3 rounded-2xl border text-center font-display font-semibold text-sm transition-colors duration-200 ${
          feedback.tone === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : feedback.tone === 'try'
            ? 'bg-sky-50 border-sky-200 text-[#1A365D]'
            : 'bg-white border-sky-200 text-[#1A365D]'
        }`}
      >
        {feedback.text}
      </div>

      {/* Cards Grid */}
      <div className={`grid ${gridColsClass} w-full mx-auto`}>
        {cards.map((card, idx) => {
          const isOpen = card.flipped || card.matched;
          return (
            <div key={`${stageIndex}-${card.uid}`} className="perspective-1000 aspect-[3/4]">
              <TactileButton
                type="button"
                silentTap
                disabled={isOpen || locked}
                onClick={() => handleCardClick(idx)}
                aria-label={isOpen ? `Carta ${card.symbol.label}` : `Carta virada ${idx + 1}`}
                className="w-full h-full rounded-2xl p-0 bg-transparent disabled:opacity-100"
              >
                <div
                  className={`relative w-full h-full transform-style-3d transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Back of Card: Hand-drawn Dandelion */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-white border-2 border-sky-200 shadow-sm hover:border-sky-300 flex items-center justify-center p-2">
                    <HandDrawnDandelionCardBack className="w-full h-full" />
                  </div>

                  {/* Front of Card: Friendly Symbol */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1.5 shadow-sm ${
                      card.symbol.bg
                    } ${card.matched ? 'border-emerald-400 ring-2 ring-emerald-200' : card.symbol.border}`}
                  >
                    <span className={`${cardCount === 8 ? 'text-2xl' : 'text-3xl'} select-none`} aria-hidden="true">
                      {card.symbol.emoji}
                    </span>
                    <span className={`font-display font-semibold text-[#1A365D] ${cardCount === 8 ? 'text-[11px]' : 'text-xs'}`}>
                      {card.symbol.label}
                    </span>
                  </div>
                </div>
              </TactileButton>
            </div>
          );
        })}
      </div>

      {/* Between-stage transition (4 -> 6 -> 8 cards) */}
      {stageWon && (
        <div className="mt-7 w-full max-w-lg bg-white border border-sky-200 rounded-3xl p-6 text-center shadow-sm">
          <p className="font-display font-bold text-xl text-[#1A365D] mb-2">
            Fase concluída! 🎉
          </p>
          <p className="text-sm text-[#4A6B8C] mb-5">
            Agora vamos experimentar com {STAGE_COUNTS[stageIndex + 1]} cartas?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <TactileButton
              type="button"
              onClick={() => startStage(stageIndex + 1)}
              className="px-6 py-3 min-h-[48px] rounded-2xl bg-[#3B9AE1] hover:bg-[#2F89CE] text-white font-display font-semibold text-base"
            >
              Continuar ({STAGE_COUNTS[stageIndex + 1]} cartas)
            </TactileButton>
            <TactileButton
              type="button"
              onClick={() => onSelectGame('menu')}
              className="px-5 py-3 min-h-[48px] rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#1A365D] font-semibold text-sm border border-sky-200"
            >
              Trocar de jogo
            </TactileButton>
          </div>
        </div>
      )}
    </div>
  );
};
