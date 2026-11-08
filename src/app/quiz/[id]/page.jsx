"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "@/provider/AuthProvider";
import QuizReview from "@/components/quiz/QuizReview";
import { toBn } from "@/lib/books";
import { gradeLabel, OPTION_LABELS } from "@/lib/quiz";

const TONE = { success: "text-success", warning: "text-warning", error: "text-error" };

export default function TakeQuizPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("intro"); // intro → playing → result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quizzes/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setQuiz(d.quiz) : setError(d.message)))
      .catch(() => setError("কুইজ আনা যায়নি"));
  }, [id]);

  const start = () => {
    setAnswers(Array(quiz.questions.length).fill(null));
    setCurrent(0);
    setResult(null);
    setStage("playing");
  };

  const choose = (k) => setAnswers((a) => a.map((v, i) => (i === current ? k : v)));

  const submit = async () => {
    const empty = answers.filter((a) => a === null).length;
    if (empty > 0) {
      const ok = await Swal.fire({
        title: `${toBn(empty)}টি প্রশ্নের উত্তর দেননি`,
        text: "তবুও জমা দেবেন?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "জমা দিন",
        cancelButtonText: "ফিরে যান",
      });
      if (!ok.isConfirmed) return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, userName: user.name, answers }),
      });
      const data = await res.json();
      if (!data.success) return Swal.fire("সমস্যা হয়েছে", data.message, "error");
      setResult(data);
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center">
        <p>{error}</p>
        <Link href="/quiz" className="btn btn-primary mt-4 rounded-full">সব কুইজ</Link>
      </div>
    );
  }
  if (!quiz || loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const total = quiz.questions.length;

  // ---------- শুরুর পাতা ----------
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-base-300 bg-base-100 p-6 text-center sm:p-10">
        <p className="text-5xl">📝</p>
        <p className="mt-4 text-sm text-base-content/60">{quiz.bookTitle}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{quiz.title}</h1>
        {quiz.chapter && <p className="mt-1 text-base-content/70">{quiz.chapter}</p>}
        <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-base-200 p-3">
            <p className="text-base-content/60">প্রশ্ন</p>
            <p className="text-lg font-bold">{toBn(total)}টি</p>
          </div>
          <div className="rounded-2xl bg-base-200 p-3">
            <p className="text-base-content/60">ধরন</p>
            <p className="text-lg font-bold">MCQ</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-base-content/60">জমা দেওয়ার সাথে সাথেই ফলাফল আর প্রতিটা প্রশ্নের ব্যাখ্যা দেখতে পাবেন।</p>
        {user ? (
          <button onClick={start} className="btn btn-primary mt-6 rounded-full px-10">
            বিসমিল্লাহ, শুরু করুন
          </button>
        ) : (
          <Link href="/login" className="btn btn-primary mt-6 rounded-full px-10">
            কুইজ দিতে লগইন করুন
          </Link>
        )}
      </div>
    );
  }

  // ---------- ফলাফল ----------
  if (stage === "result" && result) {
    const g = gradeLabel(result.percent);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 text-center sm:p-10">
          <p className="text-sm text-base-content/60">{quiz.title}</p>
          <div
            className="radial-progress mx-auto mt-4 text-primary"
            style={{ "--value": result.percent, "--size": "8rem", "--thickness": "10px" }}
            role="progressbar"
            aria-valuenow={result.percent}
          >
            <span className="text-2xl font-bold text-base-content">
              {toBn(result.score)}/{toBn(result.total)}
            </span>
          </div>
          <p className={`mt-4 text-xl font-bold ${TONE[g.tone]}`}>{g.text}</p>
          <p className="mt-1 text-base-content/60">{toBn(result.percent)}% সঠিক</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={start} className="btn btn-primary gap-2 rounded-full">
              <FiRefreshCw /> আবার দিন
            </button>
            <Link href="/quiz?tab=history" className="btn btn-outline rounded-full">
              আমার সব ফলাফল
            </Link>
            {result.attemptId && (
              <Link href={`/quiz/solution/${result.attemptId}`} className="btn btn-ghost rounded-full">
                সমাধান পেজ
              </Link>
            )}
            <Link href={`/products/${quiz.bookId}`} className="btn btn-ghost rounded-full">
              বইটি দেখুন
            </Link>
          </div>
        </div>

        <h2 className="text-lg font-bold">উত্তর ও ব্যাখ্যা</h2>
        <QuizReview results={result.results} />
      </div>
    );
  }

  // ---------- প্রশ্ন ----------
  const q = quiz.questions[current];
  const answered = answers.filter((a) => a !== null).length;
  const isLast = current === total - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-base-content/60">
        <span className="truncate">{quiz.title}</span>
        <span className="shrink-0">
          উত্তর দিয়েছেন {toBn(answered)}/{toBn(total)}
        </span>
      </div>

      {/* প্রশ্নের নম্বরগুলো — চাপলে সেই প্রশ্নে যাবে */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`প্রশ্ন ${i + 1}`}
            className={`h-8 w-8 rounded-full text-sm font-medium transition ${
              i === current
                ? "bg-primary text-primary-content"
                : answers[i] !== null
                ? "bg-primary/15 text-primary"
                : "bg-base-200 text-base-content/60 hover:bg-base-300"
            }`}
          >
            {toBn(i + 1)}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <p className="text-sm font-medium text-primary">
          প্রশ্ন {toBn(current + 1)} / {toBn(total)}
        </p>
        <h2 className="mt-2 text-xl font-bold leading-relaxed">{q.question}</h2>

        <div className="mt-5 space-y-3">
          {q.options.map((o, k) => {
            const picked = answers[current] === k;
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  picked ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${
                    picked ? "bg-primary text-primary-content" : "bg-base-200"
                  }`}
                >
                  {OPTION_LABELS[k]}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setCurrent(current - 1)} disabled={current === 0} className="btn btn-ghost gap-1 rounded-full">
            <FiArrowLeft /> আগের
          </button>
          {isLast ? (
            <button onClick={submit} disabled={submitting} className="btn btn-primary rounded-full px-8">
              {submitting ? "জমা হচ্ছে..." : "জমা দিন"}
            </button>
          ) : (
            <button onClick={() => setCurrent(current + 1)} className="btn btn-primary gap-1 rounded-full px-6">
              পরের <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
