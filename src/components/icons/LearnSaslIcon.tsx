import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * LearnSaslIcon: A dedicated icon representing SASL learning.
 * Combines a signing hand gesture rising harmoniously above an open book base.
 * Follows the stroke weight, rounded caps, and proportions of the KHONA icon set.
 */
export const LearnSaslIcon: React.FC<IconProps> = ({ 
  className = 'w-6 h-6', 
  size,
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Open Book Base */}
      <path d="M2.5 19c2.5-1.4 5.5-1.4 8.5 0v-4.2c-3-1.4-6-1.4-8.5 0z" />
      <path d="M13 14.8c2.5-1.4 5.5-1.4 8.5 0V19c-3-1.4-6-1.4-8.5 0z" />
      <line x1="12" y1="14.8" x2="12" y2="19" />

      {/* Signing Hand */}
      {/* Index Finger pointing upward */}
      <path d="M10.8 4a1.2 1.2 0 0 1 2.4 0v5.5" />
      {/* Middle Finger standing tall */}
      <path d="M13.2 2.5a1.2 1.2 0 0 1 2.4 0v7" />
      {/* Ring / Pinky folded gracefully */}
      <path d="M15.6 5a1.2 1.2 0 0 1 2.4 0v4.2c0 2-1.6 3.8-3.6 3.8h-2.2c-1.8 0-3.2-1.2-3.2-2.8v-1.2" />
      {/* Expressive Thumb gesture */}
      <path d="M7.8 9.2c.2-.9 1-1.6 2-1.6.8 0 1.2.4 1.2 1.2" />
    </svg>
  );
};
