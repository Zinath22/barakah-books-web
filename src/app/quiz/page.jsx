"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "@/provider/AuthProvider";
import BookCover from "@/components/books/BookCover";
import { toBn } from "@/lib/books";
import { bnDate, todayStr } from "@/lib/reading";

const scoreTone = (p) => (p >= 70 ? "badge-success text-white" : p >= 50 ? "badge-warning" : "badge-error text-white");

export default function QuizListPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [quizzes, setQuizzes] = useState(null);
  const [books, setBooks] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [bookFilter, setBookFilter] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("book")) setBookFilter(sp.get("book"));
    if (sp.get("tab") === "history") setTab("history");

    fetch("/api/quizzes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setQuizzes(d.success ? d.quizzes : []))
      .catch(() => setQuizzes([]));
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setBooks(Object.fromEntries(d.products.map((b) => [String(b._id), b]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/quiz-attempts?email=${encodeURIComponent(user.email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setAttempts(d.attempts))
      .catch(() => {});
  }, [user?.email]);

  // প্রতিটা কুইজে সেরা নম্বর
  const best = useMemo(() => {
    const m = {};
    for (const a of attempts) if (!m[a.quizId] || a.percent > m[a.quizId].percent) m[a.quizId] = a;
    return m;
  }, [attempts]);

  // বই অনুযায়ী ভাগ
  const groups = useMemo(() => {
    const g = {};
    for (const q of quizzes || []) {
      if (bookFilter && q.bookId !== bookFilter) continue;
      (g[q.bookId] ||= { bookId: q.bookId, bookTitle: q.bookTitle, bookAuthor: q.bookAuthor, quizzes: [] }).quizzes.push(q);
    }
    return Object.values(g);
  }, [quizzes, bookFilter]);

  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : 0;
  const bestPercent = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : 0;
  const dateOf = (d) => bnDate(todayStr(new Date(d)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">পড়ুন ও যাচাই করুন</h1>
        <p className="mt-1 text-base-content/60">বইয়ের অধ্যায় পড়ার পর কুইজ দিয়ে দেখুন কতটুকু শিখলেন।</p>
      </div>

      <div role="tablist" className="join">
        {[
          ["all", "সব কুইজ"],
          ["history", `আমার ফলাফল${attempts.length ? ` (${toBn(attempts.length)})` : ""}`],
        ].map(([v, l]) => (
          <button
            key={v}
            role="tab"
            aria-selected={tab === v}
            onClick={() => setTab(v)}
            className={`btn join-item btn-sm ${tab === v ? "btn-primary" : "btn-ghost border-base-300"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "all" ? (
        <>
          {bookFilter && (
            <div className="flex">
              <button onClick={() => setBookFilter("")} className="badge badge-lg gap-1 border-base-300 bg-base-100 py-3">
                শুধু একটি বইয়ের কুইজ দেখানো হচ্ছে <FiX />
              </button>
            </div>
          )}

          {quizzes === null ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/60">
              এখনো কোনো কুইজ যোগ করা হয়নি।
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {groups.map((g) => {
                const b = books[g.bookId] || { title: g.bookTitle, author: g.bookAuthor };
                return (
                  <div key={g.bookId} className="rounded-3xl border border-base-300 bg-base-100 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Link href={`/products/${g.bookId}`} className="w-12 shrink-0">
                        <BookCover book={b} size="sm" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/products/${g.bookId}`} className="line-clamp-1 font-bold hover:text-primary">
                          {g.bookTitle}
                        </Link>
                        <p className="truncate text-sm text-base-content/60">{g.bookAuthor}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {g.quizzes.map((q) => {
                        const my = best[q._id];
                        return (
                          <li key={q._id} className="flex items-center gap-3 rounded-2xl bg-base-200 p-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{q.title}</p>
                              <p className="truncate text-xs text-base-content/60">
                                {q.chapter ? `${q.chapter} · ` : ""}
                                {toBn(q.questionCount)}টি প্রশ্ন
                                {my && <> · সেরা: {toBn(my.score)}/{toBn(my.total)}</>}
                              </p>
                            </div>
                            <Link href={`/quiz/${q._id}`} className={`btn btn-sm rounded-full ${my ? "btn-outline" : "btn-primary"}`}>
                              {my ? "আবার দিন" : "শুরু করুন"}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : !user ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center">
          <p className="text-base-content/60">ফলাফল দেখতে লগইন করুন।</p>
          <Link href="/login" className="btn btn-primary mt-4 rounded-full px-8">
            লগইন
          </Link>
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/60">
          এখনো কোনো কুইজ দেননি।
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["মোট কুইজ দিয়েছেন", `${toBn(attempts.length)} বার`],
              ["গড় নম্বর", `${toBn(avg)}%`],
              ["সেরা নম্বর", `${toBn(bestPercent)}%`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <p className="text-xs text-base-content/60 sm:text-sm">{l}</p>
                <p className="mt-1 text-xl font-bold sm:text-2xl">{v}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>কুইজ</th>
                  <th>তারিখ</th>
                  <th className="text-right">নম্বর</th>
                  <th className="text-right">সমাধান</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <Link href={`/quiz/${a.quizId}`} className="font-medium hover:text-primary">
                        {a.quizTitle}
                      </Link>
                      <p className="text-xs text-base-content/50">{a.bookTitle}</p>
                    </td>
                    <td className="whitespace-nowrap text-sm">{dateOf(a.createdAt)}</td>
                    <td className="text-right">
                      <span className="mr-2 font-semibold">
                        {toBn(a.score)}/{toBn(a.total)}
                      </span>
                      <span className={`badge badge-sm ${scoreTone(a.percent)}`}>{toBn(a.percent)}%</span>
                    </td>
                    <td className="text-right">
                      <Link href={`/quiz/solution/${a._id}`} className="btn btn-outline btn-primary btn-xs whitespace-nowrap rounded-full">
                        সমাধান দেখুন
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
