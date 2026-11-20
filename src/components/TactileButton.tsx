import React, { useState, useCallback } from 'react';
import { calmAudio } from '../utils/audio';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  silentTap?: boolean;
  rippleColor?: string;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  className = '',
  onPointerDown,
  onClick,
  disabled,
  silentTap = false,
  rippleColor = 'rgba(59, 154, 225, 0.25)',
  ...rest
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const triggerRipple = useCallback(
    (clientX?: number, clientY?: number, rect?: DOMRect) => {
      const id = Date.now() + Math.random();
      let x = 50;
      let y = 50;
      if (rect && typeof clientX === 'number' && typeof clientY === 'number' && clientX !== 0 && clientY !== 0) {
        x = ((clientX - rect.left) / rect.width) * 100;
        y = ((clientY - rect.top) / rect.height) * 100;
      }
      setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 500);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      triggerRipple(e.clientX, e.clientY, rect);
      if (!silentTap) {
        calmAudio.playTap();
      }
    }
    onPointerDown?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && e.detail === 0) {
      // Keyboard activation
      triggerRipple();
      if (!silentTap) {
        calmAudio.playTap();
      }
    }
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`relative overflow-hidden touch-manipulation transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/80 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full animate-touch-ripple"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            width: '90px',
            height: '90px',
            backgroundColor: rippleColor,
          }}
        />
      ))}
    </button>
  );
};
