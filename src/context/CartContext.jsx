"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/provider/AuthProvider";

const CartContext = createContext(null);

// 🔥 SAFE HOOK
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔥 UNIQUE CART KEY PER USER
  const cartKey = user?.email
    ? `cart_${user.email}`
    : "cart_guest";

  // 🔥 LOAD USER CART
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(cartKey);

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setCart(parsed);
          } else {
            setCart([]);
          }
        } else {
          setCart([]);
        }
      } catch (err) {
        console.log("Cart parse error:", err);

        localStorage.removeItem(cartKey);
        setCart([]);
      }

      setIsLoaded(true);
    }
  }, [cartKey]);

  // 🔥 SAVE USER CART
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
      );
    }
  }, [cart, cartKey, isLoaded]);

  // 🔥 CLEAR CART ON LOGOUT EVENT
  useEffect(() => {
    const handleClearCart = () => {
      setCart([]);
    };

    window.addEventListener(
      "clear-cart",
      handleClearCart
    );

    return () => {
      window.removeEventListener(
        "clear-cart",
        handleClearCart
      );
    };
  }, []);

  // 🔥 ADD TO CART
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(
        (item) => item._id === product._id
      );

      if (exists) return prev;

      return [...prev, product];
    });
  };

  // 🔥 REMOVE ITEM
  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter((item) => item._id !== id)
    );
  };

  // 🔥 CLEAR CART
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(cartKey);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};