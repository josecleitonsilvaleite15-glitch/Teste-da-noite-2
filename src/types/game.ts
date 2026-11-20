export type GameId = 'menu' | 'memory' | 'balls' | 'simon' | 'sequence';

export interface GameMeta {
  id: Exclude<GameId, 'menu'>;
  title: string;
  subtitle: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'memory',
    title: 'Encontre o Par',
    subtitle: 'Vire as cartas e encontre os pares iguais',
  },
  {
    id: 'balls',
    title: 'Bolinhas das Cores',
    subtitle: 'Toque apenas nas bolinhas da cor certa',
  },
  {
    id: 'simon',
    title: 'Simon Dice',
    subtitle: 'Veja a sequência de luzes e repita na ordem',
  },
  {
    id: 'sequence',
    title: 'Complete a Sequência',
    subtitle: 'Descubra qual desenho vem depois',
  },
];
