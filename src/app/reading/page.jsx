"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "@/provider/AuthProvider";
import GoalCard from "@/components/reading/GoalCard";
import NewGoalForm from "@/components/reading/NewGoalForm";
import ReadingStats from "@/components/reading/ReadingStats";
import { toBn } from "@/lib/books";

export default function ReadingJourneyPage() {
  const { user, loading } = useAuth();
  const [goals, setGoals] = useState(null);
  const [books, setBooks] = useState([]);
  const [quizBooks, setQuizBooks] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [initialBook, setInitialBook] = useState("");
  const [saving, setSaving] = useState(false);

  // /reading?book=<id> দিয়ে এলে ফর্ম খুলে বইটা বাছাই করা থাকবে
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("book");
    if (id) {
      setInitialBook(id);
      setShowForm(true);
    }
  }, []);

  const loadGoals = useCallback(async () => {
    if (!user?.email) return;
    const res = await fetch(`/api/reading?email=${encodeURIComponent(user.email)}`, { cache: "no-store" });
    const data = await res.json();
    setGoals(data.success ? data.goals : []);
  }, [user?.email]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // বইয়ের তালিকা (ফর্মের জন্য) আর কোন বইয়ের কুইজ আছে
  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        setBooks(
          d.products
            .map((b) => ({ _id: String(b._id), title: b.title, author: b.author, pages: b.pages, img: b.img || b.image }))
            .sort((a, b) => String(a.title).localeCompare(String(b.title), "bn"))
        );
      })
      .catch(() => {});
    fetch("/api/quizzes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setQuizBooks(new Set(d.quizzes.map((q) => q.bookId))))
      .catch(() => {});
  }, []);

  const createGoal = async (form) => {
    setSaving(true);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userEmail: user.email }),
      });
      const data = await res.json();
      if (!data.success) return Swal.fire("সমস্যা হয়েছে", data.message, "error");
      setShowForm(false);
      setInitialBook("");
      window.history.replaceState(null, "", "/reading");
      await loadGoals();
      Swal.fire({ icon: "success", title: "বিসমিল্লাহ! লক্ষ্য শুরু হলো", timer: 1500, showConfirmButton: false });
    } finally {
      setSaving(false);
    }
  };

  const updateProgress = async (id, currentPage) => {
    const res = await fetch(`/api/reading/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: user.email, currentPage }),
    });
    const data = await res.json();
    if (!data.success) return Swal.fire("সমস্যা হয়েছে", data.message, "error");
    setGoals((prev) => prev.map((g) => (g._id === id ? { ...g, ...data.goal, _id: id } : g)));
    if (data.completed) {
      Swal.fire({ icon: "success", title: "আলহামদুলিল্লাহ!", text: "আপনি বইটি পড়া শেষ করেছেন।" });
    }
  };

  const deleteGoal = async (goal) => {
    const ok = await Swal.fire({
      title: "লক্ষ্যটি মুছবেন?",
      text: `"${goal.bookTitle}" এর সব অগ্রগতি মুছে যাবে`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "না",
    });
    if (!ok.isConfirmed) return;
    await fetch(`/api/reading/${goal._id}?email=${encodeURIComponent(user.email)}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g._id !== goal._id));
  };

  // ---------- লগইন না থাকলে ----------
  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center">
        <p className="text-5xl">📖</p>
        <h1 className="mt-3 text-2xl font-bold">আমার পড়ার যাত্রা</h1>
        <p className="mt-2 text-base-content/60">পড়ার লক্ষ্য সেট করতে আর অগ্রগতি রাখতে লগইন করুন।</p>
        <Link href="/login" className="btn btn-primary mt-5 rounded-full px-8">
          লগইন করুন
        </Link>
      </div>
    );
  }

  if (loading || goals === null) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const active = goals.filter((g) => g.status !== "completed");
  const completed = goals.filter((g) => g.status === "completed");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">আমার পড়ার যাত্রা</h1>
          <p className="mt-1 text-base-content/60">শুধু বই কেনা নয়, প্রতিদিন একটু একটু পড়ার অভ্যাস গড়ুন।</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2 rounded-full px-6">
            <FiPlus /> নতুন লক্ষ্য
          </button>
        )}
      </div>

      {showForm && (
        <NewGoalForm
          key={initialBook}
          books={books}
          initialBookId={initialBook}
          saving={saving}
          onSave={createGoal}
          onCancel={() => {
            setShowForm(false);
            setInitialBook("");
          }}
        />
      )}

      {goals.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <p className="text-5xl">🌱</p>
          <p className="mt-3 text-lg font-semibold">এখনো কোনো পড়ার লক্ষ্য নেই</p>
          <p className="mt-1 text-base-content/60">একটা বই বেছে নিন আর ঠিক করুন কত দিনে শেষ করবেন।</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-5 gap-2 rounded-full px-6">
            <FiPlus /> প্রথম লক্ষ্য সেট করুন
          </button>
        </div>
      ) : (
        goals.length > 0 && (
          <>
            <ReadingStats goals={goals} />

            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-bold">এখন পড়ছি ({toBn(active.length)})</h2>
                <div className="grid gap-4 xl:grid-cols-2">
                  {active.map((g) => (
                    <GoalCard key={g._id} goal={g} onUpdate={updateProgress} onDelete={deleteGoal} hasQuiz={quizBooks.has(g.bookId)} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-bold">শেষ করেছি ({toBn(completed.length)})</h2>
                <div className="grid gap-4 xl:grid-cols-2">
                  {completed.map((g) => (
                    <GoalCard key={g._id} goal={g} onUpdate={updateProgress} onDelete={deleteGoal} hasQuiz={quizBooks.has(g.bookId)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )
      )}
    </div>
  );
}
