import { useEffect, useRef, useState } from 'react';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span>{display}</span>;
}

export default function StatsStrip({ stats, total }) {
  const items = [
    { label: 'Total', value: total, color: '#e2e8f0' },
    { label: 'Severe', value: stats.severe, color: '#ef4444', glow: '#ef444444' },
    { label: 'Medium', value: stats.medium, color: '#eab308', glow: '#eab30844' },
    { label: 'Low', value: stats.low, color: '#22c55e', glow: '#22c55e44' },
  ];

  return (
    <div className="flex items-center gap-1">
      {items.map(({ label, value, color, glow }, i) => (
        <div
          key={label}
          className="flex-1 flex flex-col items-center py-2 rounded-xl"
          style={{
            background: i === 0 ? '#0a0f1e' : `${color}0a`,
            border: `1px solid ${i === 0 ? '#1e293b' : `${color}33`}`,
          }}
        >
          <span
            className="text-lg font-bold leading-tight"
            style={{ color, textShadow: glow ? `0 0 8px ${glow}` : 'none' }}
          >
            <AnimatedNumber value={value || 0} />
          </span>
          <span className="text-text-muted text-xs mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}
