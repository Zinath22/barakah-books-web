"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/provider/AuthProvider";

const WishlistContext = createContext(null);

// Provider না পেলে (যেমন dev ক্যাশের সমস্যায় সার্ভার রেন্ডারের সময়) পেজ না ভেঙে খালি wishlist দেয়
const fallbackWishlist = {
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => {},
  isInWishlist: () => false,
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("useWishlist: WishlistProvider পাওয়া যায়নি, খালি wishlist ব্যবহার হচ্ছে");
    }
    return fallbackWishlist;
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const wishlistKey = user?.email ? `wishlist_${user.email}` : "wishlist_guest";

  // Load wishlist from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(wishlistKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWishlist(parsed);
          else setWishlist([]);
        } else {
          setWishlist([]);
        }
      } catch (err) {
        localStorage.removeItem(wishlistKey);
        setWishlist([]);
      }
      setIsLoaded(true);
    }
  }, [wishlistKey]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    }
  }, [wishlist, wishlistKey, isLoaded]);

  // Add to wishlist
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  // Remove from wishlist
  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id));
  };

  // Toggle wishlist
  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item._id === product._id);
    if (exists) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  // Check if in wishlist
  const isInWishlist = (id) => wishlist.some((item) => item._id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
