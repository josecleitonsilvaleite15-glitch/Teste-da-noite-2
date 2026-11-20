import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TactileButton } from '../TactileButton';
import { GameCompletionPanel } from '../GameCompletionPanel';
import { GameId } from '../../types/game';
import { calmAudio } from '../../utils/audio';

interface SimonGameProps {
  onSelectGame: (game: GameId) => void;
}

type SpeedMode = 'devagar' | 'normal' | 'rapido';

interface PadSpec {
  id: number;
  label: string;
  symbol: string;
  idleBg: string;
  litBg: string;
  border: string;
  freq: number;
}

const PADS: PadSpec[] = [
  {
    id: 0,
    label: 'Azul',
    symbol: '●',
    idleBg: '#DBEAFE',
    litBg: '#3B9AE1',
    border: '#60A5FA',
    freq: 523.25, // C5
  },
  {
    id: 1,
    label: 'Amarelo',
    symbol: '★',
    idleBg: '#FEF9C3',
    litBg: '#FACC15',
    border: '#EAB308',
    freq: 587.33, // D5
  },
  {
    id: 2,
    label: 'Verde',
    symbol: '▲',
    idleBg: '#D1FAE5',
    litBg: '#34D399',
    border: '#10B981',
    freq: 659.25, // E5
  },
  {
    id: 3,
    label: 'Coral',
    symbol: '■',
    idleBg: '#FFE4E6',
    litBg: '#FB7185',
    border: '#F43F5E',
    freq: 783.99, // G5
  },
];

const SPEED_TIMINGS: Record<SpeedMode, { onMs: number; gapMs: number; label: string }> = {
  devagar: { onMs: 850, gapMs: 360, label: 'Devagar' },
  normal: { onMs: 560, gapMs: 240, label: 'Normal' },
  rapido: { onMs: 340, gapMs: 140, label: 'Rápido' },
};

const TOTAL_ROUNDS = 5;

