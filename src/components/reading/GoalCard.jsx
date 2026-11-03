"use client";

import Link from "next/link";
import { useState } from "react";
import { FiAlertCircle, FiAward, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import BookCover from "@/components/books/BookCover";
import { toBn } from "@/lib/books";
import { bnDate, daysBetween, todayStr } from "@/lib/reading";

// একটা পড়ার লক্ষ্যের কার্ড — অগ্রগতি, আজকের লক্ষ্য আর আপডেট করার ঘর
export default function GoalCard({ goal, onUpdate, onDelete, hasQuiz }) {
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);

  const today = todayStr();
  const total = goal.totalPages;
  const current = goal.currentPage || 0;
  const percent = Math.min(100, Math.round((current / total) * 100));
  const done = goal.status === "completed";

  // আজ পর্যন্ত কতটুকু পড়া উচিত ছিল
  const dayNo = Math.max(1, daysBetween(goal.startDate, today) + 1); // আজ লক্ষ্যের কত নম্বর দিন
  const expected = Math.min(total, goal.dailyPages * dayNo); // আজ শেষে যেখানে থাকা উচিত
  const expectedYesterday = Math.min(total, goal.dailyPages * (dayNo - 1)); // গতকাল শেষে যেখানে থাকা উচিত ছিল
  const behind = Math.max(0, expectedYesterday - current); // আজকের পড়া এখনো বাকি থাকলে "পিছিয়ে" ধরি না
  const leftToday = Math.max(0, expected - current); // আজ লক্ষ্যে থাকতে আর কত পৃষ্ঠা
  const daysLeft = daysBetween(today, goal.deadline) + 1;
  const todayLog = (goal.logs || []).find((l) => l.date === today);
  const readToday = todayLog?.pages || 0;

  const save = async (value) => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n < 0) return;
    setBusy(true);
    await onUpdate(goal._id, Math.min(n, total));
    setBusy(false);
    setPage("");
  };

  return (
    <div className={`rounded-3xl border bg-base-100 p-5 sm:p-6 ${done ? "border-success/40" : "border-base-300"}`}>
      <div className="flex gap-4">
        <Link href={`/products/${goal.bookId}`} className="w-16 shrink-0 sm:w-20">
          <BookCover book={{ title: goal.bookTitle, author: goal.bookAuthor, img: goal.bookImg }} size="sm" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/products/${goal.bookId}`} className="line-clamp-2 font-bold leading-snug hover:text-primary sm:text-lg">
                {goal.bookTitle}
              </Link>
              {goal.bookAuthor && <p className="truncate text-sm text-base-content/60">{goal.bookAuthor}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDelete(goal)}
              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
              aria-label="লক্ষ্য মুছুন"
            >
              <FiTrash2 />
            </button>
          </div>

          <p className="mt-1 text-xs text-base-content/50">
            প্রতিদিন {toBn(goal.dailyPages)} পৃষ্ঠা · {toBn(goal.targetDays)} দিনের লক্ষ্য · {bnDate(goal.startDate)} থেকে{" "}
            {bnDate(goal.deadline)}
          </p>

          {/* অগ্রগতি */}
          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span>
                <b>{toBn(current)}</b> / {toBn(total)} পৃষ্ঠা
              </span>
              <span className="font-bold text-primary">{toBn(percent)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-base-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${done ? "bg-success" : "bg-primary"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {done ? (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-success/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-semibold text-success">
            <FiAward className="text-xl" /> আলহামদুলিল্লাহ! {bnDate(goal.completedDate || today)} তারিখে বইটি শেষ হয়েছে
          </p>
          {hasQuiz && (
            <Link href={`/quiz?book=${goal.bookId}`} className="btn btn-success btn-sm rounded-full text-white">
              বইয়ের কুইজ দিন
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* আজকের অবস্থা */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-base-200 p-2.5 sm:p-3">
              <p className="text-[11px] text-base-content/60 sm:text-xs">আজ পড়েছেন</p>
              <p className="text-base font-bold sm:text-lg">{toBn(readToday)} পৃষ্ঠা</p>
            </div>
            <div className="rounded-2xl bg-base-200 p-2.5 sm:p-3">
              <p className="text-[11px] text-base-content/60 sm:text-xs">আজ আরও পড়ুন</p>
              <p className="text-base font-bold sm:text-lg">{leftToday > 0 ? `${toBn(leftToday)} পৃষ্ঠা` : "✓ হয়ে গেছে"}</p>
            </div>
            <div className="rounded-2xl bg-base-200 p-2.5 sm:p-3">
              <p className="text-[11px] text-base-content/60 sm:text-xs">বাকি সময়</p>
              <p className="text-base font-bold sm:text-lg">{daysLeft > 0 ? `${toBn(daysLeft)} দিন` : "সময় শেষ"}</p>
            </div>
          </div>

          <p className={`mt-3 flex items-center gap-2 text-sm ${behind > 0 ? "text-warning" : "text-success"}`}>
            {behind > 0 ? (
              <>
                <FiAlertCircle /> লক্ষ্য থেকে {toBn(behind)} পৃষ্ঠা পিছিয়ে আছেন
              </>
            ) : (
              <>
                <FiCheckCircle /> সময়মতো এগোচ্ছেন, মা শা আল্লাহ
              </>
            )}
          </p>

          {/* আপডেট */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(page);
            }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <label className="text-sm text-base-content/70" htmlFor={`page-${goal._id}`}>
              এখন কোন পৃষ্ঠায় আছেন?
            </label>
            <input
              id={`page-${goal._id}`}
              type="number"
              min={0}
              max={total}
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder={toBn(current)}
              className="input input-bordered input-sm w-24"
            />
            <button disabled={busy || page === ""} className="btn btn-primary btn-sm rounded-full px-5">
              আপডেট
            </button>
            <span className="mx-1 hidden text-base-content/30 sm:inline">|</span>
            {[5, 10, goal.dailyPages]
              .filter((n, i, a) => a.indexOf(n) === i)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => save(current + n)}
                  className="btn btn-outline btn-sm rounded-full border-base-300"
                >
                  +{toBn(n)}
                </button>
              ))}
          </form>
        </>
      )}
    </div>
  );
}
