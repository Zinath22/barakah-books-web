import Link from "next/link";

// নিজস্ব logo: মসজিদের খিলানের ভেতরে খোলা বই, উপরে ৮ কোণা তারা
export function LogoMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 46V21a18 18 0 0 1 36 0v25z" fill="#0f5c45" />
      <path d="M9.5 43V21.5a14.5 14.5 0 0 1 29 0V43" fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <g fill="#c9a227">
        <rect x="21" y="9" width="6" height="6" />
        <rect x="21" y="9" width="6" height="6" transform="rotate(45 24 12)" />
      </g>
      <path
        d="M12 27c4-2.5 8-2.5 12 0v12c-4-2.5-8-2.5-12 0zM24 27c4-2.5 8-2.5 12 0v12c-4-2.5-8-2.5-12 0z"
        fill="#fdfaf2"
      />
      <path d="M24 27v12" stroke="#0f5c45" strokeWidth="1" />
    </svg>
  );
}

const Logo = ({ light = false }) => (
  <Link href="/" className="flex items-center gap-2" aria-label="বারাকাহ বুকস — হোম">
    <LogoMark />
    <div className="leading-tight">
      <p className={`text-xl font-bold ${light ? "text-white" : "text-primary"}`}>
        বারাকাহ <span className="text-secondary">বুকস</span>
      </p>
      <p className={`text-[10px] tracking-[0.2em] uppercase ${light ? "text-white/60" : "text-base-content/50"}`}>
        Barakah Books
      </p>
    </div>
  </Link>
);

export default Logo;
