"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ book, withText = false, className = "" }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const active = isInWishlist(book._id);

  if (withText) {
    return (
      <button
        onClick={() => toggleWishlist(book)}
        className={`btn btn-outline border-base-300 ${active ? "text-error" : ""} ${className}`}
      >
        {active ? <FaHeart /> : <FaRegHeart />}
        {active ? "উইশলিস্টে আছে" : "উইশলিস্টে রাখুন"}
      </button>
    );
  }

  return (
    <button
      onClick={() => toggleWishlist(book)}
      aria-label={active ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে রাখুন"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 ${className}`}
    >
      {active ? <FaHeart className="text-error" /> : <FaRegHeart className="text-base-content/50" />}
    </button>
  );
}
