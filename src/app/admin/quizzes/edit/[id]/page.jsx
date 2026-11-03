"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import QuizForm from "@/components/admin/QuizForm";

export default function EditQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quizzes/${id}?full=1`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setQuiz(d.quiz) : setError(d.message || "কুইজ পাওয়া যায়নি")))
      .catch(() => setError("কুইজ আনা যায়নি"));
  }, [id]);

  const save = async (form) => {
    const res = await fetch(`/api/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ icon: "success", title: "আপডেট হয়েছে", timer: 1200, showConfirmButton: false });
      router.push("/admin/quizzes");
      return;
    }
    Swal.fire("সমস্যা হয়েছে", data.message || "আপডেট করা যায়নি", "error");
  };

  if (error) return <p className="p-5 text-error">{error}</p>;
  if (!quiz)
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-5 text-2xl font-bold">কুইজ এডিট</h1>
      <QuizForm initial={quiz} submitLabel="আপডেট করুন" onSubmit={save} />
    </div>
  );
}
