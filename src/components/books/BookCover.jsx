"use client";

import { useState } from "react";

// ছবি না থাকলে (বা ছবি load না হলে) নিজে থেকেই সুন্দর একটা প্রচ্ছদ তৈরি হয়
const PALETTES = [
  { bg: "#0f5c45", ink: "#f3e3b0", line: "#c9a227" }, // emerald
  { bg: "#1e3a5f", ink: "#f1e2b8", line: "#d4b25a" }, // navy
  { bg: "#6b1f2a", ink: "#f4e4c1", line: "#e0c27a" }, // maroon
  { bg: "#115e67", ink: "#f2e6c4", line: "#e8d49a" }, // teal
  { bg: "#5a3e2b", ink: "#f5e7c8", line: "#d9b77e" }, // brown
  { bg: "#3f5a2a", ink: "#f2e7c0", line: "#e3cf8c" }, // olive
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const usableImage = (url) => (url ? url : null);

const SIZES = {
  sm: { title: "text-[9px] leading-tight", author: "text-[7px]", pad: "p-1.5", frame: "inset-1", star: 10 },
  md: { title: "text-base leading-snug", author: "text-[11px]", pad: "p-4", frame: "inset-2.5", star: 18 },
  lg: { title: "text-2xl leading-snug", author: "text-sm", pad: "p-7", frame: "inset-4", star: 26 },
};

export default function BookCover({ book, size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const img = usableImage(book?.img || book?.image);
  const s = SIZES[size] || SIZES.md;

  const base = `relative aspect-[3/4] w-full overflow-hidden rounded-r-md rounded-l-sm shadow-[4px_6px_14px_rgba(0,0,0,0.25)] ${className}`;
  // বইয়ের বাঁধাইয়ের (spine) ছায়া
  const spine = (
    <span className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
  );

  if (img && !failed) {
    return (
      <div className={base}>
        <img
          src={img}
          alt={book?.title || "বইয়ের প্রচ্ছদ"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
        {spine}
      </div>
    );
  }

  const p = PALETTES[hash(book?.title) % PALETTES.length];

  return (
    <div className={base} style={{ backgroundColor: p.bg }} role="img" aria-label={book?.title}>
      <div className="islamic-pattern absolute inset-0 opacity-70" />
      <div className={`absolute ${s.frame} rounded-sm border`} style={{ borderColor: p.line }} />
      <div className={`relative flex h-full flex-col items-center justify-between text-center ${s.pad}`}>
        <svg width={s.star} height={s.star} viewBox="0 0 24 24" className="mt-[6%] shrink-0" aria-hidden="true">
          <g fill={p.line}>
            <rect x="6" y="6" width="12" height="12" />
            <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
          </g>
          <circle cx="12" cy="12" r="3" fill={p.bg} />
        </svg>
        <p className={`font-bold ${s.title} line-clamp-4 px-1`} style={{ color: p.ink }}>
          {book?.title}
        </p>
        <div className="mb-[6%] w-full">
          <div className="mx-auto mb-1 h-px w-1/3" style={{ backgroundColor: p.line }} />
          <p className={`${s.author} line-clamp-1 opacity-90`} style={{ color: p.ink }}>
            {book?.author || ""}
          </p>
        </div>
      </div>
      {spine}
    </div>
  );
}
