"use client";

import Link from "next/link";
import BookCover from "@/components/books/BookCover";
import { useCart } from "@/context/CartContext";

export default function DashboardLayout({ children }) {
  const { cart } = useCart();

  return (
    <div className="flex min-h-screen">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-base-200 p-4">

        <h2 className="text-xl font-bold mb-4">
          👤 User Dashboard
        </h2>

        {/* MENU */}
        <ul className="space-y-2 mb-5">
          <li>
            <Link href="/" className="btn btn-sm w-full">
              Home
            </Link>
          </li>

          {/* <li>
            <Link href="/dashboard/cart" className="btn btn-sm w-full">
              My Cart
            </Link>
          </li> */}
        </ul>

        {/* 🔥 CART ITEMS IN SIDEBAR */}
        <div>
          <h3 className="font-semibold mb-2">
            🛒 Cart Items ({cart.length})
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">
                No items
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-2 bg-white p-2 rounded"
                >
                  <div className="w-9 flex-shrink-0">
                    <BookCover book={item} size="sm" />
                  </div>

                  <div className="text-xs">
                    <p className="font-medium line-clamp-1">
                      {item.title}
                    </p>
                    <p>৳ {item.price}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-5">
        {children}
      </div>

    </div>
  );
}