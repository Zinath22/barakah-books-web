// কুইজ (Read & Test) এর common helper
import { toBn } from "@/lib/books";

export const MAX_QUESTIONS = 10;
export const OPTION_COUNT = 4;
export const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"];

// অ্যাডমিনের পাঠানো কুইজ যাচাই করে database এর উপযোগী করা
// ফেরত দেয় { quiz } অথবা { error }
export function cleanQuiz(body) {
  const s = (v) => String(v ?? "").trim();
  const title = s(body.title);
  const chapter = s(body.chapter);
  const bookId = s(body.bookId);

  if (!bookId) return { error: "কোন বইয়ের কুইজ তা বেছে নিন" };
  if (!title) return { error: "কুইজের নাম দিন" };

  const raw = Array.isArray(body.questions) ? body.questions : [];
  // একদম খালি প্রশ্ন বাদ
  const filled = raw.filter((q) => s(q?.question) || (q?.options || []).some((o) => s(o)));
  if (filled.length === 0) return { error: "অন্তত একটি প্রশ্ন দিন" };
  if (filled.length > MAX_QUESTIONS) return { error: `সর্বোচ্চ ${toBn(MAX_QUESTIONS)}টি প্রশ্ন দেওয়া যাবে` };

  const questions = [];
  for (let i = 0; i < filled.length; i++) {
    const q = filled[i];
    const n = toBn(i + 1);
    const question = s(q.question);
    const options = (q.options || []).slice(0, OPTION_COUNT).map(s);
    // সঠিক উত্তর বাছাই না করলে null আসে — Number(null) = 0 হয়ে যায়, তাই আলাদা করে ধরি
    const answer = q.answer === null || q.answer === undefined || q.answer === "" ? NaN : Number(q.answer);
    const explanation = s(q.explanation);

    if (!question) return { error: `${n} নম্বর প্রশ্নটি লিখুন` };
    if (options.length < OPTION_COUNT || options.some((o) => !o)) return { error: `${n} নম্বর প্রশ্নের ৪টি অপশনই লিখুন` };
    if (new Set(options).size !== options.length) return { error: `${n} নম্বর প্রশ্নে একই অপশন দুইবার আছে` };
    if (!Number.isInteger(answer) || answer < 0 || answer >= OPTION_COUNT) return { error: `${n} নম্বর প্রশ্নের সঠিক উত্তর বেছে নিন` };
    if (!explanation) return { error: `${n} নম্বর প্রশ্নের ব্যাখ্যা লিখুন` };

    questions.push({ question, options, answer, explanation, source: s(q.source) });
  }

  return {
    quiz: {
      bookId,
      title,
      chapter,
      questions,
      published: body.published !== false,
    },
  };
}

// ইউজারকে পাঠানোর আগে সঠিক উত্তর আর ব্যাখ্যা লুকানো
export const hideAnswers = (quiz) => ({
  ...quiz,
  questions: (quiz.questions || []).map(({ question, options }) => ({ question, options })),
});

// নম্বর অনুযায়ী মন্তব্য
export function gradeLabel(percent) {
  if (percent >= 90) return { text: "মা শা আল্লাহ! অসাধারণ", tone: "success" };
  if (percent >= 70) return { text: "খুব ভালো", tone: "success" };
  if (percent >= 50) return { text: "ভালো, আরেকটু পড়লে আরও ভালো হবে", tone: "warning" };
  return { text: "অধ্যায়টি আবার পড়ে চেষ্টা করুন", tone: "error" };
}