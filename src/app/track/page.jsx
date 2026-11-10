"use client";

import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import OrderTracker from "@/components/orders/OrderTracker";
import { toBn } from "@/lib/books";

const taka = (n) => `৳ ${toBn(Math.round(Number(n) || 0).toLocaleString("en-IN"))}`;
const dateOf = (d) =>
  d ? new Date(d).toLocaleString("bn-BD", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

// অর্ডার ট্র্যাক — লগইন ছাড়াই অর্ডার নম্বর আর মোবাইল নম্বর দিয়ে
// "আমার অর্ডার" থেকে এলে ঠিকানায় ?order=...&email=... থাকে, তখন নিজে থেকেই খুঁজে দেখায়
export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const search = async (c = code, p = phone, e = email) => {
    setError("");
    setOrder(null);
    if (!c.trim()) return setError("অর্ডার নম্বর লিখুন");
    if (!p.trim() && !e) return setError("অর্ডারের সময় দেওয়া মোবাইল নম্বর লিখুন");
    setLoading(true);
    try {
      const q = new URLSearchParams({ order: c.trim() });
      if (p.trim()) q.set("phone", p.trim());
      else q.set("email", e);
      const res = await fetch(`/api/orders/track?${q}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else setError(data.message || "অর্ডার পাওয়া যায়নি");
    } catch {
      setError("এখন ট্র্যাক করা যাচ্ছে না, একটু পরে চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get("order") || "";
    const p = sp.get("phone") || "";
    const e = sp.get("email") || "";
    if (c) setCode(c);
    if (p) setPhone(p);
    if (e) setEmail(e);
    if (c && (p || e)) search(c, p, e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">অর্ডার ট্র্যাক করুন</h1>
        <p className="mt-1 text-base-content/60">অর্ডার নম্বর আর অর্ডারের সময় দেওয়া মোবাইল নম্বর দিন</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="grid gap-3 rounded-3xl border border-base-300 bg-base-100 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">অর্ডার নম্বর</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input input-bordered w-full font-mono uppercase"
            placeholder="যেমন DF5BF8"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">মোবাইল নম্বর</span>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setEmail("");
            }}
            className="input input-bordered w-full"
            placeholder={email ? "আপনার অ্যাকাউন্ট থেকে" : "০১XXXXXXXXX"}
            inputMode="tel"
          />
        </label>
        <button disabled={loading} className="btn btn-primary gap-2">
          {loading ? <span className="loading loading-spinner loading-sm" /> : <FiSearch />} খুঁজুন
        </button>
      </form>

      {error && <div className="rounded-2xl bg-error/10 p-4 text-center text-error">{error}</div>}

      {order && (
        <div className="space-y-5 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-base-content/60">অর্ডার নম্বর</p>
              <p className="font-mono text-2xl font-bold">#{order.code}</p>
              <p className="text-xs text-base-content/50">{dateOf(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{taka(order.total)}</p>
              <p className="text-sm text-base-content/60">{order.payment.method}</p>
              <span className={`badge badge-sm ${order.payment.paid ? "badge-success text-white" : "badge-warning"}`}>
                {order.payment.label}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-base-200/60 p-4 sm:p-6">
            <OrderTracker
              steps={order.steps}
              cancelled={order.status === "Cancelled"}
              cancelledAt={order.cancelledAt}
              courierNote={order.courierNote}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">বই</p>
            <ul className="divide-y divide-base-200 text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <span>{it.title}</span>
                  <span className="shrink-0 text-base-content/60">× {toBn(it.qty)}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-base-content/50">
            কোনো প্রশ্ন থাকলে অর্ডার নম্বরটি জানিয়ে আমাদের সাথে যোগাযোগ করুন
          </p>
        </div>
      )}
    </div>
  );
}
