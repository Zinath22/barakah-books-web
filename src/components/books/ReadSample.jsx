"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiBookOpen, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { toBn } from "@/lib/books";

// "একটু পড়ুন" — বইয়ের কয়েকটা পাতার ছবি popup এ দেখায়
export default function ReadSample({ pages = [], title = "" }) {
  const list = pages.filter(Boolean).slice(0, 10);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(list.length - 1, i + 1)), [list.length]);

  // কীবোর্ড: ← → দিয়ে পাতা বদল, Esc দিয়ে বন্ধ। popup খোলা থাকলে পেছনের পেজ scroll হবে না
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [open, close, prev, next]);

  // মোবাইলে আঙুল দিয়ে swipe করে পাতা বদল
  const [touchX, setTouchX] = useState(null);
  const onTouchEnd = (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx > 50) prev();
    if (dx < -50) next();
    setTouchX(null);
  };

  if (list.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="btn btn-outline mt-3 w-full gap-2 border-base-300 bg-base-100 text-base font-semibold hover:border-primary hover:bg-base-100 hover:text-primary"
      >
        <FiBookOpen className="text-lg" /> একটু পড়ুন
      </button>

      {/* popup টা body তে বসানো হয়, যাতে পেজের অন্য কিছু এর উপরে না আসে */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex flex-col bg-neutral-950/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — একটু পড়ুন`}
          onClick={close}
        >
          {/* উপরের বার */}
          <div className="flex items-center justify-between gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <p className="line-clamp-1 text-sm font-medium sm:text-base">{title}</p>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                পাতা {toBn(index + 1)} / {toBn(list.length)}
              </span>
              <button type="button" onClick={close} className="btn btn-circle btn-ghost btn-sm text-white" aria-label="বন্ধ করুন">
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* পাতা */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16"
            onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={list[index]}
              src={list[index]}
              alt={`${title} — পাতা ${toBn(index + 1)}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-md bg-white object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              disabled={index === 0}
              className="btn btn-circle absolute left-2 top-1/2 -translate-y-1/2 border-0 bg-black/50 text-white ring-1 ring-white/30 hover:bg-black/70 disabled:invisible sm:left-4"
              aria-label="আগের পাতা"
            >
              <FiChevronLeft className="text-2xl" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              disabled={index === list.length - 1}
              className="btn btn-circle absolute right-2 top-1/2 -translate-y-1/2 border-0 bg-black/50 text-white ring-1 ring-white/30 hover:bg-black/70 disabled:invisible sm:right-4"
              aria-label="পরের পাতা"
            >
              <FiChevronRight className="text-2xl" />
            </button>
          </div>

          {/* নিচে ছোট ছবির সারি */}
          <div className="no-scrollbar flex justify-start gap-2 overflow-x-auto px-4 py-3 sm:justify-center" onClick={(e) => e.stopPropagation()}>
            {list.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-16 w-12 shrink-0 overflow-hidden rounded border-2 transition ${
                  i === index ? "border-secondary" : "border-transparent opacity-50 hover:opacity-100"
                }`}
                aria-label={`পাতা ${toBn(i + 1)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full bg-white object-cover" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
