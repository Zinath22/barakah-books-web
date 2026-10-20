import { FaStar } from "react-icons/fa";
import { toBn } from "@/lib/books";

export default function Stars({ rating = 0, count, size = 12 }) {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-secondary">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar key={i} size={size} className={i < Math.round(r) ? "" : "opacity-25"} />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-base-content/50">({toBn(count)})</span>}
    </div>
  );
}
