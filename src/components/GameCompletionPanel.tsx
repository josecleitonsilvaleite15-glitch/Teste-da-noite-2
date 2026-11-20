import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { GameId, GAMES } from '../types/game';
import { TactileButton } from './TactileButton';
import {
  IconMemoryCards,
  IconFallingBalls,
  IconSimonLights,
  IconPaintDrops,
} from './illustrations/GameIcons';

interface GameCompletionPanelProps {
  currentGame: Exclude<GameId, 'menu'>;
  title: string;
  subtitle: string;
  onReplay: () => void;
  onSelectGame: (game: GameId) => void;
}

const GAME_ICONS: Record<Exclude<GameId, 'menu'>, React.FC<{ className?: string }>> = {
  memory: IconMemoryCards,
  balls: IconFallingBalls,
  simon: IconSimonLights,
  sequence: IconPaintDrops,
};

export const GameCompletionPanel: React.FC<GameCompletionPanelProps> = ({
  currentGame,
  title,
  subtitle,
  onReplay,
  onSelectGame,
}) => {
  const otherGames = GAMES.filter((g) => g.id !== currentGame);

  return (
    <div className="w-full bg-white border border-sky-200 rounded-3xl p-5 shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 mb-3 text-2xl" aria-hidden="true">
        🌟
      </div>

      <h2 className="font-display font-bold text-xl text-[#1A365D] mb-1.5">
        {title}
      </h2>
      <p className="text-sm text-[#4A6B8C] mb-5">
        {subtitle}
      </p>

      {/* Primary Action: Repeat */}
      <div className="flex flex-col gap-2.5 mb-6">
        <TactileButton
          type="button"
          onClick={onReplay}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-2xl bg-[#3B9AE1] hover:bg-[#2F89CE] text-white font-display font-semibold text-base shadow-xs"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Repetir jogo</span>
        </TactileButton>

        <TactileButton
          type="button"
          onClick={() => onSelectGame('menu')}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#1A365D] font-semibold text-sm border border-sky-200"
        >
          <Home className="w-4 h-4 text-[#3B9AE1]" />
          <span>Tela inicial</span>
        </TactileButton>
      </div>

      {/* Switch to another game */}
      <div className="border-t border-sky-100 pt-4">
        <p className="text-xs font-semibold text-[#4A6B8C] mb-3">
          Ou escolha outro jogo:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {otherGames.map((game) => {
            const Icon = GAME_ICONS[game.id];
            return (
              <TactileButton
                key={game.id}
                type="button"
                onClick={() => onSelectGame(game.id)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/90 text-[#1A365D] text-left"
              >
                <Icon className="w-10 h-10 shrink-0" />
                <span className="font-display font-semibold text-sm">
                  {game.title}
                </span>
              </TactileButton>
            );
          })}
        </div>
      </div>
    </div>
  );
};
