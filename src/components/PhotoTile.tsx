import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PhotoTileProps {
  icon: LucideIcon;
  tone?: 'teal' | 'slate' | 'amber' | 'rose' | 'indigo';
  className?: string;
  children?: React.ReactNode;
}

// A documentary-style duotone "photo" placeholder. Real event/community
// photography should replace these tiles when available — this keeps the
// visual language (a real image carrying the card) without fabricating or
// sourcing photography we don't have rights to ship.
const TONES: Record<string, string> = {
  teal: 'from-[#0b3b3f] via-[#0e2a30] to-[#050b0d]',
  slate: 'from-[#1f2937] via-[#151c26] to-[#05070a]',
  amber: 'from-[#3f2d0b] via-[#2a1f0e] to-[#0d0905]',
  rose: 'from-[#3f0b1f] via-[#2a0e18] to-[#0d0507]',
  indigo: 'from-[#1a1140] via-[#140e2a] to-[#05040d]',
};

export const PhotoTile: React.FC<PhotoTileProps> = ({
  icon: Icon,
  tone = 'slate',
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${TONES[tone]} ${className}`}
    >
      {/* Grain / texture */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
        }}
      />
      {/* Large soft silhouette icon for depth */}
      <Icon className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" strokeWidth={1} />
      {children}
    </div>
  );
};

export default PhotoTile;
