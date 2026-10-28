



"use client";
import BookCover from "@/components/books/BookCover";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import CouponInput from "@/components/CouponInput";

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useCart();

  const [coupon, setCoupon] = useState(null);
  const [couponBoxKey, setCouponBoxKey] = useState(0);

  const qtyOf = (item) => Math.max(1, Number(item.qty) || 1);
  const maxOf = (item) => (Number(item.stock) > 0 ? Number(item.stock) : 99);

  // পরিমাণ বদলালে মোট দাম বদলায়, তাই আগের কুপন বাতিল করে আবার দিতে হবে
  const changeQty = (item, next) => {
    if (next < 1 || next > maxOf(item) || next === qtyOf(item)) return;
    updateQty(item._id, next);
    if (coupon) {
      setCoupon(null);
      localStorage.removeItem("appliedCoupon");
      setCouponBoxKey((k) => k + 1); // কুপন বক্স রিসেট
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Item?",
      text: "This item will be removed from cart",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(id);
        setCoupon(null);
        localStorage.removeItem("appliedCoupon");
        setCouponBoxKey((k) => k + 1);
        Swal.fire("Deleted!", "Item removed from cart", "success");
      }
    });
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * qtyOf(item),
    0
  );

  const discountAmount = coupon ? coupon.discountAmount : 0;
  const finalAmount    = coupon ? coupon.finalAmount    : totalPrice;

  const handleApplyCoupon = (result) => {
    setCoupon(result);
    localStorage.setItem("appliedCoupon", JSON.stringify({
      code:           result.code,
      discountAmount: result.discountAmount,
      finalAmount:    result.finalAmount,
      originalAmount: totalPrice,
    }));
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    localStorage.removeItem("appliedCoupon");
  };

  const handleCheckout = async () => {
    try {
      if (totalPrice <= 0) {
        Swal.fire("Error", "কার্ট খালি", "error");
        return;
      }

      if (coupon) {
        const validateRes = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code:        coupon.code,
            orderAmount: totalPrice,
            userEmail:   "customer@test.com",
          }),
        });

        const validateData = await validateRes.json();

        if (!validateData.success) {
          Swal.fire("Coupon Error", validateData.message, "error");
          setCoupon(null);
          localStorage.removeItem("appliedCoupon");
          return;
        }
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:         finalAmount,
          name:           "Barakah Books Customer",
          email:          "customer@test.com",
          phone:          "01700000000",
          products:       cart.map((item) => ({
            _id:   item._id,
            title: item.title,
            price: item.price,
            qty:   qtyOf(item),
          })),
          couponCode:     coupon?.code        || null,
          originalAmount: totalPrice,
          discountAmount: discountAmount,
        }),
      });

      const data = await res.json();

      console.log(data);

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        Swal.fire(
          "Payment Error",
          data.message || "Payment initialization failed",
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-5">
        🛒 আমার কার্ট
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg">আপনার কার্ট খালি</p>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 sm:gap-4 border p-3 sm:p-4 rounded-xl shadow-sm items-center bg-white"
              >
                {/* IMAGE */}
                <div className="w-14 sm:w-20 flex-shrink-0">
                  <BookCover book={item} size="sm" />
                </div>

                {/* DETAILS */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-lg truncate">
                    {item.title}
                  </h2>

                  <p className="text-gray-500 text-xs sm:text-sm truncate">
                    {item.description || "No description"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* QUANTITY */}
                    <div className="join border border-base-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => changeQty(item, qtyOf(item) - 1)}
                        disabled={qtyOf(item) <= 1}
                        className="btn btn-sm join-item btn-ghost px-3 text-lg"
                        aria-label="পরিমাণ কমান"
                      >
                        −
                      </button>
                      <span className="join-item flex w-10 items-center justify-center font-semibold">
                        {qtyOf(item)}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item, qtyOf(item) + 1)}
                        disabled={qtyOf(item) >= maxOf(item)}
                        className="btn btn-sm join-item btn-ghost px-3 text-lg"
                        aria-label="পরিমাণ বাড়ান"
                      >
                        +
                      </button>
                    </div>

                    {/* PRICE */}
                    <p className="text-primary font-bold text-sm sm:text-base">
                      TK {Number(item.price || 0) * qtyOf(item)}
                      {qtyOf(item) > 1 && (
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          (TK {item.price} × {qtyOf(item)})
                        </span>
                      )}
                    </p>
                  </div>

                  {qtyOf(item) >= maxOf(item) && Number(item.stock) > 0 && (
                    <p className="mt-1 text-xs text-warning">স্টকে আর নেই</p>
                  )}
                </div>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-error btn-sm flex-shrink-0"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* COUPON INPUT */}
          <CouponInput
            key={couponBoxKey}
            orderAmount={totalPrice}
            userEmail="customer@test.com"
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
          />

          {/* PRICE SUMMARY */}
          <div className="mt-4 border rounded-xl p-4 bg-white space-y-2">
            <div className="flex justify-between text-sm sm:text-lg">
              <span className="text-gray-600">মোট দাম</span>
              <span>TK {totalPrice}</span>
            </div>

            {coupon && (
              <div className="flex justify-between text-success font-semibold text-sm sm:text-base">
                <span>Discount ({coupon.code})</span>
                <span>- TK {coupon.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-xl font-bold border-t pt-2">
              <span>সর্বমোট</span>
              <span className="text-primary">TK {finalAmount}</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCheckout}
              className="btn btn-success btn-md sm:btn-lg w-full sm:w-auto"
            >
              অর্ডার করুন
            </button>
          </div>
        </>
      )}
    </div>
  );
}
