import React, { useState, useEffect } from 'react';
import { X, Pause, Play } from 'lucide-react';
import { TactileButton } from './TactileButton';
import { calmAudio } from '../utils/audio';

interface BreathingExerciseModalProps {
  open: boolean;
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

interface PhaseConfig {
  phase: BreathPhase;
  label: string;
  helper: string;
  seconds: number;
}

const PHASES: PhaseConfig[] = [
  {
    phase: 'inhale',
    label: 'Inspire devagar...',
    helper: 'Puxe o ar pelo nariz bem tranquilo',
    seconds: 4,
  },
  {
    phase: 'hold',
    label: 'Segure um pouquinho...',
    helper: 'Sinta a calma no seu corpo',
    seconds: 2,
  },
  {
    phase: 'exhale',
    label: 'Solte o ar devagar...',
    helper: 'Assopre bem leve pela boca',
    seconds: 6,
  },
];

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({ open, onClose }) => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhaseIdx(0);
      setSecondsLeft(PHASES[0].seconds);
      setCycles(0);
      setPaused(false);
      return;
    }

    calmAudio.playBreathCue(PHASES[0].phase);
  }, [open]);

  useEffect(() => {
    if (!open || paused) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const nextIdx = (phaseIdx + 1) % PHASES.length;
        if (nextIdx === 0) {
          setCycles((c) => c + 1);
        }
        setPhaseIdx(nextIdx);
        calmAudio.playBreathCue(PHASES[nextIdx].phase);
        return PHASES[nextIdx].seconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, paused, phaseIdx]);

  if (!open) return null;

  const current = PHASES[phaseIdx];

  // Circle scale & transition duration matched to each phase
  const circleScale =
    current.phase === 'inhale'
      ? 'scale-110'
      : current.phase === 'hold'
      ? 'scale-110'
      : 'scale-75';

  const transitionDuration =
    current.phase === 'inhale'
      ? 'duration-[4000ms]'
      : current.phase === 'hold'
      ? 'duration-500'
      : 'duration-[6000ms]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Exercício de respiração calma"
      className="absolute inset-0 z-50 bg-[#F5FAFF]/95 backdrop-blur-sm flex flex-col items-center justify-between p-5"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-[#1A365D]">
            Respiração Calma
          </h2>
          <p className="text-xs text-[#4A6B8C]">
            Ciclos completos: <span className="tabular-nums font-semibold">{cycles}</span>
          </p>
        </div>

        <TactileButton
          type="button"
          onClick={onClose}
          aria-label="Fechar exercício de respiração"
          className="w-11 h-11 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-[#1A365D] shadow-xs"
        >
          <X className="w-5 h-5" />
        </TactileButton>
      </div>

      {/* Center Breathing Circle */}
      <div className="flex flex-col items-center justify-center my-auto py-4">
        <div className="relative w-56 h-56 flex items-center justify-center mb-6">
          {/* Outer soft halo */}
          <div
            className={`absolute w-44 h-44 rounded-full bg-sky-200/50 transition-transform ease-in-out ${circleScale} ${transitionDuration}`}
          />
          {/* Inner breathing sphere */}
          <div
            className={`relative w-36 h-36 rounded-full bg-gradient-to-b from-[#BAE6FD] to-[#7CC4EC] border-4 border-white shadow-md flex flex-col items-center justify-center transition-transform ease-in-out ${circleScale} ${transitionDuration}`}
          >
            <span className="font-display font-bold text-4xl text-[#1A365D] tabular-nums">
              {secondsLeft}
            </span>
          </div>
        </div>

        <p className="font-display font-bold text-2xl text-[#1A365D] text-center mb-1.5">
          {current.label}
        </p>
        <p className="text-sm text-[#4A6B8C] text-center max-w-xs">
          {current.helper}
        </p>
      </div>

      {/* Controls */}
      <div className="w-full flex items-center gap-3">
        <TactileButton
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-white border border-sky-200 text-[#1A365D] font-semibold text-sm inline-flex items-center justify-center gap-2"
        >
          {paused ? <Play className="w-4 h-4 text-[#3B9AE1]" /> : <Pause className="w-4 h-4 text-[#3B9AE1]" />}
          <span>{paused ? 'Continuar' : 'Pausar'}</span>
        </TactileButton>

        <TactileButton
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 min-h-[48px] rounded-2xl bg-[#3B9AE1] hover:bg-[#2F89CE] text-white font-display font-semibold text-sm shadow-xs"
        >
          Estou mais calmo
        </TactileButton>
      </div>
    </div>
  );
};
