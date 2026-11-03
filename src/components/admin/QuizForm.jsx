"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import BookCover from "@/components/books/BookCover";
import { toBn } from "@/lib/books";
import { MAX_QUESTIONS, OPTION_LABELS } from "@/lib/quiz";

const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], answer: null, explanation: "", source: "" });

export const EMPTY_QUIZ = {
  bookId: "",
  title: "",
  chapter: "",
  published: true,
  questions: Array.from({ length: MAX_QUESTIONS }, emptyQuestion),
};

const Field = ({ label, required, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium">
      {label} {required && <span className="text-error">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-base-content/50">{hint}</span>}
  </label>
);

// অ্যাডমিনের কুইজ তৈরি/এডিট ফর্ম
export default function QuizForm({ initial = EMPTY_QUIZ, submitLabel = "সেভ করুন", onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_QUIZ,
    ...initial,
    questions: (initial.questions?.length ? initial.questions : EMPTY_QUIZ.questions).map((q) => ({
      ...emptyQuestion(),
      ...q,
      options: [0, 1, 2, 3].map((i) => q.options?.[i] ?? ""),
    })),
  }));
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setBooks(d.products.map((b) => ({ ...b, _id: String(b._id) }))))
      .catch(() => {});
  }, []);

  const book = books.find((b) => b._id === form.bookId);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? books.filter((b) => `${b.title} ${b.author || ""}`.toLowerCase().includes(q)) : books).slice(0, 6);
  }, [books, query]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setQ = (i, patch) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) }));
  const setOption = (i, k, value) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, j) => (j === i ? { ...q, options: q.options.map((o, m) => (m === k ? value : o)) } : q)),
    }));

  const filledCount = form.questions.filter((q) => q.question.trim()).length;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await onSubmit(form);
      if (ok === "reset") setForm({ ...EMPTY_QUIZ, questions: Array.from({ length: MAX_QUESTIONS }, emptyQuestion) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* মূল তথ্য */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="mb-4 font-semibold">কুইজের তথ্য</h2>

        <Field label="কোন বইয়ের কুইজ" required>
          {book ? (
            <div className="flex items-center gap-3 rounded-xl bg-base-200 p-3">
              <div className="w-10 shrink-0">
                <BookCover book={book} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{book.title}</p>
                <p className="truncate text-sm text-base-content/60">{book.author}</p>
              </div>
              <button type="button" onClick={() => set({ bookId: "" })} className="btn btn-ghost btn-xs">
                বদলান
              </button>
            </div>
          ) : (
            <div>
              <div className="input input-bordered flex w-full items-center gap-2">
                <FiSearch className="opacity-50" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="বইয়ের নাম লিখুন" className="grow" />
              </div>
              <ul className="mt-2 divide-y divide-base-200 rounded-xl border border-base-300">
                {matches.map((b) => (
                  <li key={b._id}>
                    <button type="button" onClick={() => set({ bookId: b._id })} className="flex w-full items-center gap-3 p-2 text-left hover:bg-base-200">
                      <div className="w-8 shrink-0">
                        <BookCover book={b} size="sm" />
                      </div>
                      <span className="truncate text-sm">{b.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Field>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="কুইজের নাম" required>
            <input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              className="input input-bordered w-full"
              placeholder="যেমন: ঈমান অধ্যায় যাচাই"
              required
            />
          </Field>
          <Field label="অধ্যায়" hint="কোন অধ্যায় পড়ার পর এই কুইজ দেবে">
            <input
              value={form.chapter}
              onChange={(e) => set({ chapter: e.target.value })}
              className="input input-bordered w-full"
              placeholder="যেমন: অধ্যায় ১ — ঈমান"
            />
          </Field>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="toggle toggle-primary" checked={form.published} onChange={(e) => set({ published: e.target.checked })} />
          <span className="text-sm">{form.published ? "প্রকাশিত — ইউজাররা দেখতে পাবে" : "লুকানো — শুধু অ্যাডমিন দেখবে"}</span>
        </label>
      </div>

      <div className="alert border-warning/40 bg-warning/10 text-sm">
        প্রশ্ন, উত্তর আর ব্যাখ্যা অবশ্যই বইয়ের যাচাইকৃত তথ্য থেকে দিন। চাইলে প্রতিটা প্রশ্নে বইয়ের পৃষ্ঠা নম্বর রেফারেন্স হিসেবে দিন।
      </div>

      {/* প্রশ্ন */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          প্রশ্ন ({toBn(filledCount)}/{toBn(MAX_QUESTIONS)} লেখা হয়েছে)
        </h2>
        <span className="text-xs text-base-content/50">খালি প্রশ্নগুলো সেভ হবে না</span>
      </div>

      {form.questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="badge badge-primary badge-outline">প্রশ্ন {toBn(i + 1)}</span>
            {form.questions.length > 1 && (
              <button
                type="button"
                onClick={() => set({ questions: form.questions.filter((_, j) => j !== i) })}
                className="btn btn-ghost btn-xs text-error"
              >
                <FiTrash2 /> মুছুন
              </button>
            )}
          </div>

          <textarea
            value={q.question}
            onChange={(e) => setQ(i, { question: e.target.value })}
            rows={2}
            className="textarea textarea-bordered w-full"
            placeholder="প্রশ্ন লিখুন"
          />

          <p className="mb-2 mt-3 text-xs text-base-content/60">৪টি অপশন লিখুন, সঠিকটির পাশের গোল ঘরে টিক দিন</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, k) => (
              <label
                key={k}
                className={`flex items-center gap-2 rounded-xl border p-2 ${q.answer === k ? "border-success bg-success/5" : "border-base-300"}`}
              >
                <input
                  type="radio"
                  name={`answer-${i}`}
                  checked={q.answer === k}
                  onChange={() => setQ(i, { answer: k })}
                  className="radio radio-success radio-sm"
                  aria-label={`${OPTION_LABELS[k]} সঠিক উত্তর`}
                />
                <span className="w-5 text-center font-semibold text-base-content/60">{OPTION_LABELS[k]}</span>
                <input
                  value={opt}
                  onChange={(e) => setOption(i, k, e.target.value)}
                  className="input input-sm input-ghost w-full"
                  placeholder={`অপশন ${OPTION_LABELS[k]}`}
                />
              </label>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
            <textarea
              value={q.explanation}
              onChange={(e) => setQ(i, { explanation: e.target.value })}
              rows={2}
              className="textarea textarea-bordered w-full"
              placeholder="ব্যাখ্যা: কেন এই উত্তরটি সঠিক"
            />
            <input
              value={q.source}
              onChange={(e) => setQ(i, { source: e.target.value })}
              className="input input-bordered w-full"
              placeholder="রেফারেন্স (যেমন: পৃষ্ঠা ৪৫)"
            />
          </div>
        </div>
      ))}

      {form.questions.length < MAX_QUESTIONS && (
        <button
          type="button"
          onClick={() => set({ questions: [...form.questions, emptyQuestion()] })}
          className="btn btn-outline w-full gap-2 border-dashed"
        >
          <FiPlus /> প্রশ্ন যোগ করুন
        </button>
      )}

      <div className="sticky bottom-3 z-10 rounded-2xl border border-base-300 bg-base-100/95 p-3 shadow-lg backdrop-blur">
        <button disabled={saving} className="btn btn-primary w-full sm:w-auto sm:px-10">
          {saving ? "সেভ হচ্ছে..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
