"use client";

import { toBn } from "@/lib/books";
import { addDays, bnWeekday, computeStreak, todayStr } from "@/lib/reading";

// উপরের সারসংক্ষেপ: টানা পড়া (streak), আজ, এই সপ্তাহ, শেষ করা বই + গত ৭ দিনের ছোট চার্ট
export default function ReadingStats({ goals = [] }) {
  const today = todayStr();

  // সব লক্ষ্যের লগ মিলিয়ে দিন অনুযায়ী মোট পৃষ্ঠা
  const perDay = {};
  for (const g of goals) {
    for (const l of g.logs || []) {
      if (l.pages > 0) perDay[l.date] = (perDay[l.date] || 0) + l.pages;
    }
  }
  const streak = computeStreak(Object.keys(perDay), today);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, pages: perDay[date] || 0 };
  });
  const week = last7.reduce((s, d) => s + d.pages, 0);
  const finished = goals.filter((g) => g.status === "completed").length;
  const max = Math.max(...last7.map((d) => d.pages), 1);

  const tiles = [
    {
      label: "টানা পড়া",
      value: `${toBn(streak.current)} দিন`,
      note: streak.longest > 0 ? `সর্বোচ্চ ${toBn(streak.longest)} দিন` : "আজ থেকে শুরু করুন",
      icon: "🔥",
    },
    {
      label: "আজ পড়েছেন",
      value: `${toBn(perDay[today] || 0)} পৃষ্ঠা`,
      note: streak.readToday ? "আজকের streak ঠিক আছে" : "আজ এখনো পড়া হয়নি",
      icon: "📖",
    },
    { label: "গত ৭ দিনে", value: `${toBn(week)} পৃষ্ঠা`, note: `দিনে গড়ে ${toBn(Math.round(week / 7))} পৃষ্ঠা`, icon: "📅" },
    { label: "শেষ করা বই", value: `${toBn(finished)}টি`, note: `চলছে ${toBn(goals.length - finished)}টি`, icon: "🏆" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <p className="text-sm text-base-content/60">
              <span aria-hidden>{t.icon}</span> {t.label}
            </p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">{t.value}</p>
            <p className="mt-0.5 text-xs text-base-content/50">{t.note}</p>
          </div>
        ))}
      </div>

      {/* গত ৭ দিন */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
        <p className="mb-3 text-sm text-base-content/60">গত ৭ দিন</p>
        <div className="flex h-32 items-end justify-between gap-2">
          {last7.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[11px] font-medium text-base-content/60">{d.pages > 0 ? toBn(d.pages) : ""}</span>
              <div
                className={`w-full max-w-7 rounded-t-md ${d.pages > 0 ? "bg-primary" : "bg-base-200"}`}
                style={{ height: d.pages > 0 ? `${Math.max(8, (d.pages / max) * 80)}%` : "6px" }}
                title={`${toBn(d.pages)} পৃষ্ঠা`}
              />
              <span className={`text-[11px] ${d.date === today ? "font-bold text-primary" : "text-base-content/50"}`}>
                {d.date === today ? "আজ" : bnWeekday(d.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
