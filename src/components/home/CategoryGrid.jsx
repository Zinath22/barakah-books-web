import Link from "next/link";
import {
  FaQuran, FaBookOpen, FaMosque, FaBalanceScale, FaStarAndCrescent, FaPrayingHands, FaChild, FaLandmark,
} from "react-icons/fa";
import { CATEGORIES, toBn } from "@/lib/books";

const ICONS = {
  quran: FaQuran, hadith: FaBookOpen, seerah: FaMosque, fiqh: FaBalanceScale,
  aqeedah: FaStarAndCrescent, tazkiyah: FaPrayingHands, kids: FaChild, history: FaLandmark,
};

export default function CategoryGrid({ books = [] }) {
  return (
    <section>
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">বিষয় অনুযায়ী বই</h2>
        <p className="mt-1 text-base-content/60">আপনার পছন্দের বিষয় বেছে নিন</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          const count = books.filter((b) => b.category === c.value).length;
          return (
            <Link
              key={c.value}
              href={`/products?category=${encodeURIComponent(c.value)}`}
              className="group flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary transition group-hover:bg-primary group-hover:text-primary-content">
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">{c.value}</span>
                <span className="block truncate text-xs text-base-content/50">
                  {count > 0 ? `${toBn(count)}টি বই` : c.note}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
