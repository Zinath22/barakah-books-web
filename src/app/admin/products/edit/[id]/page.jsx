"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import BookForm from "@/components/admin/BookForm";

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return setError(data.message || "বই পাওয়া যায়নি");
        // null/undefined গুলো form এর জন্য খালি string বানানো
        const b = Object.fromEntries(Object.entries(data.product).map(([k, v]) => [k, v ?? ""]));
        setBook(b);
      })
      .catch(() => setError("বই load করা যায়নি"));
  }, [id]);

  const save = async ({ _id, createdAt, rating, reviews, sold, ...fields }) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ icon: "success", title: "আপডেট হয়েছে", timer: 1200, showConfirmButton: false });
      router.push("/admin/products");
    } else {
      Swal.fire("সমস্যা হয়েছে", data.message || "আপডেট করা যায়নি", "error");
    }
  };

  if (error) return <p className="p-5 text-error">{error}</p>;
  if (!book)
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl font-bold">বই এডিট করুন</h1>
      <BookForm initial={book} submitLabel="আপডেট করুন" onSubmit={save} />
    </div>
  );
}
