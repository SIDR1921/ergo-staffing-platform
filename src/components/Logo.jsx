import React from 'react';

/**
 * PRN Float brand logo — "Pulse + Float wave".
 *
 * The mark is an ECG/heartbeat line that lifts on its right edge into a rising
 * wave, ending on a floating node — evoking PRN (clinical pulse) + Float
 * (lift / flexibility). It lives in a rounded glass tile carrying the brand
 * gradient (--color-accent → --color-accent-dark).
 *
 * Props:
 *  - size:    height of the mark tile in px (default 36)
 *  - variant: 'full' (mark + wordmark) | 'mark' (tile only)  — default 'full'
 *  - tone:    'light' (ink wordmark, for light surfaces) | 'dark' (white wordmark)
 *  - gradId:  optional unique gradient id (avoids SVG <defs> collisions when
 *             multiple logos render on one page)
 */
export function LogoMark({ size = 36, gradId = 'prnfloat-grad', style }) {
  const glossId = `${gradId}-gloss`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      role="img"
      aria-label="PRN Float"
    >
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B0A4E5" />
          <stop offset="1" stopColor="#8475C8" />
        </linearGradient>
        <linearGradient id={glossId} x1="24" y1="2" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Glass tile */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradId})`} />
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${glossId})`} />
      <rect x="2.75" y="2.75" width="42.5" height="42.5" rx="12.25" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />

      {/* Pulse → float wave */}
      <path
        d="M7 28 H15 L18 21 L21 34 L25 13 C28 13 29 24 33 24 C37 24 38 15 42 13"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Floating node */}
      <circle cx="42" cy="13" r="2.7" fill="#FFFFFF" />
    </svg>
  );
}

export default function Logo({ size = 36, variant = 'full', tone = 'light', style }) {
  // Stable-ish unique id per mount without Date/Math.random reliance.
  const gradId = React.useId().replace(/:/g, '') + '-grad';
  const inkColor = tone === 'dark' ? '#FFFFFF' : 'var(--color-text)';
  const accentColor = tone === 'dark' ? 'var(--color-accent-light)' : 'var(--color-accent-dark)';

  if (variant === 'mark') {
    return <LogoMark size={size} gradId={gradId} style={style} />;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', ...style }}>
      <LogoMark size={size} gradId={gradId} />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: size * 0.5,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: inkColor }}>PRN</span>
        <span style={{ color: accentColor }}> Float</span>
      </span>
    </div>
  );
}
