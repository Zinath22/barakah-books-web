"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "@/provider/AuthProvider";
import QuizReview from "@/components/quiz/QuizReview";
import { toBn } from "@/lib/books";
import { gradeLabel } from "@/lib/quiz";

const TONE = { success: "text-success", warning: "text-warning", error: "text-error" };
const dateOf = (d) =>
  d ? new Date(d).toLocaleString("bn-BD", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

// একটা কুইজের সমাধান পেজ — "আমার ফলাফল" থেকে আসা যায়
export default function QuizSolutionPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !user?.email) return;
    fetch(`/api/quiz-attempts/${id}?email=${encodeURIComponent(user.email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setError(d.message || "সমাধান পাওয়া যায়নি")))
      .catch(() => setError("সমাধান আনা যায়নি"));
  }, [id, user?.email]);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center">
        <p className="text-base-content/60">সমাধান দেখতে লগইন করুন।</p>
        <Link href="/login" className="btn btn-primary mt-4 rounded-full px-8">
          লগইন
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center">
        <p>{error}</p>
        <Link href="/quiz?tab=history" className="btn btn-primary mt-4 rounded-full">
          আমার ফলাফল
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const a = data.attempt;
  const g = gradeLabel(a.percent);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/quiz?tab=history" className="btn btn-ghost btn-sm gap-1 rounded-full">
        <FiArrowLeft /> আমার সব ফলাফল
      </Link>

      {/* উপরের সারসংক্ষেপ */}
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-base-300 bg-base-100 p-6 sm:flex-row sm:p-8">
        <div
          className="radial-progress shrink-0 text-primary"
          style={{ "--value": a.percent, "--size": "7rem", "--thickness": "9px" }}
          role="progressbar"
          aria-valuenow={a.percent}
        >
          <span className="text-xl font-bold text-base-content">
            {toBn(a.score)}/{toBn(a.total)}
          </span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-base-content/60">{a.bookTitle}</p>
          <h1 className="text-2xl font-bold">{a.quizTitle}</h1>
          {a.chapter && <p className="text-base-content/70">{a.chapter}</p>}
          <p className={`mt-2 font-semibold ${TONE[g.tone]}`}>
            {g.text} · {toBn(a.percent)}%
          </p>
          <p className="mt-1 text-xs text-base-content/50">{dateOf(a.createdAt)}</p>
          <Link href={`/quiz/${a.quizId}`} className="btn btn-primary btn-sm mt-4 gap-2 rounded-full">
            <FiRefreshCw /> আবার দিন
          </Link>
        </div>
      </div>

      {data.quizChanged && (
        <div className="alert border-warning/40 bg-warning/10 text-sm">
          আপনি কুইজ দেওয়ার পর অ্যাডমিন প্রশ্নগুলো বদলেছেন, তাই কিছু প্রশ্ন মিলবে না।
        </div>
      )}

      <h2 className="text-lg font-bold">সমাধান</h2>
      <QuizReview results={a.results} />
    </div>
  );
}
