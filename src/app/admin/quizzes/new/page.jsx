"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import QuizForm from "@/components/admin/QuizForm";

export default function NewQuizPage() {
  const router = useRouter();

  const save = async (quiz) => {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quiz),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ icon: "success", title: "কুইজ যোগ হয়েছে", timer: 1300, showConfirmButton: false });
      router.push("/admin/quizzes");
      return;
    }
    Swal.fire("সমস্যা হয়েছে", data.message || "কুইজ সেভ করা যায়নি", "error");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-5 text-2xl font-bold">নতুন কুইজ</h1>
      <QuizForm submitLabel="কুইজ সেভ করুন" onSubmit={save} />
    </div>
  );
}
