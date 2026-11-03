"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import BookCover from "@/components/books/BookCover";
import { toBn } from "@/lib/books";
import { addDays, bnDate, planGoal, todayStr } from "@/lib/reading";

const DAY_PRESETS = [7, 15, 30, 60];
const PAGE_PRESETS = [5, 10, 20, 30];

// নতুন পড়ার লক্ষ্য সেট করার ফর্ম
export default function NewGoalForm({ books = [], initialBookId = "", onCancel, onSave, saving }) {
  const [query, setQuery] = useState("");
  const [bookId, setBookId] = useState(initialBookId);
  const [pages, setPages] = useState("");
  const [goalType, setGoalType] = useState("days");
  const [targetDays, setTargetDays] = useState(30);
  const [dailyPages, setDailyPages] = useState(10);

  const book = books.find((b) => b._id === bookId);

  // বই বদলালে পৃষ্ঠা সংখ্যা বইয়ের তথ্য থেকে বসে যায়
  useEffect(() => {
    if (book?.pages) setPages(String(book.pages));
  }, [book?._id, book?.pages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? books.filter((b) => [b.title, b.author].filter(Boolean).join(" ").toLowerCase().includes(q))
      : books;
    return list.slice(0, 8);
  }, [books, query]);

  const total = Number(pages) || 0;
  const plan = total > 0 ? planGoal({ totalPages: total, goalType, targetDays, dailyPages }) : null;
  const endDate = plan ? addDays(todayStr(), plan.targetDays - 1) : null;
  const canSave = book && total > 0 && plan && !saving;

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({ bookId, totalPages: total, goalType, targetDays, dailyPages });
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">নতুন পড়ার লক্ষ্য</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm btn-circle" aria-label="বন্ধ করুন">
            <FiX />
          </button>
        )}
      </div>

      {/* ধাপ ১: বই বাছাই */}
      <p className="mb-2 text-sm font-semibold">১. কোন বই পড়বেন?</p>
      {book ? (
        <div className="flex items-center gap-3 rounded-2xl bg-base-200 p-3">
          <div className="w-12 shrink-0">
            <BookCover book={book} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{book.title}</p>
            <p className="truncate text-sm text-base-content/60">{book.author}</p>
          </div>
          <button type="button" onClick={() => setBookId("")} className="btn btn-ghost btn-xs">
            বদলান
          </button>
        </div>
      ) : (
        <div>
          <label className="input input-bordered flex w-full items-center gap-2">
            <FiSearch className="opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="বইয়ের নাম বা লেখক লিখুন"
              className="grow"
            />
          </label>
          <ul className="mt-2 max-h-72 divide-y divide-base-200 overflow-auto rounded-2xl border border-base-300">
            {filtered.length === 0 && <li className="p-4 text-center text-sm text-base-content/50">কোনো বই পাওয়া যায়নি</li>}
            {filtered.map((b) => (
              <li key={b._id}>
                <button
                  type="button"
                  onClick={() => setBookId(b._id)}
                  className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-base-200"
                >
                  <div className="w-9 shrink-0">
                    <BookCover book={b} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{b.title}</p>
                    <p className="truncate text-xs text-base-content/50">
                      {b.author}
                      {b.pages ? ` · ${toBn(b.pages)} পৃষ্ঠা` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {book && (
        <>
          {/* ধাপ ২: পৃষ্ঠা */}
          <p className="mb-2 mt-6 text-sm font-semibold">২. বইটিতে মোট কত পৃষ্ঠা?</p>
          <input
            type="number"
            min={1}
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            className="input input-bordered w-40"
            placeholder="যেমন: ২৫০"
            required
          />

          {/* ধাপ ৩: লক্ষ্য */}
          <p className="mb-2 mt-6 text-sm font-semibold">৩. আপনার লক্ষ্য কী?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { v: "days", t: "নির্দিষ্ট দিনে শেষ করব", s: "যেমন ৩০ দিনে পুরো বই" },
              { v: "daily", t: "প্রতিদিন নির্দিষ্ট পৃষ্ঠা পড়ব", s: "যেমন প্রতিদিন ১০ পৃষ্ঠা" },
            ].map((o) => (
              <label
                key={o.v}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                  goalType === o.v ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/20"
                }`}
              >
                <input
                  type="radio"
                  name="goalType"
                  value={o.v}
                  checked={goalType === o.v}
                  onChange={() => setGoalType(o.v)}
                  className="sr-only"
                />
                <p className="font-semibold">{o.t}</p>
                <p className="text-sm text-base-content/60">{o.s}</p>
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(goalType === "days" ? DAY_PRESETS : PAGE_PRESETS).map((n) => {
              const val = goalType === "days" ? targetDays : dailyPages;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => (goalType === "days" ? setTargetDays(n) : setDailyPages(n))}
                  className={`btn btn-sm rounded-full ${val === n ? "btn-primary" : "btn-outline border-base-300"}`}
                >
                  {toBn(n)} {goalType === "days" ? "দিন" : "পৃষ্ঠা"}
                </button>
              );
            })}
            <label className="flex items-center gap-2 text-sm">
              <span className="text-base-content/60">অথবা</span>
              <input
                type="number"
                min={1}
                value={goalType === "days" ? targetDays : dailyPages}
                onChange={(e) =>
                  goalType === "days" ? setTargetDays(Number(e.target.value)) : setDailyPages(Number(e.target.value))
                }
                className="input input-bordered input-sm w-20"
              />
              <span className="text-base-content/60">{goalType === "days" ? "দিন" : "পৃষ্ঠা/দিন"}</span>
            </label>
          </div>

          {/* সারসংক্ষেপ */}
          {plan && (
            <div className="mt-5 rounded-2xl bg-base-200 p-4 text-sm leading-relaxed">
              প্রতিদিন <b className="text-primary">{toBn(plan.dailyPages)} পৃষ্ঠা</b> পড়লে{" "}
              <b className="text-primary">{toBn(plan.targetDays)} দিনে</b> বইটি শেষ হবে, ইন শা আল্লাহ।
              <span className="block text-base-content/60">শেষ তারিখ: {bnDate(endDate)}</span>
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex gap-2">
        <button disabled={!canSave} className="btn btn-primary rounded-full px-8">
          {saving ? "সেভ হচ্ছে..." : "লক্ষ্য শুরু করুন"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost rounded-full">
            বাতিল
          </button>
        )}
      </div>
    </form>
  );
}
