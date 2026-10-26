/**
 * A marigold-like bloom drawn from eight petals. Used as the EstateVal mark
 * and as the botanical edge pieces in the hero.
 */
export default function Bloom({ className = '', petal = 'currentColor', core = 'currentColor' }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {angles.map((angle, index) => (
        <path
          key={angle}
          d="M50 48C40.5 38 38.5 22 50 11.5C61.5 22 59.5 38 50 48Z"
          transform={`rotate(${angle} 50 50)`}
          fill={petal}
          fillOpacity={index % 2 === 0 ? 0.16 : 0.3}
          stroke={petal}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ))}
      <circle cx="50" cy="50" r="6.5" fill={core} />
      <circle cx="50" cy="50" r="12" fill="none" stroke={core} strokeWidth="1.2" strokeOpacity="0.55" />
    </svg>
  );
}
