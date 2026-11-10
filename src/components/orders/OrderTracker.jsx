"use client";

import { FiCheck, FiCheckCircle, FiClipboard, FiPackage, FiTruck, FiXCircle } from "react-icons/fi";

const ICONS = { Pending: FiClipboard, Approved: FiCheckCircle, Shipped: FiTruck, Delivered: FiPackage };

const when = (d) =>
  d ? new Date(d).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";

// অর্ডার কোন ধাপে আছে — কম্পিউটারে পাশাপাশি, মোবাইলে উপর-নিচে
// steps = trackSteps(order) থেকে: [{ value, label, text, done, current, at }]
export default function OrderTracker({ steps = [], cancelled = false, cancelledAt = null, courierNote = "" }) {
  return (
    <div>
      {cancelled && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-error/10 p-3 text-sm font-medium text-error">
          <FiXCircle className="shrink-0 text-lg" />
          অর্ডারটি বাতিল করা হয়েছে{cancelledAt ? ` (${when(cancelledAt)})` : ""}
        </div>
      )}

      <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {steps.map((s, i) => {
          const Icon = ICONS[s.value] || FiCheck;
          const last = i === steps.length - 1;
          const nextDone = steps[i + 1]?.done;
          const tone = cancelled && !s.done ? "muted" : s.done ? "done" : "todo";
          return (
            <li key={s.value} className="relative flex flex-1 gap-3 pb-6 sm:flex-col sm:items-center sm:pb-0 sm:text-center">
              {/* ধাপের মাঝের দাগ */}
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 sm:left-[calc(50%+1.25rem)] sm:top-5 sm:h-0.5 sm:w-[calc(100%-2.5rem)] ${
                    nextDone ? "bg-success" : "bg-base-300"
                  }`}
                />
              )}

              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                  tone === "done"
                    ? "bg-success text-white"
                    : tone === "muted"
                    ? "bg-base-200 text-base-content/30"
                    : "border-2 border-base-300 bg-base-100 text-base-content/40"
                } ${s.current ? "ring-4 ring-success/25" : ""}`}
              >
                {s.done && !s.current ? <FiCheck /> : <Icon />}
              </span>

              <div className="min-w-0 sm:mt-2 sm:px-1">
                <p className={`font-semibold ${s.done ? "" : "text-base-content/50"}`}>
                  {s.label}
                  {s.current && <span className="badge badge-success badge-xs ml-2 align-middle text-white sm:hidden">এখন</span>}
                </p>
                <p className="text-xs text-base-content/60">{s.done ? s.text : "অপেক্ষায়"}</p>
                {s.at && s.done && <p className="mt-0.5 text-xs text-base-content/40">{when(s.at)}</p>}
                {s.value === "Shipped" && s.done && courierNote && (
                  <p className="mt-1 inline-block rounded-lg bg-base-200 px-2 py-1 text-xs">🚚 {courierNote}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
