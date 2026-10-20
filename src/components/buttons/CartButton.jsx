"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiShoppingCart } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "@/provider/AuthProvider";
import { useCart } from "@/context/CartContext";

const CartButton = ({ product, compact = false, disabled = false }) => {
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const inCart = cart?.some((item) => item._id === product._id);

  const handleAddToCart = async () => {
    if (inCart) {
      router.push("/cart");
      return;
    }
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "লগইন করুন",
        text: "কার্টে বই রাখতে আগে লগইন করতে হবে",
        confirmButtonColor: "#0f5c45",
      });
      router.push(`/login?callbackUrl=${path}`);
      return;
    }
    setIsLoading(true);
    addToCart(product);
    Swal.fire({
      icon: "success",
      title: "কার্টে যোগ হয়েছে",
      showConfirmButton: false,
      timer: 1100,
    });
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || disabled}
      className={`btn ${inCart ? "btn-outline btn-primary" : "btn-primary"} w-full ${compact ? "btn-sm" : ""}`}
    >
      <FiShoppingCart />
      {disabled ? "স্টক শেষ" : inCart ? "কার্টে আছে" : isLoading ? "যোগ হচ্ছে..." : "কার্টে যোগ করুন"}
    </button>
  );
};

export default CartButton;
