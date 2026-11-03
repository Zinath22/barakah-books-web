"use client";

import { useEffect, useRef, useState } from "react";
import { toBn } from "@/lib/books";

// ছোট করে টাকা লেখা: ১২,৫০০ → ১২.৫ হা, ১২,৫০,০০০ → ১২.৫ লা
export function shortTaka(n) {
  const v = Number(n) || 0;
  if (v >= 100000) return `৳ ${toBn(+(v / 100000).toFixed(1))} লা`;
  if (v >= 1000) return `৳ ${toBn(+(v / 1000).toFixed(1))} হা`;
  return `৳ ${toBn(Math.round(v))}`;
}
const fullTaka = (n) => `৳ ${toBn(Math.round(Number(n) || 0).toLocaleString("en-IN"))}`;

// সুন্দর গোল সংখ্যায় y-axis এর সর্বোচ্চ মান
function niceMax(v) {
  if (v <= 0) return 1000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  return [1, 2, 2.5, 5, 10].find((s) => s * pow >= v) * pow;
}

const H = 260;
const PAD = { top: 16, right: 8, bottom: 30, left: 64 };

// বার চার্ট: data = [{ label, tip, value, orders }]
export default function SalesChart({ data = [], labelEvery = 1 }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.max(4, Math.min(48, slot - 2 - slot * 0.3));
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  // মোবাইলে লেবেল বেশি গাদাগাদি হলে কিছু বাদ দিই
  const every = Math.max(labelEvery, Math.ceil(data.length / Math.floor(innerW / 44)));

  const h = hover !== null ? data[hover] : null;
  const hx = hover !== null ? PAD.left + slot * hover + slot / 2 : 0;

  return (
    <div ref={wrap} className="relative w-full select-none">
      <svg width={width} height={H} role="img" aria-label="বিক্রির বার চার্ট" onMouseLeave={() => setHover(null)}>
        {/* grid ও y-axis লেবেল */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? "stroke-base-content/30" : "stroke-base-content/10"}
              strokeWidth="1"
            />
            <text x={PAD.left - 10} y={y(t)} dy="0.35em" textAnchor="end" className="fill-base-content/50 text-[11px]">
              {shortTaka(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const top = y(d.value);
          const hgt = PAD.top + innerH - top;
          const r = Math.min(4, barW / 2, hgt);
          const active = hover === i;
          return (
            <g key={i}>
              {/* বার: উপরের কোণা গোল, নিচ সমান */}
              {d.value > 0 && (
                <path
                  d={`M${x},${PAD.top + innerH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${PAD.top + innerH} Z`}
                  className={`transition-colors ${
                    hover === null || active ? "fill-primary" : "fill-primary/35"
                  }`}
                />
              )}
              {i % every === 0 && (
                <text
                  x={PAD.left + slot * i + slot / 2}
                  y={H - 10}
                  textAnchor="middle"
                  className={`text-[11px] ${active ? "fill-base-content font-semibold" : "fill-base-content/50"}`}
                >
                  {d.label}
                </text>
              )}
              {/* hover এর জায়গা বারের চেয়ে বড়, যাতে ছোট বারেও ধরা যায় */}
              <rect
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              />
            </g>
          );
        })}
      </svg>

      {h && (
        <div
          className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm shadow-lg"
          style={{
            left: Math.min(Math.max(hx, 80), width - 80),
            top: Math.max(0, y(h.value) - 78),
          }}
        >
          <p className="text-xs text-base-content/60">{h.tip}</p>
          <p className="mt-0.5 font-bold">{fullTaka(h.value)}</p>
          <p className="text-xs text-base-content/60">{toBn(h.orders)}টি অর্ডার</p>
        </div>
      )}
    </div>
  );
}
