import React from 'react';
import { CharacterConfig } from '../types/game';

interface AvatarGraphicProps {
  config: CharacterConfig;
  size?: number;
  className?: string;
}

export const AvatarGraphic: React.FC<AvatarGraphicProps> = ({
  config,
  size = 140,
  className = '',
}) => {
  const { skinTone, hairStyle, hairColor, shirtColor, accessory } = config;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background glow circle */}
        <circle cx="50" cy="50" r="46" fill="#1e293b" opacity="0.6" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

        {/* Torso & Shirt */}
        <path
          d="M 24 88 C 24 70, 36 65, 50 65 C 64 65, 76 70, 76 88 Z"
          fill={shirtColor}
        />
        {/* Collar line */}
        <path
          d="M 44 65 L 50 72 L 56 65"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />

        {/* Neck */}
        <rect x="44" y="55" width="12" height="12" rx="3" fill={skinTone} />

        {/* Hair Back (for ponytail or bob) */}
        {hairStyle === 'ponytail' && (
          <path d="M 68 34 C 78 30, 85 45, 78 55 C 72 58, 66 48, 68 34 Z" fill={hairColor} />
        )}
        {hairStyle === 'bob' && (
          <rect x="25" y="32" width="50" height="30" rx="8" fill={hairColor} />
        )}
        {hairStyle === 'curly' && (
          <circle cx="50" cy="38" r="26" fill={hairColor} />
        )}

        {/* Head / Face */}
        <rect x="30" y="24" width="40" height="36" rx="12" fill={skinTone} />

        {/* Eyes */}
        <circle cx="41" cy="40" r="3" fill="#0f172a" />
        <circle cx="59" cy="40" r="3" fill="#0f172a" />
        {/* Eye gleams */}
        <circle cx="42" cy="39" r="1" fill="#ffffff" />
        <circle cx="60" cy="39" r="1" fill="#ffffff" />

        {/* Cheerful Smile */}
        <path
          d="M 44 49 Q 50 54 56 49"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Rosy cheeks */}
        <circle cx="36" cy="45" r="2.5" fill="#f43f5e" opacity="0.4" />
        <circle cx="64" cy="45" r="2.5" fill="#f43f5e" opacity="0.4" />

        {/* Hair Styles Front */}
        {hairStyle === 'short' && (
          <path
            d="M 28 32 C 28 20, 72 20, 72 32 C 68 25, 55 24, 50 27 C 45 24, 32 25, 28 32 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'spiky' && (
          <path
            d="M 28 32 L 34 16 L 42 24 L 50 14 L 58 24 L 66 16 L 72 32 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'ponytail' && (
          <path
            d="M 28 32 C 28 20, 72 20, 72 32 C 65 24, 55 23, 50 25 C 45 23, 35 24, 28 32 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'curly' && (
          <path
            d="M 28 30 C 32 18, 68 18, 72 30 C 65 24, 58 24, 50 26 C 42 24, 35 24, 28 30 Z"
            fill={hairColor}
          />
        )}
        {hairStyle === 'bob' && (
          <path
            d="M 27 34 C 27 20, 73 20, 73 34 C 71 27, 60 25, 50 27 C 40 25, 29 27, 27 34 Z"
            fill={hairColor}
          />
        )}

        {/* Accessories */}
        {accessory === 'glasses' && (
          <g stroke="#d97706" strokeWidth="2" fill="none">
            <rect x="34" y="36" width="13" height="10" rx="3" fill="rgba(147, 197, 253, 0.4)" />
            <rect x="53" y="36" width="13" height="10" rx="3" fill="rgba(147, 197, 253, 0.4)" />
            <line x1="47" y1="41" x2="53" y2="41" />
          </g>
        )}
        {accessory === 'sunglasses' && (
          <g stroke="#0f172a" strokeWidth="2" fill="#020617">
            <rect x="34" y="36" width="14" height="9" rx="2" />
            <rect x="52" y="36" width="14" height="9" rx="2" />
            <line x1="48" y1="40" x2="52" y2="40" />
          </g>
        )}
        {accessory === 'headphones' && (
          <g>
            <path d="M 25 40 A 25 25 0 0 1 75 40" fill="none" stroke="#ef4444" strokeWidth="4" />
            <rect x="23" y="36" width="6" height="12" rx="3" fill="#ef4444" />
            <rect x="71" y="36" width="6" height="12" rx="3" fill="#ef4444" />
          </g>
        )}
        {accessory === 'cap' && (
          <g>
            <path d="M 28 28 C 28 16, 72 16, 72 28 Z" fill="#3b82f6" />
            <path d="M 32 28 L 74 28 L 78 33 L 36 33 Z" fill="#2563eb" />
          </g>
        )}
      </svg>
    </div>
  );
};
