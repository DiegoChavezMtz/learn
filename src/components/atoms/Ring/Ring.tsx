import { useId } from 'react';

/** Anillo de progreso con degradado. `children` va en el centro. */
export function Ring({ value, size = 92, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const id = useId();
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--g1)" /><stop offset="55%" stopColor="var(--g2)" /><stop offset="100%" stopColor="var(--g3)" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}
