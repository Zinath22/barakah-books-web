"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import Link from "next/link";
import BookCover from "@/components/books/BookCover";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = (id) => {
    removeFromWishlist(id);
    Swal.fire({
      icon: "success",
      title: "Removed from Wishlist",
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      timer: 1000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      <div className="flex items-center gap-3 mb-6">
        <FaHeart className="text-red-500 text-2xl" />
        <h1 className="text-xl sm:text-2xl font-bold">আমার উইশলিস্ট</h1>
        <span className="badge badge-primary">{wishlist.length}</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow border">
          <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          <Link href="/products">
            <button className="btn btn-primary">Browse Products</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="flex flex-wrap sm:flex-nowrap gap-4 bg-white border rounded-xl p-4 shadow-sm items-center"
            >
              <div className="w-16 flex-shrink-0">
                <BookCover book={product} size="sm" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm sm:text-lg truncate">{product.title}</h2>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{product.description}</p>
                <p className="text-primary font-bold mt-1">TK {product.price}</p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary btn-sm"
                >
                  <FaShoppingCart />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>

                <button
                  onClick={() => handleRemove(product._id)}
                  className="btn btn-error btn-sm"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
