/** 0.5 단위 별점. 회색 별 위에 노란 별을 비율만큼 겹쳐 그린다 */
export function Stars({ value, size = "text-base" }: { value?: number; size?: string }) {
  if (!value) return null;
  return (
    <span className={`relative inline-block leading-none ${size}`} aria-label={`별점 ${value}점`} role="img">
      <span className="text-line">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-accent"
        style={{ width: `${(value / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
