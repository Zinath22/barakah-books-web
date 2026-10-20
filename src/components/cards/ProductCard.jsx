"use client";

import Link from "next/link";
import BookCover from "@/components/books/BookCover";
import WishlistButton from "@/components/books/WishlistButton";
import Stars from "@/components/books/Stars";
import CartButton from "@/components/buttons/CartButton";
import { discountPercent, inStock, taka, toBn } from "@/lib/books";

// বইয়ের কার্ড (ফাইলের নাম আগের মতো রাখা হয়েছে, যাতে অন্য জায়গার import না ভাঙে)
export default function ProductCard({ product: book }) {
  if (!book) return null;
  const off = discountPercent(book);
  const available = inStock(book);

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-base-300 bg-base-100 p-3 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative rounded-xl bg-base-200 px-6 pb-4 pt-5">
        <Link href={`/products/${book._id}`} className="block transition group-hover:scale-[1.03]">
          <BookCover book={book} />
        </Link>
        {off > 0 && (
          <span className="badge badge-secondary badge-sm absolute left-2 top-2 font-semibold">
            {toBn(off)}% ছাড়
          </span>
        )}
        <WishlistButton book={book} className="absolute right-2 top-2" />
        {!available && (
          <span className="badge badge-error badge-sm absolute bottom-2 left-1/2 -translate-x-1/2 text-white">
            স্টক শেষ
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link href={`/products/${book._id}`}>
          <h3 className="line-clamp-2 font-semibold leading-snug hover:text-primary">{book.title}</h3>
        </Link>
        {book.author && <p className="mt-0.5 line-clamp-1 text-sm text-base-content/60">{book.author}</p>}
        <div className="mt-1.5">
          <Stars rating={book.rating} count={book.reviews || 0} />
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{taka(book.price)}</span>
            {off > 0 && <span className="text-sm text-base-content/40 line-through">{taka(book.originalPrice)}</span>}
          </div>
          <CartButton product={book} compact disabled={!available} />
        </div>
      </div>
    </div>
  );
}
