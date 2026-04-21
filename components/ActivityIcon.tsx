'use client';

import { ActivityType } from '@/lib/types';

interface ActivityIconProps {
  activity: ActivityType;
  size?: 'sm' | 'md';
  isSelected?: boolean;
}

const activityColors: Record<ActivityType, { gradient: string; dark: string }> = {
  Lari: { gradient: 'from-orange-600 to-red-600', dark: '#991b1b' },
  Gym: { gradient: 'from-purple-600 to-pink-600', dark: '#6b21a8' },
  Pilates: { gradient: 'from-green-600 to-emerald-600', dark: '#15803d' },
  Tennis: { gradient: 'from-yellow-600 to-orange-600', dark: '#92400e' },
  Berenang: { gradient: 'from-blue-600 to-cyan-600', dark: '#0c4a6e' },
};

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
};

export default function ActivityIcon({ activity, size = 'md', isSelected = false }: ActivityIconProps) {
  const color = activityColors[activity];
  
  // Use white color when selected, gradients when not
  const fillColor = isSelected ? '#ffffff' : `url(#${activity.toLowerCase()}-grad)`;
  const strokeColor = isSelected ? '#ffffff' : `url(#${activity.toLowerCase()}-grad)`;

  switch (activity) {
    case 'Lari':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]}`}>
          <defs>
            <linearGradient id="lari-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ea580c', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="55" cy="22" r="7" fill={fillColor} />
          {/* Body - leaning forward */}
          <line x1="55" y1="29" x2="52" y2="50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
          {/* Left arm (back) */}
          <line x1="52" y1="32" x2="38" y2="45" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Right arm (forward) */}
          <line x1="52" y1="32" x2="68" y2="28" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Left leg (forward, bent) */}
          <path d="M 52 50 Q 48 60 45 75" stroke={strokeColor} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Right leg (back, extended) */}
          <path d="M 52 50 Q 60 55 68 62" stroke={strokeColor} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Motion lines */}
          <path d="M 70 48 L 78 48" stroke={strokeColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
          <path d="M 72 58 L 80 58" stroke={strokeColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
        </svg>
      );

    case 'Gym':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]}`}>
          <defs>
            <linearGradient id="gym-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="50" cy="20" r="6" fill={fillColor} />
          {/* Body */}
          <rect x="45" y="28" width="10" height="16" rx="2" fill={fillColor} />
          {/* Left plate */}
          <ellipse cx="22" cy="32" rx="6" ry="9" fill={fillColor} />
          {/* Left bar */}
          <rect x="28" y="42" width="16" height="4" rx="2" fill={fillColor} />
          {/* Right plate */}
          <ellipse cx="78" cy="32" rx="6" ry="9" fill={fillColor} />
          {/* Right bar */}
          <rect x="56" y="42" width="16" height="4" rx="2" fill={fillColor} />
          {/* Center bar - barbell shaft */}
          <rect x="38" y="43" width="24" height="3" rx="1" fill={fillColor} />
          {/* Left arm raised */}
          <line x1="45" y1="30" x2="28" y2="20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Right arm raised */}
          <line x1="55" y1="30" x2="72" y2="20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Left leg */}
          <line x1="47" y1="44" x2="42" y2="70" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          {/* Right leg */}
          <line x1="53" y1="44" x2="58" y2="70" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'Pilates':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]}`}>
          <defs>
            <linearGradient id="pilates-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="50" cy="24" r="7" fill={fillColor} />
          {/* Sitting pose - torso */}
          <ellipse cx="50" cy="48" rx="10" ry="14" fill={fillColor} />
          {/* Left leg crossed */}
          <path d="M 42 58 Q 32 62 28 75" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right leg crossed */}
          <path d="M 58 58 Q 68 62 72 75" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left arm meditation pose */}
          <path d="M 42 40 Q 30 35 28 50" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right arm meditation pose */}
          <path d="M 58 40 Q 70 35 72 50" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Center line - spine alignment */}
          <line x1="50" y1="24" x2="50" y2="62" stroke={strokeColor} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        </svg>
      );

    case 'Tennis':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]}`}>
          <defs>
            <linearGradient id="tennis-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ca8a04', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ea580c', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="32" cy="20" r="6" fill={fillColor} />
          {/* Body - athletic stance */}
          <rect x="27" y="28" width="10" height="14" rx="2" fill={fillColor} />
          {/* Left leg */}
          <line x1="30" y1="42" x2="25" y2="65" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Right leg */}
          <line x1="34" y1="42" x2="40" y2="65" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Racket arm extended */}
          <line x1="37" y1="30" x2="70" y2="15" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Other arm */}
          <line x1="27" y1="32" x2="15" y2="45" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          {/* Racket frame */}
          <circle cx="75" cy="12" r="10" fill="none" stroke={fillColor} strokeWidth="3" />
          {/* Racket strings pattern */}
          <line x1="70" y1="12" x2="80" y2="12" stroke={fillColor} strokeWidth="1" opacity="0.5" />
          <line x1="70" y1="17" x2="80" y2="17" stroke={fillColor} strokeWidth="1" opacity="0.5" />
          {/* Ball */}
          <circle cx="58" cy="32" r="3.5" fill={fillColor} />
          <path d="M 55 32 Q 58 29" stroke={fillColor} strokeWidth="1" fill="none" />
        </svg>
      );

    case 'Berenang':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]}`}>
          <defs>
            <linearGradient id="berenang-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Head - turned to side */}
          <circle cx="45" cy="32" r="7" fill={fillColor} />
          {/* Body - horizontal swimming */}
          <ellipse cx="55" cy="50" rx="14" ry="8" fill={fillColor} />
          {/* Left arm extending forward */}
          <path d="M 45 50 Q 25 42 15 45" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right arm pulling back */}
          <path d="M 65 50 Q 80 48 85 55" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left leg kick */}
          <path d="M 55 58 Q 45 70 42 80" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right leg kick */}
          <path d="M 55 58 Q 65 70 68 80" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Water splash - left */}
          <path d="M 15 48 Q 12 42 18 40" stroke={strokeColor} strokeWidth="2" fill="none" opacity="0.7" />
          {/* Water splash - right */}
          <path d="M 88 58 Q 92 52 86 50" stroke={strokeColor} strokeWidth="2" fill="none" opacity="0.7" />
          {/* Water surface line */}
          <path d="M 20 35 Q 35 30 50 32 Q 65 34 80 32" stroke={strokeColor} strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      );

    default:
      return null;
  }
}
