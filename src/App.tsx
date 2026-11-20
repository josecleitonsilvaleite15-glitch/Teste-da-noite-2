import React, { useState, useCallback } from 'react';
import { GameId, GAMES } from './types/game';
import { calmAudio } from './utils/audio';
import { TopBar } from './components/TopBar';
import { TactileButton } from './components/TactileButton';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import { OfflineIndicator } from './components/PWAInstallButton';
import { isNativeCapacitor } from './hooks/usePWAInstall';
import {
  PolygonalDandelion,
  IconMemoryCards,
  IconFallingBalls,
  IconSimonLights,
  IconPaintDrops,
} from './components/illustrations/GameIcons';
import { MemoryGame } from './components/games/MemoryGame';
import { FallingBallsGame } from './components/games/FallingBallsGame';
import { SimonGame } from './components/games/SimonGame';
import { SequenceGame } from './components/games/SequenceGame';

const GAME_ICON_MAP: Record<Exclude<GameId, 'menu'>, React.FC<{ className?: string }>> = {
  memory: IconMemoryCards,
  balls: IconFallingBalls,
  simon: IconSimonLights,
  sequence: IconPaintDrops,
};

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>('menu');
  const [volume, setVolume] = useState<number>(0.6);
  const [muted, setMuted] = useState<boolean>(false);
  const [breathingOpen, setBreathingOpen] = useState<boolean>(false);
  const nativeApp = isNativeCapacitor();

  const handleChangeVolume = useCallback(
    (nextVol: number) => {
      const clamped = Math.max(0, Math.min(1, nextVol));
      setVolume(clamped);
      calmAudio.setVolume(clamped);
      if (clamped > 0 && muted) {
        setMuted(false);
        calmAudio.setMuted(false);
      }
      if (clamped === 0) {
        setMuted(true);
        calmAudio.setMuted(true);
      }
    },
    [muted]
  );

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      calmAudio.setMuted(next);
      if (!next && volume === 0) {
        setVolume(0.5);
        calmAudio.setVolume(0.5);
      }
      return next;
    });
  }, [volume]);

  return (
    <div
      className={
        nativeApp
          ? 'min-h-screen w-full bg-[#F5FAFF] flex flex-col'
          : 'min-h-screen w-full bg-[#E8F3FF] sm:py-4 sm:px-4 flex items-center justify-center'
      }
    >
      {/* Mobile Phone Viewport Shell (edge-to-edge on phones/APK, framed on desktop preview) */}
      <div
        className={
          nativeApp
            ? 'relative w-full min-h-screen bg-[#F5FAFF] text-[#1A365D] overflow-hidden flex flex-col'
            : 'relative w-full sm:max-w-[430px] min-h-screen sm:min-h-0 sm:h-[844px] sm:max-h-[94vh] bg-[#F5FAFF] text-[#1A365D] sm:rounded-[34px] sm:border-2 sm:border-sky-200 sm:shadow-xl overflow-hidden flex flex-col'
        }
      >
        <TopBar
          activeGame={activeGame}
          onGoHome={() => setActiveGame('menu')}
          volume={volume}
          muted={muted}
          onChangeVolume={handleChangeVolume}
          onToggleMute={handleToggleMute}
          breathingOpen={breathingOpen}
          onOpenBreathing={() => setBreathingOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {activeGame === 'menu' && (
            <div className="w-full px-4 py-5 flex flex-col items-center">
              {/* Cover Section: Retro Polygonal Dandelion + Title */}
              <section className="w-full bg-white border border-sky-200 rounded-3xl px-4 py-5 shadow-xs flex flex-col items-center text-center gap-3 mb-5">
                <PolygonalDandelion className="w-32 h-28 shrink-0" />

                <div>
                  <h1 className="font-retro text-2xl text-[#1A365D] tracking-tight mb-1">
                    mundo calmo
                  </h1>
                  <p className="text-sm text-[#4A6B8C] max-w-xs leading-snug">
                    Jogos tranquilos para brincar e aprender no seu tempo.
                  </p>
                </div>
              </section>

              {/* 4 Game Entry Buttons (Mobile 1-column thumb-friendly list) */}
              <section aria-label="Escolha um jogo" className="w-full">
                <h2 className="font-display font-semibold text-sm text-[#4A6B8C] text-center mb-3">
                  Escolha um jogo
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {GAMES.map((game) => {
                    const Icon = GAME_ICON_MAP[game.id];
                    return (
                      <TactileButton
                        key={game.id}
                        type="button"
                        onClick={() => setActiveGame(game.id)}
                        className="group w-full bg-white hover:bg-sky-50/70 border-2 border-sky-200 hover:border-[#3B9AE1] rounded-2xl p-3.5 flex items-center gap-4 text-left shadow-xs transition-colors"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-150">
                          <Icon className="w-14 h-14" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-bold text-lg text-[#1A365D] leading-tight mb-0.5">
                            {game.title}
                          </h3>
                          <p className="text-xs text-[#4A6B8C] leading-snug">
                            {game.subtitle}
                          </p>
                        </div>
                      </TactileButton>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeGame === 'memory' && <MemoryGame onSelectGame={setActiveGame} />}
          {activeGame === 'balls' && <FallingBallsGame onSelectGame={setActiveGame} />}
          {activeGame === 'simon' && <SimonGame onSelectGame={setActiveGame} />}
          {activeGame === 'sequence' && <SequenceGame onSelectGame={setActiveGame} />}
        </main>

        <OfflineIndicator />

        <BreathingExerciseModal
          open={breathingOpen}
          onClose={() => setBreathingOpen(false)}
        />
      </div>
    </div>
  );
}
