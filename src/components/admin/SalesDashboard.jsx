"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";
import SalesChart from "./SalesChart";
import { toBn } from "@/lib/books";

const MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const DAY_MS = 24 * 60 * 60 * 1000;

const taka = (n) => `৳ ${toBn(Math.round(Number(n) || 0).toLocaleString("en-IN"))}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;

// অর্ডারের টাকা: /api/orders এ total, পুরোনো payment অর্ডারে amount
const orderAmount = (o) => Number(o.total ?? o.amount ?? 0) || 0;
const isCancelled = (o) => /cancel|fail|refund/i.test(`${o.status || ""} ${o.orderStatus || ""} ${o.paymentStatus || ""}`);

// বিক্রি গোনা হয় শুধু টাকা হাতে আসার পর:
//  - অনলাইন পেমেন্ট → পেমেন্ট সফল হলেই
//  - ক্যাশ অন ডেলিভারি → অ্যাডমিন "Approve" বা "Delivered" করার পর
// (COD আসার আগের পুরোনো অর্ডার সব অনলাইনে টাকা দেওয়া, তাই সেগুলোতে তথ্য না থাকলে "Paid" ধরা হয়)
const isPaid = (o) =>
  o.paymentMethod === "COD" ? o.payment === "Paid" : (o.payment || o.paymentStatus || "Paid") === "Paid";
// কোন দিনের বিক্রি: টাকা পাওয়ার দিন (paidAt), না থাকলে অর্ডারের দিন
const saleDate = (o) => new Date(o.paidAt || o.createdAt);

const RANGES = [
  { value: "week", label: "সাপ্তাহিক", sub: "গত ৭ দিন" },
  { value: "month", label: "মাসিক", sub: "গত ৩০ দিন" },
  { value: "year", label: "বার্ষিক", sub: "গত ১২ মাস" },
];

// নির্দিষ্ট সময়ের মধ্যের বিক্রি
function sumBetween(orders, from, to) {
  let value = 0;
  let count = 0;
  for (const o of orders) {
    if (o.date >= from && o.date < to) {
      value += o.value;
      count++;
    }
  }
  return { value, count };
}

// গ্রাফের জন্য দিন বা মাস ধরে ভাগ করা
function buildSeries(orders, range, now) {
  const today = startOfDay(now);
  if (range === "year") {
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
      return { key: monthKey(d), label: MONTHS[d.getMonth()], tip: `${MONTHS[d.getMonth()]} ${toBn(d.getFullYear())}`, value: 0, orders: 0 };
    });
    const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
    for (const o of orders) {
      const b = map[monthKey(o.date)];
      if (b) {
        b.value += o.value;
        b.orders++;
      }
    }
    return buckets;
  }

  const days = range === "week" ? 7 : 30;
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1) + i);
    return {
      key: dayKey(d),
      label: range === "week" ? DAYS[d.getDay()] : toBn(d.getDate()),
      tip: `${DAYS[d.getDay()]}, ${toBn(d.getDate())} ${MONTHS[d.getMonth()]}`,
      value: 0,
      orders: 0,
    };
  });
  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
  for (const o of orders) {
    const b = map[dayKey(o.date)];
    if (b) {
      b.value += o.value;
      b.orders++;
    }
  }
  return buckets;
}

// আগের সময়ের তুলনায় বাড়ল না কমল
function Change({ now, before, label }) {
  if (before === 0 && now === 0) return <p className="mt-2 text-xs text-base-content/40">{label}: কোনো বিক্রি নেই</p>;
  if (before === 0)
    return (
      <p className="mt-2 text-xs leading-relaxed text-base-content/40">
        <span className="inline-flex items-center gap-1 font-medium text-success">
          <FiArrowUpRight /> নতুন বিক্রি
        </span>{" "}
        · {label}: ৳ ০
      </p>
    );
  const pct = Math.round(((now - before) / before) * 100);
  const Icon = pct > 0 ? FiArrowUpRight : pct < 0 ? FiArrowDownRight : FiMinus;
  const color = pct > 0 ? "text-success" : pct < 0 ? "text-error" : "text-base-content/50";
  return (
    <p className="mt-2 text-xs leading-relaxed text-base-content/40">
      <span className={`inline-flex items-center gap-1 font-medium ${color}`}>
        <Icon /> {toBn(Math.abs(pct))}% {pct > 0 ? "বেশি" : pct < 0 ? "কম" : "সমান"}
      </span>{" "}
      · {label}
    </p>
  );
}

export default function SalesDashboard() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState("week");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error(data?.message || "অর্ডার আনা যায়নি");
        setRaw(data);
      })
      .catch((e) => setError(e.message || "অর্ডার আনা যায়নি"));
  }, []);

  const now = useMemo(() => new Date(), []);

  const orders = useMemo(
    () =>
      (raw || [])
        .filter((o) => o.createdAt && !isCancelled(o) && isPaid(o))
        .map((o) => ({ date: saleDate(o), value: orderAmount(o) }))
        .filter((o) => !isNaN(o.date)),
    [raw]
  );

  // ক্যাশ অন ডেলিভারির যে টাকা এখনো আসেনি (বিক্রিতে গোনা হয়নি)
  const due = useMemo(() => {
    const list = (raw || []).filter((o) => !isCancelled(o) && !isPaid(o));
    return { count: list.length, value: list.reduce((s, o) => s + orderAmount(o), 0) };
  }, [raw]);

  const stats = useMemo(() => {
    const today = startOfDay(now).getTime();
    const end = today + DAY_MS;
    const at = (daysBack) => new Date(today - daysBack * DAY_MS);
    // বার্ষিক: গ্রাফের মতোই ১২টা পুরো মাস (এই মাস সহ)
    const t = new Date(today);
    const yearFrom = new Date(t.getFullYear(), t.getMonth() - 11, 1);
    const prevYearFrom = new Date(t.getFullYear(), t.getMonth() - 23, 1);
    return {
      today: sumBetween(orders, new Date(today), new Date(end)),
      yesterday: sumBetween(orders, at(1), new Date(today)),
      week: sumBetween(orders, at(6), new Date(end)),
      prevWeek: sumBetween(orders, at(13), at(6)),
      month: sumBetween(orders, at(29), new Date(end)),
      prevMonth: sumBetween(orders, at(59), at(29)),
      year: sumBetween(orders, yearFrom, new Date(end)),
      prevYear: sumBetween(orders, prevYearFrom, yearFrom),
    };
  }, [orders, now]);

  const series = useMemo(() => buildSeries(orders, range, now), [orders, range, now]);
  const current = RANGES.find((r) => r.value === range);
  const periodTotal = series.reduce((s, b) => s + b.value, 0);
  const periodOrders = series.reduce((s, b) => s + b.orders, 0);
  const best = series.reduce((a, b) => (b.value > (a?.value ?? 0) ? b : a), null);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }
  if (!raw) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const cards = [
    { title: "আজকের বিক্রি", sub: `${toBn(now.getDate())} ${MONTHS[now.getMonth()]}`, data: stats.today, before: stats.yesterday, label: "গতকালের চেয়ে" },
    { title: "সাপ্তাহিক বিক্রি", sub: "গত ৭ দিন", data: stats.week, before: stats.prevWeek, label: "আগের ৭ দিনের চেয়ে" },
    { title: "মাসিক বিক্রি", sub: "গত ৩০ দিন", data: stats.month, before: stats.prevMonth, label: "আগের ৩০ দিনের চেয়ে" },
    { title: "বার্ষিক বিক্রি", sub: "গত ১২ মাস", data: stats.year, before: stats.prevYear, label: "আগের ১২ মাসের চেয়ে" },
  ];

  return (
    <div className="space-y-6">
      {/* ===== কীভাবে গোনা হয় + বাকি টাকা ===== */}
      <div className="flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base-content/70">
          ✅ শুধু <b>টাকা পাওয়া</b> অর্ডার বিক্রিতে গোনা হয়: অনলাইনে পেমেন্ট সফল হলে, আর ক্যাশ অন ডেলিভারিতে অ্যাডমিন <b>Approve</b> করলে।
        </p>
        {due.count > 0 && (
          <Link href="/admin/orders" className="badge badge-warning badge-lg shrink-0 gap-1 whitespace-nowrap py-3 hover:brightness-95">
            ⏳ আসা বাকি: {taka(due.value)} ({toBn(due.count)}টি)
          </Link>
        )}
      </div>

      {/* ===== সারসংক্ষেপ কার্ড ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
            <p className="text-sm text-base-content/60">{c.title}</p>
            {c.sub && <p className="text-xs text-base-content/40">{c.sub}</p>}
            <p className="mt-2 text-lg font-bold tracking-tight sm:text-2xl">{taka(c.data.value)}</p>
            <p className="mt-0.5 text-sm text-base-content/60">{toBn(c.data.count)}টি অর্ডার</p>
            <Change now={c.data.value} before={c.before.value} label={c.label} />
          </div>
        ))}
      </div>

      {/* ===== গ্রাফ ===== */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">বিক্রির গ্রাফ</h2>
            <p className="text-sm text-base-content/60">{current.sub}</p>
          </div>
          <div role="tablist" className="join self-start">
            {RANGES.map((r) => (
              <button
                key={r.value}
                role="tab"
                aria-selected={range === r.value}
                onClick={() => setRange(r.value)}
                className={`btn btn-sm join-item ${range === r.value ? "btn-primary" : "btn-ghost border-base-300"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-base-200 p-3 text-center sm:max-w-xl">
          <div>
            <p className="text-xs text-base-content/60">মোট বিক্রি</p>
            <p className="font-bold">{taka(periodTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">অর্ডার</p>
            <p className="font-bold">{toBn(periodOrders)}টি</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">সবচেয়ে বেশি</p>
            <p className="truncate font-bold">{best && best.value > 0 ? best.tip.split(",").pop().trim() : "—"}</p>
          </div>
        </div>

        {periodOrders === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 py-16 text-center text-base-content/50">
            {current.sub} কোনো বিক্রি হয়নি
          </div>
        ) : (
          <SalesChart key={range} data={series} labelEvery={range === "month" ? 5 : 1} />
        )}

        <button onClick={() => setShowTable(!showTable)} className="btn btn-ghost btn-xs mt-3 text-base-content/60">
          {showTable ? "টেবিল লুকান" : "টেবিলে দেখুন"}
        </button>
        {showTable && (
          <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>{range === "year" ? "মাস" : "দিন"}</th>
                  <th className="text-right">অর্ডার</th>
                  <th className="text-right">বিক্রি</th>
                </tr>
              </thead>
              <tbody>
                {[...series].reverse().map((b) => (
                  <tr key={b.key}>
                    <td>{b.tip}</td>
                    <td className="text-right">{toBn(b.orders)}</td>
                    <td className="text-right font-medium">{taka(b.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
