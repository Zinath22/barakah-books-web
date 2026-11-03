// পড়ার যাত্রা (Reading Journey) এর common helper — সার্ভার ও ব্রাউজার দুই জায়গাতেই চলে

// সব তারিখ বাংলাদেশের সময় ধরে "YYYY-MM-DD" আকারে রাখা হয়
export const TIME_ZONE = "Asia/Dhaka";

export const todayStr = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

export const isDateStr = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

// "2026-11-01" + 3 দিন → "2026-11-04"
export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

// দুই তারিখের মাঝে কত দিন (b - a)
export function daysBetween(a, b) {
  const t = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86400000);
}

const BN_MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const BN_DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const bn = (v) => String(v).replace(/\d/g, (x) => BN[x]);

// "2026-11-01" → "১ নভে"
export function bnDate(dateStr) {
  if (!isDateStr(dateStr)) return "";
  const [, m, d] = dateStr.split("-").map(Number);
  return `${bn(d)} ${BN_MONTHS[m - 1]}`;
}

// "2026-11-01" → "রবি"
export function bnWeekday(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return BN_DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

// লক্ষ্যের ধরন থেকে দিন আর প্রতিদিনের পৃষ্ঠা হিসাব
// goalType "days"  → targetDays দেওয়া, প্রতিদিন কত পৃষ্ঠা লাগবে হিসাব হয়
// goalType "daily" → dailyPages দেওয়া, কত দিন লাগবে হিসাব হয়
export function planGoal({ totalPages, goalType, targetDays, dailyPages }) {
  const total = Math.max(1, Math.round(Number(totalPages) || 0));
  if (goalType === "daily") {
    const daily = Math.max(1, Math.round(Number(dailyPages) || 0));
    return { totalPages: total, dailyPages: daily, targetDays: Math.ceil(total / daily) };
  }
  const days = Math.max(1, Math.round(Number(targetDays) || 0));
  return { totalPages: total, targetDays: days, dailyPages: Math.ceil(total / days) };
}

// যেসব দিনে কিছু পড়া হয়েছে তার তালিকা থেকে streak হিসাব
// আজ এখনো না পড়লেও গতকাল পর্যন্ত টানা থাকলে streak ভাঙে না
export function computeStreak(readDates, today = todayStr()) {
  const set = new Set(readDates);
  let start = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(start)) {
    current++;
    start = addDays(start, -1);
  }

  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest, readToday: set.has(today) };
}