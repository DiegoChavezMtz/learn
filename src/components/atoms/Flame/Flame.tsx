export function Flame({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path fill="var(--l4)" d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.4 2.2-3 2.4 1.7 4 4.4 4 7.2C19 20 15.9 22 12 22s-7-2-7-5.8C5 11 10.5 8.8 12 2z" />
    </svg>
  );
}
