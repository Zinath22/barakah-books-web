"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import { toBn } from "@/lib/books";

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState(null);

  const load = () =>
    fetch("/api/quizzes?all=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setQuizzes(d.success ? d.quizzes : []))
      .catch(() => setQuizzes([]));

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (q) => {
    await fetch(`/api/quizzes/${q._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !q.published }),
    });
    setQuizzes((list) => list.map((x) => (x._id === q._id ? { ...x, published: !q.published } : x)));
  };

  const remove = async (q) => {
    const ok = await Swal.fire({
      title: "কুইজটি মুছবেন?",
      text: q.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "না",
    });
    if (!ok.isConfirmed) return;
    await fetch(`/api/quizzes/${q._id}`, { method: "DELETE" });
    setQuizzes((list) => list.filter((x) => x._id !== q._id));
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">কুইজ ম্যানেজ</h1>
          <p className="text-sm text-base-content/60">বইয়ের অধ্যায় অনুযায়ী MCQ কুইজ</p>
        </div>
        <Link href="/admin/quizzes/new" className="btn btn-primary gap-2">
          <FiPlus /> নতুন কুইজ
        </Link>
      </div>

      {quizzes === null ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center text-base-content/60">
          এখনো কোনো কুইজ নেই।{" "}
          <Link href="/admin/quizzes/new" className="link link-primary">
            প্রথম কুইজ বানান
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>কুইজ</th>
                <th>বই</th>
                <th className="text-center">প্রশ্ন</th>
                <th className="text-center">অবস্থা</th>
                <th className="text-right">কাজ</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q._id}>
                  <td>
                    <p className="font-semibold">{q.title}</p>
                    {q.chapter && <p className="text-xs text-base-content/50">{q.chapter}</p>}
                  </td>
                  <td className="max-w-48 truncate">{q.bookTitle}</td>
                  <td className="text-center">{toBn(q.questionCount)}</td>
                  <td className="text-center">
                    <span className={`badge badge-sm ${q.published ? "badge-success text-white" : "badge-ghost"}`}>
                      {q.published ? "প্রকাশিত" : "লুকানো"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => togglePublish(q)} className="btn btn-ghost btn-sm btn-square" title={q.published ? "লুকান" : "প্রকাশ করুন"}>
                        {q.published ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <Link href={`/admin/quizzes/edit/${q._id}`} className="btn btn-ghost btn-sm btn-square" title="এডিট">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => remove(q)} className="btn btn-ghost btn-sm btn-square text-error" title="মুছুন">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
