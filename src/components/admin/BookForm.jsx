"use client";

import { useState } from "react";
import BookCover from "@/components/books/BookCover";
import { BINDINGS, CATEGORY_VALUES, LANGUAGES } from "@/lib/books";

export const EMPTY_BOOK = {
  title: "",
  author: "",
  translator: "",
  publisher: "",
  category: "",
  language: "বাংলা",
  binding: "হার্ডকভার",
  pages: "",
  edition: "",
  isbn: "",
  price: "",
  originalPrice: "",
  stock: "",
  img: "",
  description: "",
};

const NUMBER_FIELDS = ["price", "originalPrice", "pages", "stock"];

// form এর string গুলোকে সঠিক type এ বদলে database এ পাঠানোর উপযোগী করা
export function toPayload(form) {
  const out = {};
  for (const [k, v] of Object.entries(form)) {
    if (NUMBER_FIELDS.includes(k)) {
      if (v !== "" && v !== null && v !== undefined) out[k] = Number(v);
    } else {
      out[k] = typeof v === "string" ? v.trim() : v;
    }
  }
  return out;
}

const Field = ({ label, required, children, hint }) => (
  <label className="form-control w-full">
    <span className="label-text mb-1 block text-sm font-medium">
      {label} {required && <span className="text-error">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-base-content/50">{hint}</span>}
  </label>
);

export default function BookForm({ initial = EMPTY_BOOK, submitLabel = "সেভ করুন", onSubmit }) {
  const [form, setForm] = useState({ ...EMPTY_BOOK, ...initial });
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await onSubmit(toPayload(form));
      if (ok === "reset") setForm({ ...EMPTY_BOOK });
    } finally {
      setSaving(false);
    }
  };

  const input = (name, props = {}) => (
    <input name={name} value={form[name] ?? ""} onChange={set} className="input input-bordered w-full" {...props} />
  );

  return (
    <form onSubmit={handle} className="grid gap-6 lg:grid-cols-[1fr_220px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 font-semibold">মূল তথ্য</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="বইয়ের নাম" required>{input("title", { required: true, placeholder: "যেমন: রিয়াদুস সালেহীন" })}</Field>
            </div>
            <Field label="লেখক" required>{input("author", { required: true })}</Field>
            <Field label="অনুবাদক">{input("translator")}</Field>
            <Field label="প্রকাশনী">{input("publisher")}</Field>
            <Field label="ক্যাটাগরি" required>
              <select name="category" value={form.category} onChange={set} required className="select select-bordered w-full">
                <option value="" disabled>বেছে নিন</option>
                {CATEGORY_VALUES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 font-semibold">দাম ও স্টক</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="বিক্রয় মূল্য (৳)" required>{input("price", { type: "number", min: 0, required: true })}</Field>
            <Field label="মুদ্রিত মূল্য (৳)" hint="বেশি হলে ছাড় দেখাবে">{input("originalPrice", { type: "number", min: 0 })}</Field>
            <Field label="স্টক (কপি)" hint="খালি রাখলে সবসময় স্টকে">{input("stock", { type: "number", min: 0 })}</Field>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 font-semibold">বইয়ের বিস্তারিত</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ভাষা">
              <select name="language" value={form.language} onChange={set} className="select select-bordered w-full">
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="বাঁধাই">
              <select name="binding" value={form.binding} onChange={set} className="select select-bordered w-full">
                {BINDINGS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="পৃষ্ঠা">{input("pages", { type: "number", min: 1 })}</Field>
            <Field label="সংস্করণ">{input("edition", { placeholder: "যেমন: ৩য় সংস্করণ, ২০২৫" })}</Field>
            <div className="sm:col-span-2">
              <Field label="ISBN">{input("isbn")}</Field>
            </div>
            <div className="sm:col-span-3">
              <Field label="প্রচ্ছদের ছবির লিংক" hint="খালি রাখলে নাম ও লেখক দিয়ে নিজে থেকে প্রচ্ছদ তৈরি হবে">
                {input("img", { type: "url", placeholder: "https://..." })}
              </Field>
            </div>
            <div className="sm:col-span-3">
              <Field label="বই সম্পর্কে">
                <textarea name="description" value={form.description} onChange={set} rows={5} className="textarea textarea-bordered w-full" placeholder="বইয়ের সংক্ষিপ্ত পরিচিতি। নতুন অনুচ্ছেদের জন্য একটা খালি লাইন দিন।" />
              </Field>
            </div>
          </div>
        </div>

        <button disabled={saving} className="btn btn-primary w-full sm:w-auto sm:px-10">
          {saving ? "সেভ হচ্ছে..." : submitLabel}
        </button>
      </div>

      {/* প্রচ্ছদের preview */}
      <div className="order-first lg:order-none">
        <div className="sticky top-28 rounded-2xl border border-base-300 bg-base-100 p-4 text-center">
          <p className="mb-3 text-sm text-base-content/60">প্রচ্ছদ দেখতে যেমন হবে</p>
          <div className="mx-auto w-36 lg:w-full">
            <BookCover book={{ title: form.title || "বইয়ের নাম", author: form.author || "লেখক", img: form.img }} />
          </div>
        </div>
      </div>
    </form>
  );
}
