"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function CouponInput({ orderAmount, userEmail, onApply, onRemove }) {
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Swal.fire("Error", "Please enter a coupon code", "error");
      return;
    }

    if (!orderAmount || Number(orderAmount) <= 0) {
      Swal.fire("Error", "Cart is empty", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/coupons/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          code:        trimmedCode,
          orderAmount: Number(orderAmount),
          userEmail:   userEmail || "",
        }),
      });

      const data = await res.json();

      console.log("COUPON VALIDATE RESPONSE:", data);

      if (!data.success) {
        Swal.fire("Invalid Coupon", data.message || "Coupon is not valid", "error");
        return;
      }

      setApplied(true);

      Swal.fire(
        "Coupon Applied! 🎉",
        `You saved TK ${data.discountAmount}`,
        "success"
      );

      onApply({
        code:           data.coupon.code,
        discountAmount: data.discountAmount,
        finalAmount:    data.finalAmount,
      });
    } catch (error) {
      console.log("COUPON ERROR:", error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setApplied(false);
    onRemove();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleApply();
  };

  return (
    <div className="mt-4 border rounded-lg p-4 bg-base-100">
      <p className="font-semibold mb-2">🏷️ Have a coupon?</p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          className="input input-bordered w-full uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          disabled={applied || loading}
        />

        {!applied ? (
          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Apply"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-error"
          >
            Remove
          </button>
        )}
      </div>

      {applied && (
        <p className="text-success font-semibold mt-2">
          ✅ Coupon <span className="font-bold">{code}</span> applied!
        </p>
      )}
    </div>
  );
}
