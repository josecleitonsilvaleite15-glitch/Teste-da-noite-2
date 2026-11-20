import React, { useState } from 'react';
import { calmAudio } from '../../utils/audio';
import { TactileButton } from '../TactileButton';

/**
 * Retro low-poly video game style dandelion for the main cover ("mundo calmo").
 * Interactive: gentle touch triggers floating polygonal seeds & soft wind chime.
 */
export const PolygonalDandelion: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [burstSeeds, setBurstSeeds] = useState<Array<{ id: number; dx: number; dy: number; rot: number }>>([]);

  const handlePoke = () => {
    calmAudio.playDandelionChime();
    const newSeeds = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      dx: 25 + Math.random() * 55,
      dy: -(20 + Math.random() * 45),
      rot: -15 + Math.random() * 45,
    }));
    setBurstSeeds((prev) => [...prev.slice(-8), ...newSeeds]);
    setTimeout(() => {
      setBurstSeeds((prev) => prev.filter((s) => !newSeeds.some((ns) => ns.id === s.id)));
    }, 1800);
  };

  return (
    <TactileButton
      type="button"
      silentTap
      onClick={handlePoke}
      aria-label="Dente-de-leão poligonal interativo"
      className={`group relative inline-flex items-center justify-center rounded-3xl p-2 bg-transparent ${className}`}
    >
      <svg
        viewBox="0 0 240 220"
        className="w-full h-full drop-shadow-[0_6px_0_rgba(147,197,253,0.45)]"
        shapeRendering="crispEdges"
      >
        {/* Retro sky-grid backdrop diamond */}
        <polygon points="120,10 218,108 120,206 22,108" fill="#EAF5FF" stroke="#BFDBFE" strokeWidth="2" />
        <polygon points="120,24 202,108 120,192 38,108" fill="#F5FAFF" />

        {/* Polygonal Stem - faceted retro game triangles */}
        <polygon points="116,112 122,112 120,204 112,204" fill="#5BA4CF" />
        <polygon points="122,112 126,112 125,204 120,204" fill="#3B82B6" />

        {/* Polygonal Left Leaf */}
        <polygon points="115,176 76,154 88,180" fill="#7CC4EC" />
        <polygon points="115,176 88,180 96,192" fill="#4B97C9" />
        {/* Polygonal Right Leaf */}
        <polygon points="124,182 162,162 150,186" fill="#7CC4EC" />
        <polygon points="124,182 150,186 142,196" fill="#4B97C9" />

        {/* Outer Low-Poly Dandelion Puff Facets (Retro 3D crystal/pixel facets) */}
        <polygon points="120,30 148,38 134,58 106,58 92,38" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
        <polygon points="148,38 172,60 154,82 134,58" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1.5" />
        <polygon points="92,38 106,58 86,82 68,60" fill="#F0F9FF" stroke="#93C5FD" strokeWidth="1.5" />
        <polygon points="172,60 176,94 154,104 154,82" fill="#BAE6FD" stroke="#93C5FD" strokeWidth="1.5" />
        <polygon points="68,60 86,82 86,104 64,94" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1.5" />
        <polygon points="176,94 162,122 140,118 154,104" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />
        <polygon points="64,94 86,104 100,118 78,122" fill="#BAE6FD" stroke="#60A5FA" strokeWidth="1.5" />
        <polygon points="162,122 134,136 120,124 140,118" fill="#BAE6FD" stroke="#60A5FA" strokeWidth="1.5" />
        <polygon points="78,122 100,118 120,124 106,136" fill="#E0F2FE" stroke="#60A5FA" strokeWidth="1.5" />

        {/* Inner Faceted Ring */}
        <polygon points="106,58 134,58 154,82 136,86 104,86 86,82" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
        <polygon points="86,82 104,86 100,118 86,104" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.5" />
        <polygon points="154,82 154,104 140,118 136,86" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1.5" />
        <polygon points="104,86 136,86 140,118 120,124 100,118" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />

        {/* Center Retro Polygonal Core */}
        <polygon points="120,72 134,82 128,98 112,98 106,82" fill="#FDE68A" stroke="#60A5FA" strokeWidth="1.5" />
        <polygon points="120,72 134,82 120,86" fill="#FEF3C7" />
        <polygon points="106,82 120,86 112,98" fill="#FCD34D" />

        {/* Retro Pixel-Faceted Seed Rays */}
        <line x1="120" y1="30" x2="120" y2="18" stroke="#60A5FA" strokeWidth="2" />
        <polygon points="116,18 124,18 120,12" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.2" />

        <line x1="172" y1="60" x2="184" y2="52" stroke="#60A5FA" strokeWidth="2" />
        <polygon points="182,48 190,50 186,57" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.2" />

        <line x1="68" y1="60" x2="56" y2="52" stroke="#60A5FA" strokeWidth="2" />
        <polygon points="58,48 50,50 54,57" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.2" />

        {/* Floating Retro Polygonal Seeds (Drifting) */}
        <g className="animate-seed-drift">
          <line x1="192" y1="42" x2="200" y2="34" stroke="#60A5FA" strokeWidth="1.8" />
          <polygon points="196,30 205,30 201,37" fill="#FFFFFF" stroke="#3B9AE1" strokeWidth="1.4" />
          <polygon points="190,42 194,40 193,45" fill="#FDE68A" />
        </g>

        <g className="animate-seed-drift" style={{ animationDelay: '1.8s' }}>
          <line x1="204" y1="74" x2="214" y2="68" stroke="#60A5FA" strokeWidth="1.8" />
          <polygon points="211,63 219,65 215,72" fill="#FFFFFF" stroke="#3B9AE1" strokeWidth="1.4" />
          <polygon points="201,75 206,73 204,78" fill="#FDE68A" />
        </g>
      </svg>

      {/* Extra floating seeds released on gentle touch */}
      {burstSeeds.map((seed) => (
        <svg
          key={seed.id}
          viewBox="0 0 24 24"
          className="pointer-events-none absolute w-6 h-6 transition-all duration-1000 ease-out opacity-85"
          style={{
            left: '55%',
            top: '32%',
            transform: `translate(${seed.dx}px, ${seed.dy}px) rotate(${seed.rot}deg)`,
          }}
        >
          <polygon points="12,2 19,8 5,8" fill="#FFFFFF" stroke="#3B9AE1" strokeWidth="1.8" />
          <line x1="12" y1="8" x2="12" y2="19" stroke="#60A5FA" strokeWidth="1.8" />
          <polygon points="10,19 14,19 12,22" fill="#FCD34D" />
        </svg>
      ))}
    </TactileButton>
  );
};