export const SimonGame: React.FC<SimonGameProps> = ({ onSelectGame }) => {
  const [speed, setSpeed] = useState<SpeedMode>('normal');
  const [sequence, setSequence] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [phase, setPhase] = useState<'showing' | 'listening' | 'replaying' | 'won'>('showing');
  const [message, setMessage] = useState('Observe a luz que vai acender...');

  const timeoutsRef = useRef<number[]>([]);
  const speedRef = useRef<SpeedMode>(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      setPhase('showing');
      setActivePad(null);
      setPlayerStep(0);

      const { onMs, gapMs } = SPEED_TIMINGS[speedRef.current];
      const stepTotal = onMs + gapMs;

      seq.forEach((padId, index) => {
        const startDelay = 450 + index * stepTotal;

        const tOn = window.setTimeout(() => {
          setActivePad(padId);
          calmAudio.playSimonNote(PADS[padId].freq, onMs / 1000);
        }, startDelay);

        const tOff = window.setTimeout(() => {
          setActivePad(null);
        }, startDelay + onMs);

        timeoutsRef.current.push(tOn, tOff);
      });

      const finishDelay = 450 + seq.length * stepTotal + 120;
      const tDone = window.setTimeout(() => {
        setPhase('listening');
        setMessage('Sua vez! Toque na mesma ordem.');
      }, finishDelay);

      timeoutsRef.current.push(tDone);
    },
    [clearTimers]
  );

  // Trigger sequence playback on mount or when sequence changes
  useEffect(() => {
    if (phase === 'won') return;
    playSequence(sequence);
    return () => clearTimers();
  }, [sequence]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleRestart = () => {
    clearTimers();
    const first = [Math.floor(Math.random() * 4)];
    setPhase('showing');
    setMessage('Observe a luz que vai acender...');
    setSequence(first);
  };

  const handlePadPress = (padId: number) => {
    if (phase !== 'listening') return;

    // Flash pressed pad briefly
    setActivePad(padId);
    calmAudio.playSimonNote(PADS[padId].freq, 0.28);
    window.setTimeout(() => {
      setActivePad((curr) => (curr === padId ? null : curr));
    }, 240);

    const expectedPad = sequence[playerStep];

    if (padId === expectedPad) {
      const nextStep = playerStep + 1;

      if (nextStep >= sequence.length) {
        // Round complete!
        if (sequence.length >= TOTAL_ROUNDS) {
          calmAudio.playCelebrate();
          setPhase('won');
          return;
        }

        setPhase('replaying');
        setMessage('Muito bem! Agora vem mais uma cor... ✅');
        calmAudio.playSuccess();

        const tNext = window.setTimeout(() => {
          setMessage('Observe com atenção...');
          setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
        }, 1000);
        timeoutsRef.current.push(tNext);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Wrong tap: show sequence again without punishment!
      calmAudio.playTryAgain();
      setPhase('replaying');
      setMessage('Sem problemas! Vamos ver a sequência de novo.');

      const tReplay = window.setTimeout(() => {
        setMessage('Observe a ordem novamente...');
        playSequence(sequence);
      }, 1150);
      timeoutsRef.current.push(tReplay);
    }
  };

  if (phase === 'won') {
    return (
      <div className="py-6 px-4">
        <GameCompletionPanel
          currentGame="simon"
          title="Incrível! Você acertou a sequência!"
          subtitle={`Você lembrou todas as ${TOTAL_ROUNDS} rodadas de luzes e sons no seu ritmo.`}
          onReplay={handleRestart}
          onSelectGame={onSelectGame}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-3.5 py-4 flex flex-col items-center">
      {/* Round & Speed Control Row */}
      <div className="w-full flex flex-col items-center gap-2.5 mb-4">
        <div className="text-xs font-semibold text-[#4A6B8C] tabular-nums">
          Rodada {sequence.length} de {TOTAL_ROUNDS}
        </div>

        {/* Speed Selector */}
        <div className="w-full flex items-center justify-between gap-1 p-1 bg-sky-100/80 border border-sky-200 rounded-2xl">
          <span className="text-[11px] font-semibold text-[#4A6B8C] px-2">Velocidade:</span>
          <div className="flex items-center gap-1">
            {(['devagar', 'normal', 'rapido'] as SpeedMode[]).map((mode) => (
              <TactileButton
                key={mode}
                type="button"
                onClick={() => setSpeed(mode)}
                className={`px-2.5 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  speed === mode
                    ? 'bg-white text-[#1A365D] shadow-xs'
                    : 'text-[#4A6B8C] hover:text-[#1A365D]'
                }`}
              >
                {SPEED_TIMINGS[mode].label}
              </TactileButton>
            ))}
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div
        role="status"
        aria-live="polite"
        className="w-full mb-4 px-4 py-3 rounded-2xl bg-white border border-sky-200 text-center font-display font-semibold text-sm text-[#1A365D]"
      >
        {message}
      </div>

      {/* 2x2 Tactile Simon Pads */}
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-[310px] aspect-square">
        {PADS.map((pad) => {
          const isLit = activePad === pad.id;
          return (
            <TactileButton
              key={pad.id}
              type="button"
              silentTap
              disabled={phase !== 'listening'}
              onClick={() => handlePadPress(pad.id)}
              aria-label={`Luz ${pad.label}`}
              className={`rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all duration-150 disabled:opacity-100 ${
                isLit ? 'scale-[1.03] shadow-lg' : 'shadow-xs hover:brightness-[0.98]'
              }`}
              style={{
                backgroundColor: isLit ? pad.litBg : pad.idleBg,
                border: `3px solid ${pad.border}`,
                color: isLit ? '#FFFFFF' : '#1A365D',
              }}
            >
              <span className="text-4xl select-none" aria-hidden="true">
                {pad.symbol}
              </span>
              <span className="font-display font-bold text-base">
                {pad.label}
              </span>
            </TactileButton>
          );
        })}
      </div>

      {/* Replay Sequence Helper Button */}
      <div className="mt-5">
        <TactileButton
          type="button"
          disabled={phase === 'showing'}
          onClick={() => playSequence(sequence)}
          className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-white hover:bg-sky-50 border border-sky-200 text-xs font-semibold text-[#1A365D]"
        >
          Ver sequência de novo
        </TactileButton>
      </div>
    </div>
  );
};
