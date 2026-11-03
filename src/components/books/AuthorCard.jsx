"use client";

import Link from "next/link";
import { useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { toBn } from "@/lib/books";

const SHORT = 220; // এর বেশি লেখা হলে "আরো পড়ুন" দেখাবে

// লেখক পরিচিতি কার্ড
export default function AuthorCard({ name, bio = "", img = "", bookCount = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  if (!name) return null;

  const text = bio.trim();
  const isLong = text.length > SHORT;
  const shown = !isLong || expanded ? text : text.slice(0, SHORT).trimEnd() + "...";
  const initial = name.replace(/^(ড\.|ডঃ|মাওলানা|মুফতি|শাইখ|শায়খ|ইমাম|আল্লামা)\s*/, "").trim().charAt(0);

  return (
    <section id="author" className="scroll-mt-28 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <h2 className="mb-5 text-xl font-bold">লেখক পরিচিতি</h2>

      <div className="flex items-center gap-4 sm:gap-6">
        {img && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={name}
            onError={() => setImgFailed(true)}
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-base-200 sm:h-24 sm:w-24"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-content ring-4 ring-base-200 sm:h-24 sm:w-24">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug sm:text-xl">{name}</h3>
          {bookCount > 0 && (
            <p className="mt-1 text-sm text-base-content/60">আমাদের সংগ্রহে {toBn(bookCount)}টি বই</p>
          )}
          <Link
            href={`/products?q=${encodeURIComponent(name)}`}
            className="btn btn-outline btn-primary btn-sm mt-3 gap-1"
          >
            লেখকের সব বই <FiChevronRight />
          </Link>
        </div>
      </div>

      {text && (
        <div className="mt-5 leading-relaxed text-base-content/80">
          {shown.split("\n\n").map((para, i) => (
            <p key={i} className="mb-3 last:mb-0">{para}</p>
          ))}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 font-semibold text-primary hover:underline"
            >
              {expanded ? "কম দেখুন" : "আরো পড়ুন"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