/**
 * Hand-drawn dandelion back cover for Memory Game cards.
 */
export const HandDrawnDandelionCardBack: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 150" className={className} fill="none">
    {/* Subtle hand-drawn double border */}
    <rect
      x="7"
      y="7"
      width="106"
      height="136"
      rx="14"
      stroke="#93C5FD"
      strokeWidth="2"
      strokeDasharray="6 4"
    />
    {/* Curving hand-drawn stem */}
    <path
      d="M59 132 C57 110, 61 95, 60 72"
      stroke="#4B89B8"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    {/* Hand-drawn leaves */}
    <path
      d="M58 122 C46 116, 40 122, 48 128 C53 130, 57 125, 58 122 Z"
      fill="#DBEAFE"
      stroke="#4B89B8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M60 116 C72 110, 78 117, 70 123 C65 125, 61 120, 60 116 Z"
      fill="#DBEAFE"
      stroke="#4B89B8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center receptacle */}
    <circle cx="60" cy="68" r="7" fill="#E0F2FE" stroke="#3B82B6" strokeWidth="2.2" />
    {/* Hand-drawn radial dandelion filaments & tufts */}
    {[
      [60, 68, 60, 32],
      [60, 68, 76, 36],
      [60, 68, 88, 48],
      [60, 68, 92, 66],
      [60, 68, 86, 82],
      [60, 68, 74, 92],
      [60, 68, 46, 92],
      [60, 68, 34, 82],
      [60, 68, 28, 66],
      [60, 68, 32, 48],
      [60, 68, 44, 36],
    ].map(([x1, y1, x2, y2], i) => {
      const mx = (x1 + x2) / 2 + (i % 2 === 0 ? 1.5 : -1.5);
      const my = (y1 + y2) / 2;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const p1x = x2 + Math.cos(angle - 0.6) * 5;
      const p1y = y2 + Math.sin(angle - 0.6) * 5;
      const p2x = x2 + Math.cos(angle + 0.6) * 5;
      const p2y = y2 + Math.sin(angle + 0.6) * 5;
      return (
        <g key={i}>
          <path
            d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
            stroke="#60A5FA"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={`M${p1x} ${p1y} Q${x2} ${y2} ${p2x} ${p2y}`}
            stroke="#3B82B6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      );
    })}
    {/* One tiny floating hand-drawn seed */}
    <path d="M96 34 L103 26" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M99 24 Q103 26 106 29" stroke="#3B82B6" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * Game 1 Button Icon: Two drawn overlapping cards
 */
export const IconMemoryCards: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 96 96" className={className} fill="none">
    {/* Back card tilted left */}
    <g transform="rotate(-10 38 50)">
      <rect x="16" y="20" width="42" height="58" rx="8" fill="#E0F2FE" stroke="#2563EB" strokeWidth="2.8" />
      <path d="M26 32 H48 M26 42 H44 M26 66 H48" stroke="#93C5FD" strokeWidth="2.4" strokeLinecap="round" />
    </g>
    {/* Front card tilted right */}
    <g transform="rotate(8 58 48)">
      <rect x="38" y="18" width="42" height="58" rx="8" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="2.8" />
      {/* Small hand-drawn dandelion/star inside front card */}
      <circle cx="59" cy="45" r="9" fill="#DBEAFE" stroke="#3B9AE1" strokeWidth="2.2" />
      <path d="M59 31 V36 M59 54 V59 M45 45 H50 M68 45 H73" stroke="#3B9AE1" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Game 2 Button Icon: Two drawn falling colored balls
 */
export const IconFallingBalls: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 96 96" className={className} fill="none">
    {/* Motion lines for first ball */}
    <path d="M31 14 V24 M25 18 V25 M37 18 V25" stroke="#93C5FD" strokeWidth="2.4" strokeLinecap="round" />
    {/* Ball 1 (Yellow) */}
    <circle cx="31" cy="42" r="14" fill="#FDE047" stroke="#1E3A5F" strokeWidth="2.8" />
    <path d="M25 36 Q28 33 32 34" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />

    {/* Motion lines for second ball */}
    <path d="M64 30 V42 M58 34 V43 M70 34 V43" stroke="#93C5FD" strokeWidth="2.4" strokeLinecap="round" />
    {/* Ball 2 (Sky Blue) */}
    <circle cx="64" cy="64" r="15" fill="#60A5FA" stroke="#1E3A5F" strokeWidth="2.8" />
    <path d="M57 58 Q61 54 66 56" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/**
 * Game 3 Button Icon: Two drawn lights, one lit and one unlit
 */
export const IconSimonLights: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 96 96" className={className} fill="none">
    {/* Glowing rays around left lit light */}
    <path
      d="M30 16 V22 M14 38 H20 M19 23 L23 27 M41 23 L37 27"
      stroke="#F59E0B"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    {/* Left Light - LIT */}
    <circle cx="30" cy="44" r="15" fill="#FDE047" stroke="#1E3A5F" strokeWidth="2.8" />
    <path d="M25 39 Q29 34 34 37" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
    <rect x="23" y="59" width="14" height="8" rx="3" fill="#CBD5E1" stroke="#1E3A5F" strokeWidth="2.4" />

    {/* Right Light - UNLIT */}
    <circle cx="67" cy="48" r="15" fill="#E2E8F0" stroke="#475569" strokeWidth="2.8" />
    <path d="M62 45 C64 41, 70 41, 72 45" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="60" y="63" width="14" height="8" rx="3" fill="#CBD5E1" stroke="#475569" strokeWidth="2.4" />
  </svg>
);

