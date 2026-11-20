import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX, ArrowLeft } from 'lucide-react';
import { TactileButton } from './TactileButton';
import { IconBreathing } from './illustrations/GameIcons';
import { GameId, GAMES } from '../types/game';

interface TopBarProps {
  activeGame: GameId;
  onGoHome: () => void;
  volume: number;
  muted: boolean;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  breathingOpen: boolean;
  onOpenBreathing: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeGame,
  onGoHome,
  volume,
  muted,
  onChangeVolume,
  onToggleMute,
  breathingOpen,
  onOpenBreathing,
}) => {
  const [sliderOpen, setSliderOpen] = useState(false);

  const currentMeta = GAMES.find((g) => g.id === activeGame);
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-40 shrink-0">
      <div className="px-3 h-14 flex items-center justify-between gap-2">
        {/* Left Zone: Home / Back */}
        <div className="flex items-center min-w-0">
          {activeGame !== 'menu' ? (
            <TactileButton
              type="button"
              onClick={onGoHome}
              aria-label="Voltar para a tela inicial"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[40px] rounded-xl bg-sky-50 hover:bg-sky-100 text-[#1A365D] font-semibold text-xs border border-sky-200 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#3B9AE1]" />
              <span>Início</span>
            </TactileButton>
          ) : (
            <span className="font-display font-bold text-base tracking-tight text-[#1A365D] whitespace-nowrap shrink-0">
              mundo calmo
            </span>
          )}
        </div>

        {/* Right Zone: Breathing Exercise + Volume */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          {/* Breathing Exercise Button */}
          <TactileButton
            type="button"
            onClick={onOpenBreathing}
            aria-pressed={breathingOpen}
            aria-label="Abrir exercício de respiração calma"
            title="Exercício de respiração"
            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[40px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              breathingOpen
                ? 'bg-[#E0F2FE] border-[#3B9AE1] text-[#1A365D] shadow-xs'
                : 'bg-sky-50/90 hover:bg-sky-100/80 border-sky-200 text-[#1A365D]'
            }`}
          >
            <IconBreathing className="w-5 h-5 shrink-0" />
            <span>Respirar</span>
          </TactileButton>

          {/* Volume / Mute Control */}
          <TactileButton
            type="button"
            onClick={() => setSliderOpen((prev) => !prev)}
            aria-expanded={sliderOpen}
            aria-label={muted || volume === 0 ? 'Som silenciado, abrir controle de volume' : 'Abrir controle de volume'}
            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[40px] rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 ${
              muted || volume === 0
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-sky-50/90 hover:bg-sky-100/80 border-sky-200 text-[#1A365D]'
            }`}
          >
            <VolumeIcon className="w-4 h-4 text-[#3B9AE1]" />
            <span className="tabular-nums">
              {muted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </TactileButton>

          {/* Volume Slider Popover */}
          {sliderOpen && (
            <div className="absolute right-0 top-12 bg-white border border-sky-200 rounded-2xl p-4 shadow-lg flex flex-col gap-3 w-56 z-50">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1A365D]">
                <span>Volume do som</span>
                <span className="tabular-nums">{muted ? 0 : Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : Math.round(volume * 100)}
                aria-label="Ajustar volume"
                onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
                className="calm-slider w-full cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <TactileButton
                  type="button"
                  onClick={onToggleMute}
                  className="flex-1 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-[#1A365D] border border-sky-200"
                >
                  {muted ? 'Ativar som' : 'Silenciar'}
                </TactileButton>
                <TactileButton
                  type="button"
                  onClick={() => setSliderOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#3B9AE1] text-white text-xs font-semibold"
                >
                  OK
                </TactileButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact single-line Game Title bar when inside a game */}
      {currentMeta && (
        <div className="px-4 py-1.5 bg-[#F5FAFF] border-t border-sky-100/80 text-center">
          <h1 className="font-display font-semibold text-sm text-[#1A365D] truncate">
            {currentMeta.title}
          </h1>
        </div>
      )}
    </header>
  );
};
