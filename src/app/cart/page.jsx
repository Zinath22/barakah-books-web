



"use client";
import BookCover from "@/components/books/BookCover";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/provider/AuthProvider";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import CouponInput from "@/components/CouponInput";
import CheckoutDetails from "@/components/CheckoutDetails";
import { normalizePhone, shippingError } from "@/lib/orders";

const EMPTY_INFO = { name: "", phone: "", address: "", note: "" };

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [coupon, setCoupon] = useState(null);
  const [couponBoxKey, setCouponBoxKey] = useState(0);

  // ডেলিভারির তথ্য আর পেমেন্টের ধরন — আগের অর্ডারের তথ্য মনে রাখা হয়
  const [info, setInfo] = useState(EMPTY_INFO);
  const [method, setMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("checkoutInfo") || "null");
      if (saved) {
        setInfo({ ...EMPTY_INFO, ...saved });
        if (saved.method) setMethod(saved.method);
      }
    } catch {}
  }, []);

  // নাম খালি থাকলে লগইন করা ইউজারের নাম বসানো
  useEffect(() => {
    if (user?.name) setInfo((i) => (i.name ? i : { ...i, name: user.name }));
  }, [user?.name]);

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
    if (placing) return;
    try {
      if (totalPrice <= 0) {
        Swal.fire("Error", "কার্ট খালি", "error");
        return;
      }

      // অর্ডার করতে লগইন লাগবে (অর্ডারটা কার, সেটা জানতে)
      if (!user?.email) {
        const go = await Swal.fire({
          icon: "info",
          title: "অর্ডার করতে লগইন করুন",
          showCancelButton: true,
          confirmButtonText: "লগইন",
          cancelButtonText: "পরে",
        });
        if (go.isConfirmed) router.push("/login");
        return;
      }

      // ডেলিভারির তথ্য যাচাই
      const shipping = {
        name: info.name.trim(),
        phone: normalizePhone(info.phone),
        address: info.address.trim(),
        note: info.note.trim(),
      };
      const err = shippingError(shipping);
      if (err) {
        Swal.fire("তথ্য অসম্পূর্ণ", err, "warning");
        return;
      }
      // পরের বারের জন্য আর অনলাইন পেমেন্টের পর অর্ডার সেভের জন্য রাখা
      localStorage.setItem("checkoutInfo", JSON.stringify({ ...shipping, method }));

      setPlacing(true);

      if (coupon) {
        const validateRes = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code:        coupon.code,
            orderAmount: totalPrice,
            userEmail:   user.email,
          }),
        });

        const validateData = await validateRes.json();

        if (!validateData.success) {
          Swal.fire("Coupon Error", validateData.message, "error");
          setCoupon(null);
          localStorage.removeItem("appliedCoupon");
          setCouponBoxKey((k) => k + 1);
          return;
        }
      }

      const products = cart.map((item) => ({
        _id:   item._id,
        title: item.title,
        author: item.author || "",
        img:   item.img || item.image || "",
        price: item.price,
        qty:   qtyOf(item),
      }));

      // ===== ক্যাশ অন ডেলিভারি: পেমেন্ট ছাড়াই সরাসরি অর্ডার সেভ =====
      if (method === "cod") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail:      user.email,
            products,
            total:          finalAmount,
            originalAmount: totalPrice,
            discountAmount: discountAmount,
            couponCode:     coupon?.code || null,
            paymentMethod:  "COD",
            shipping,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          Swal.fire("অর্ডার হয়নি", data.message || "আবার চেষ্টা করুন", "error");
          return;
        }
        clearCart();
        localStorage.removeItem("appliedCoupon");
        await Swal.fire({
          icon: "success",
          title: "অর্ডার সম্পন্ন হয়েছে!",
          html: `বই হাতে পেয়ে ডেলিভারিম্যানকে <b>৳ ${finalAmount}</b> দেবেন।<br/>অর্ডারের অবস্থা "আমার অর্ডার" পেজে দেখতে পাবেন।`,
          confirmButtonText: "আমার অর্ডার দেখুন",
          confirmButtonColor: "#1b5e45",
        });
        router.push("/dashboard");
        return;
      }

      // ===== অনলাইন পেমেন্ট (SSLCommerz) =====
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:         finalAmount,
          name:           shipping.name,
          email:          user.email,
          phone:          shipping.phone,
          address:        shipping.address,
          products,
          couponCode:     coupon?.code        || null,
          originalAmount: totalPrice,
          discountAmount: discountAmount,
        }),
      });

      const data = await res.json();

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
    } finally {
      setPlacing(false);
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
            userEmail={user?.email || ""}
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

          {/* DELIVERY INFO + PAYMENT METHOD */}
          <CheckoutDetails info={info} onInfo={setInfo} method={method} onMethod={setMethod} />

          {/* CHECKOUT BUTTON */}
          <div className="mt-4 flex flex-col items-stretch gap-2 sm:items-end">
            <button
              onClick={handleCheckout}
              disabled={placing}
              className="btn btn-success btn-md sm:btn-lg w-full sm:w-auto"
            >
              {placing
                ? "অপেক্ষা করুন..."
                : method === "cod"
                ? `অর্ডার নিশ্চিত করুন (৳ ${finalAmount})`
                : `পেমেন্ট করুন (৳ ${finalAmount})`}
            </button>
            <p className="text-center text-xs text-gray-500 sm:text-right">
              {method === "cod"
                ? "বই হাতে পেয়ে টাকা দেবেন"
                : "SSLCommerz এর নিরাপদ পেমেন্ট পেজে নিয়ে যাওয়া হবে"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