/**
 * Game 4 Button Icon: Two drawn paint drops, one blue and one red
 */
export const IconPaintDrops: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 96 96" className={className} fill="none">
    {/* Blue Paint Drop */}
    <path
      d="M33 20 C33 20, 48 40, 48 53 C48 61.5, 41.3 68, 33 68 C24.7 68, 18 61.5, 18 53 C18 40, 33 20, 33 20 Z"
      fill="#3B9AE1"
      stroke="#1E3A5F"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M26 51 C26 56, 28 60, 32 61" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />

    {/* Red Paint Drop */}
    <path
      d="M64 28 C64 28, 79 48, 79 61 C79 69.5, 72.3 76, 64 76 C55.7 76, 49 69.5, 49 61 C49 48, 64 28, 64 28 Z"
      fill="#EF5350"
      stroke="#1E3A5F"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M57 59 C57 64, 59 68, 63 69" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/**
 * Calm meditating person icon for the persistent Lo-Fi study beats button
 */
export const IconMeditating: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = '',
}) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
    {/* Gentle Lo-Fi aura / soft note waves when active */}
    {active && (
      <>
        <path d="M7 10 C7 7, 10 5, 12 5" stroke="#3B9AE1" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 10 C29 7, 26 5, 24 5" stroke="#3B9AE1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="4" r="1.5" fill="#3B9AE1" />
      </>
    )}
    {/* Head */}
    <circle
      cx="18"
      cy="10.5"
      r="3.8"
      fill={active ? '#BAE6FD' : '#E0F2FE'}
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Torso & relaxed meditating arms */}
    <path
      d="M12 23 C12 18, 14.5 16, 18 16 C21.5 16, 24 18, 24 23"
      fill={active ? '#BAE6FD' : '#E0F2FE'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 18.5 C10 20.5, 9.5 23.5, 13.5 25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M23 18.5 C26 20.5, 26.5 23.5, 22.5 25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Crossed lotus legs */}
    <path
      d="M9 27.5 C12 24.5, 16 25.5, 18 26.8 C20 25.5, 24 24.5, 27 27.5 C27 29.2, 23 30, 18 30 C13 30, 9 29.2, 9 27.5 Z"
      fill={active ? '#BAE6FD' : '#E0F2FE'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Gentle breathing / calming wind icon
 */
export const IconBreathing: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="13" fill="#E0F2FE" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="7.5" fill="#BAE6FD" stroke="#3B9AE1" strokeWidth="1.8" strokeDasharray="3 2" />
    <circle cx="18" cy="18" r="3" fill="#3B9AE1" />
  </svg>
);
