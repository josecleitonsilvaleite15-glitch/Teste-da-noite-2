import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TactileButton } from '../TactileButton';
import { GameCompletionPanel } from '../GameCompletionPanel';
import { GameId } from '../../types/game';
import { calmAudio } from '../../utils/audio';

interface FallingBallsGameProps {
  onSelectGame: (game: GameId) => void;
}

interface ColorSpec {
  id: 'amarelo' | 'azul' | 'verde' | 'laranja' | 'lilas';
  label: string;
  hex: string;
  border: string;
  symbol: string;
}

const COLORS: ColorSpec[] = [
  { id: 'amarelo', label: 'amarelo', hex: '#FDE047', border: '#CA8A04', symbol: '★' },
  { id: 'azul', label: 'azul', hex: '#60A5FA', border: '#2563EB', symbol: '●' },
  { id: 'verde', label: 'verde', hex: '#6EE7B7', border: '#059669', symbol: '▲' },
  { id: 'laranja', label: 'laranja', hex: '#FDBA74', border: '#EA580C', symbol: '■' },
  { id: 'lilas', label: 'lilás', hex: '#C4B5FD', border: '#7C3AED', symbol: '◆' },
];

interface BallEntity {
  id: number;
  color: ColorSpec;
  xPercent: number;
  yPercent: number;
  speed: number;
  popping?: boolean;
}

const TARGET_HITS_TO_WIN = 10;

export const FallingBallsGame: React.FC<FallingBallsGameProps> = ({ onSelectGame }) => {
  const [targetColor, setTargetColor] = useState<ColorSpec>(() => COLORS[0]); // Starts with yellow ("Toque só no amarelo!")
  const [hits, setHits] = useState(0);
  const [balls, setBalls] = useState<BallEntity[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const nextIdRef = useRef(1);
  const hitsRef = useRef(0);
  const targetRef = useRef(targetColor);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);

  useEffect(() => {
    targetRef.current = targetColor;
  }, [targetColor]);

  const spawnBall = useCallback((): BallEntity => {
    // 45% chance to spawn the target color so child never waits long
    const isTarget = Math.random() < 0.45;
    const otherColors = COLORS.filter((c) => c.id !== targetRef.current.id);
    const chosenColor = isTarget
      ? targetRef.current
      : otherColors[Math.floor(Math.random() * otherColors.length)];

    // Base speed scales smoothly with hits
    const speedBoost = 1 + hitsRef.current * 0.11;
    const baseSpeed = (14 + Math.random() * 7) * speedBoost; // % height per second

    return {
      id: nextIdRef.current++,
      color: chosenColor,
      xPercent: 10 + Math.random() * 80,
      yPercent: -12,
      speed: baseSpeed,
    };
  }, []);

  const resetGame = useCallback(() => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(nextColor);
    targetRef.current = nextColor;
    setHits(0);
    hitsRef.current = 0;
    setBalls([]);
    setFeedback('');
    setCompleted(false);
    lastSpawnRef.current = 0;
  }, []);

  useEffect(() => {
    if (completed) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Spawn interval shrinks gently as hits increase
      const spawnIntervalMs = Math.max(650, 1250 - hitsRef.current * 55);
      const shouldSpawn = now - lastSpawnRef.current >= spawnIntervalMs;
      if (shouldSpawn) {
        lastSpawnRef.current = now;
      }

      setBalls((prev) => {
        const moved = prev
          .map((b) => ({ ...b, yPercent: b.yPercent + b.speed * dt }))
          .filter((b) => b.yPercent < 108);

        if (shouldSpawn && moved.length < 9) {
          return [...moved, spawnBall()];
        }
        return moved;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [completed, spawnBall]);

  const handleBallTap = (ball: BallEntity) => {
    if (completed || ball.popping) return;

    // Show brief tactile pop & ripple before removing the tapped ball
    setBalls((prev) =>
      prev.map((b) => (b.id === ball.id ? { ...b, popping: true } : b))
    );
    window.setTimeout(() => {
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
    }, 150);

    if (ball.color.id === targetColor.id) {
      calmAudio.playSuccess();
      const nextHits = hits + 1;
      setHits(nextHits);
      setFeedback('Muito bem! Você acertou! ✅');

      if (nextHits >= TARGET_HITS_TO_WIN) {
        calmAudio.playCelebrate();
        setCompleted(true);
      }
    } else {
      // No punishment when tapping wrong color
      calmAudio.playTryAgain();
      setFeedback(`Sem problemas! Continue procurando o ${targetColor.label}.`);
    }
  };

  if (completed) {
    return (
      <div className="py-6 px-4">
        <GameCompletionPanel
          currentGame="balls"
          title="Muito bem! Você pegou todas!"
          subtitle={`Você encontrou ${TARGET_HITS_TO_WIN} bolinhas da cor ${targetColor.label} mesmo quando ficou mais rápido.`}
          onReplay={resetGame}
          onSelectGame={onSelectGame}
        />
      </div>
    );
  }

  const speedLevel = (1 + hits * 0.1).toFixed(1);

  return (
    <div className="w-full px-3.5 py-4 flex flex-col items-center">
      {/* Target Instruction Header */}
      <div className="w-full bg-white border border-sky-200 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-9 h-9 rounded-full inline-flex items-center justify-center font-bold text-base shadow-xs shrink-0"
            style={{
              backgroundColor: targetColor.hex,
              border: `3px solid ${targetColor.border}`,
              color: '#1A365D',
            }}
            aria-hidden="true"
          >
            {targetColor.symbol}
          </span>
          <p className="font-display font-bold text-base text-[#1A365D] truncate">
            Toque só no {targetColor.label}!
          </p>
        </div>

        <div className="flex flex-col items-end text-xs font-semibold text-[#4A6B8C] tabular-nums shrink-0">
          <span>{hits} / {TARGET_HITS_TO_WIN}</span>
          <span>Vel. {speedLevel}x</span>
        </div>
      </div>

      {/* Gentle non-punitive feedback line */}
      <div className="min-h-[28px] flex items-center justify-center mb-2.5 text-center" role="status" aria-live="polite">
        {feedback ? (
          <p className="text-xs font-semibold text-[#1A365D]">
            {feedback}
          </p>
        ) : (
          <p className="text-xs text-[#4A6B8C]">
            Se tocar em outra cor, sem problema, continua.
          </p>
        )}
      </div>

      {/* Minimalist Falling Arena */}
      <div
        className="relative w-full h-[380px] bg-white border border-sky-200 rounded-3xl overflow-hidden shadow-xs"
        aria-label="Área de bolinhas caindo"
      >
        {balls.map((ball) => (
          <TactileButton
            key={ball.id}
            type="button"
            silentTap
            onPointerDown={() => handleBallTap(ball)}
            aria-label={`Bolinha ${ball.color.label}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full flex items-center justify-center shadow-sm transition-all duration-150 ${
              ball.popping ? 'scale-125 opacity-0 pointer-events-none' : 'hover:scale-105'
            }`}
            style={{
              left: `${ball.xPercent}%`,
              top: `${ball.yPercent}%`,
              backgroundColor: ball.color.hex,
              border: `3px solid ${ball.color.border}`,
              color: '#1A365D',
            }}
          >
            {/* Subtle highlight & accessible shape symbol */}
            <span className="text-xl font-bold opacity-75 pointer-events-none" aria-hidden="true">
              {ball.color.symbol}
            </span>
          </TactileButton>
        ))}
      </div>
    </div>
  );
};
