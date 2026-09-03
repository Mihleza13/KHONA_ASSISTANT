import React from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface KhonaLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'badge' | 'app-icon';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

/**
 * KHONA Official Brand Identity
 * 
 * Abstract Geometric "K" + Connected Communication Form
 * - Black Foundation + Cyan Signal Accent
 */
export const KhonaLogo: React.FC<KhonaLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const themeContext = useTheme();
  const isDark = theme === 'auto' ? themeContext.isDark : theme === 'dark';

  // Dimension scaling
  const iconSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textHeadingMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const taglineSizeMap = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  // Pure Geometric Abstract Emblem
  const LogoEmblem = (
    <div
      className={`relative ${iconSizeMap[size]} rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
        variant === 'app-icon'
          ? 'p-2.5 bg-black text-cyan-400 shadow-md border border-cyan-500/30'
          : isDark
          ? 'bg-black text-cyan-400 border border-zinc-800 shadow-sm'
          : 'bg-zinc-950 text-cyan-400 border border-zinc-300 shadow-sm'
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="khona-cyan-grad" x1="8" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* 1. Left Presence Anchor (Vertical Pillar) */}
        <rect
          x="8.5"
          y="8"
          width="6.5"
          height="32"
          rx="3.25"
          fill="url(#khona-cyan-grad)"
        />

        {/* 2. Upper Dynamic Converging Pathway */}
        <path
          d="M19.5 21.8L32.2 9.1C33.4 7.9 35.5 8.8 35.5 10.5V16C35.5 17.1 34.9 18.2 34 18.8L25.2 24.6"
          fill="url(#khona-cyan-grad)"
        />

        {/* 3. Lower Dynamic Converging Pathway */}
        <path
          d="M25.2 23.4L34 29.2C34.9 29.8 35.5 30.9 35.5 32V37.5C35.5 39.2 33.4 40.1 32.2 38.9L19.5 26.2"
          fill="url(#khona-cyan-grad)"
        />

        {/* 4. Center Connection Negative Space Portal */}
        <circle
          cx="20.5"
          cy="24"
          r="1.75"
          fill={isDark ? '#090D14' : '#FFFFFF'}
        />
      </svg>
    </div>
  );

  if (variant === 'icon' || variant === 'app-icon') {
    return (
      <div className={`inline-flex items-center ${className}`} title="KHONA">
        {LogoEmblem}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {LogoEmblem}
        <span
          className={`font-black tracking-[-0.03em] font-sans ${textHeadingMap[size]} ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          KHONA
        </span>
      </div>
    );
  }

  // Full Brand Identity
  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      {LogoEmblem}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-[-0.03em] font-sans leading-none ${textHeadingMap[size]} ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          KHONA
        </span>
        {showTagline && (
          <span
            className={`font-semibold tracking-tight mt-1 ${taglineSizeMap[size]} ${
              isDark ? 'text-cyan-400' : 'text-cyan-600'
            }`}
          >
            SIGN. TRANSLATE. UNDERSTAND.
          </span>
        )}
      </div>
    </div>
  );
};
