"use client";

import Swal from "sweetalert2";
import BookForm from "@/components/admin/BookForm";

export default function AddBook() {
  const save = async (book) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ icon: "success", title: "বই যোগ হয়েছে", timer: 1300, showConfirmButton: false });
      return "reset";
    }
    Swal.fire("সমস্যা হয়েছে", data.message || "বই যোগ করা যায়নি", "error");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl font-bold">নতুন বই যোগ করুন</h1>
      <BookForm submitLabel="বই যোগ করুন" onSubmit={save} />
    </div>
  );
}
