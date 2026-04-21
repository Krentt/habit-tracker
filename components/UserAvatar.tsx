'use client';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

export default function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  if (name === 'Agus') {
    return (
        <svg
  viewBox="0 0 100 100"
  className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600`}
>
  {/* Body */}
  <rect x="30" y="50" width="40" height="30" rx="10" fill="#1f2937" />

  {/* Neck */}
  <rect x="45" y="42" width="10" height="10" fill="#fcd7b6" />

  {/* Head */}
  <circle cx="50" cy="30" r="15" fill="#fcd7b6" />

  {/* Hair */}
  <path
    d="M35 25 Q50 10 65 25 L65 20 Q50 5 35 20 Z"
    fill="#111827"
  />

  {/* Eyes */}
  <circle cx="45" cy="30" r="2" fill="#111827" />
  <circle cx="55" cy="30" r="2" fill="#111827" />

  {/* Mustache */}
  <path
    d="M42 36 Q46 39 50 36 Q54 39 58 36"
    stroke="#111827"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
  />

  {/* Smile */}
  <path
    d="M45 40 Q50 43 55 40"
    stroke="#111827"
    strokeWidth="2"
    fill="none"
  />
</svg>
    );
  }

  if (name === 'Gendut') {
    return (
<svg
  viewBox="0 0 100 100"
  className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-pink-400 to-rose-600`}
>
  {/* Body (lebih gede biar keliatan gendut 😄) */}
  <ellipse cx="50" cy="62" rx="26" ry="28" fill="#374151" />

  {/* Neck */}
  <rect x="45" y="40" width="10" height="10" fill="#fcd7b6" />

  {/* Head */}
  <circle cx="50" cy="28" r="15" fill="#fcd7b6" />

  {/* Hair */}
  <path
    d="M34 24 Q50 8 66 24 L66 18 Q50 2 34 18 Z"
    fill="#111827"
  />

  {/* Ponytail */}
  <circle cx="72" cy="28" r="7" fill="#111827" />

  {/* Eyes */}
  <circle cx="46" cy="28" r="2" fill="#111827" />
  <circle cx="54" cy="28" r="2" fill="#111827" />

  {/* Blush kiri */}
  <circle cx="40" cy="32" r="3" fill="#f472b6" opacity="0.6" />

  {/* Blush kanan */}
  <circle cx="60" cy="32" r="3" fill="#f472b6" opacity="0.6" />

  {/* Smile */}
  <path
    d="M46 36 Q50 39 54 36"
    stroke="#111827"
    strokeWidth="2"
    fill="none"
  />
</svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-gray-400 to-gray-600`}
    >
      <circle cx="50" cy="35" r="15" fill="#fff" />
      <path d="M 20 85 Q 20 65 50 60 Q 80 65 80 85" fill="#fff" />
    </svg>
  );
}
