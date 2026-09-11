/**
 * Deterministic QR-style visual for a booking's QR payload.
 * Demo rendering only — swap for a real QR encoder library when the booking
 * payload must be machine-scannable at the gate.
 */
export function QrBlock({ data, size = 168 }: { data: string; size?: number }) {
  const grid = 21;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let seed = h >>> 0;
  for (let i = 0; i < grid * grid; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    cells.push((seed >>> 16) % 100 < 47);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);

  const cell = size / grid;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Booking QR code"
      className="rounded-xl bg-card"
    >
      <rect width={size} height={size} fill="var(--card)" />
      {cells.map((on, i) => {
        const r = Math.floor(i / grid);
        const c = i % grid;
        if (isFinder(r, c)) return null;
        if (!on) return null;
        return (
          <rect
            key={i}
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill="var(--ink)"
          />
        );
      })}
      {[
        [0, 0],
        [0, grid - 7],
        [grid - 7, 0],
      ].map(([r, c], i) => (
        <g key={i}>
          <rect x={c! * cell} y={r! * cell} width={cell * 7} height={cell * 7} fill="var(--ink)" />
          <rect
            x={(c! + 1) * cell}
            y={(r! + 1) * cell}
            width={cell * 5}
            height={cell * 5}
            fill="var(--card)"
          />
          <rect
            x={(c! + 2) * cell}
            y={(r! + 2) * cell}
            width={cell * 3}
            height={cell * 3}
            fill="var(--ink)"
          />
        </g>
      ))}
    </svg>
  );
}
