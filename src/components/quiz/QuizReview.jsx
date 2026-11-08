"use client";

import { useState } from "react";
import { FiCheckCircle, FiMinusCircle, FiXCircle } from "react-icons/fi";
import { toBn } from "@/lib/books";
import { OPTION_LABELS } from "@/lib/quiz";

// প্রতিটা প্রশ্নের অবস্থা
const kindOf = (r) => (r.chosen === null || r.chosen === undefined ? "skipped" : r.correct ? "correct" : "wrong");

const TABS = [
  { value: "all", label: "সব" },
  { value: "wrong", label: "ভুল" },
  { value: "correct", label: "সঠিক" },
  { value: "skipped", label: "উত্তর দেননি" },
];

// কুইজের সমাধান: কোন প্রশ্ন সঠিক, কোনটা ভুল, সাথে ব্যাখ্যা
// results = [{ question, options, chosen, answer, correct, explanation, source }]
export default function QuizReview({ results = [] }) {
  const [tab, setTab] = useState("all");

  const count = { all: results.length, correct: 0, wrong: 0, skipped: 0 };
  results.forEach((r) => count[kindOf(r)]++);

  const shown = results.map((r, i) => ({ ...r, no: i + 1 })).filter((r) => tab === "all" || kindOf(r) === tab);

  return (
    <div className="space-y-4">
      {/* সারসংক্ষেপ */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-success/30 bg-success/10 p-3">
          <p className="text-2xl font-bold text-success">{toBn(count.correct)}</p>
          <p className="text-sm">সঠিক</p>
        </div>
        <div className="rounded-2xl border border-error/30 bg-error/10 p-3">
          <p className="text-2xl font-bold text-error">{toBn(count.wrong)}</p>
          <p className="text-sm">ভুল</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-200 p-3">
          <p className="text-2xl font-bold text-base-content/60">{toBn(count.skipped)}</p>
          <p className="text-sm">উত্তর দেননি</p>
        </div>
      </div>

      {/* ফিল্টার */}
      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.filter((t) => t.value === "all" || count[t.value] > 0).map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`btn btn-sm rounded-full ${tab === t.value ? "btn-primary" : "btn-ghost border-base-300 bg-base-100"}`}
          >
            {t.label} ({toBn(count[t.value])})
          </button>
        ))}
      </div>

      {/* প্রশ্নগুলো */}
      {shown.map((r) => {
        const kind = kindOf(r);
        const border = kind === "correct" ? "border-success/40" : kind === "wrong" ? "border-error/40" : "border-base-300";
        return (
          <div key={r.no} className={`rounded-3xl border bg-base-100 p-5 ${border}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="flex gap-2 font-semibold leading-relaxed">
                {kind === "correct" && <FiCheckCircle className="mt-1 shrink-0 text-success" />}
                {kind === "wrong" && <FiXCircle className="mt-1 shrink-0 text-error" />}
                {kind === "skipped" && <FiMinusCircle className="mt-1 shrink-0 text-base-content/40" />}
                <span>
                  {toBn(r.no)}. {r.question}
                </span>
              </p>
              <span
                className={`badge badge-sm shrink-0 ${
                  kind === "correct" ? "badge-success text-white" : kind === "wrong" ? "badge-error text-white" : "badge-ghost"
                }`}
              >
                {kind === "correct" ? "সঠিক" : kind === "wrong" ? "ভুল" : "উত্তর দেননি"}
              </span>
            </div>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {r.options.map((o, k) => {
                const isAnswer = k === r.answer;
                const isWrongPick = k === r.chosen && !r.correct;
                return (
                  <li
                    key={k}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      isAnswer ? "border-success bg-success/10 font-medium" : isWrongPick ? "border-error bg-error/10" : "border-base-300"
                    }`}
                  >
                    <span className="font-semibold text-base-content/60">{OPTION_LABELS[k]}.</span>
                    <span className="flex-1">{o}</span>
                    {isAnswer && <span className="whitespace-nowrap text-xs text-success">✓ সঠিক উত্তর</span>}
                    {isWrongPick && <span className="whitespace-nowrap text-xs text-error">✗ আপনার উত্তর</span>}
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 rounded-2xl bg-base-200 p-3 text-sm leading-relaxed">
              <b>ব্যাখ্যা:</b> {r.explanation}
              {r.source && <span className="mt-1 block text-xs text-base-content/60">রেফারেন্স: {r.source}</span>}
            </div>
          </div>
        );
      })}

      {shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-base-content/50">এই তালিকায় কোনো প্রশ্ন নেই</p>
      )}
    </div>
  );
}
