"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiMenu, FiX, FiHeart, FiSearch, FiPhone } from "react-icons/fi";
import NavLink from "../buttons/NavLinks";
import Logo from "./Logo";
import { useAuth } from "@/provider/AuthProvider";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toBn } from "@/lib/books";

// আজকের হিজরি তারিখ (browser এ হিসাব হয়, তাই useEffect)
function useHijriDate() {
  const [date, setDate] = useState("");
  useEffect(() => {
    try {
      const parts = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t)?.value || "";
      setDate(`${get("day")} ${get("month")} ${get("year")} হিজরি`);
    } catch {
      setDate("");
    }
  }, []);
  return date;
}

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/products", label: "সব বই" },
  { href: "/products?sort=popular", label: "বেস্টসেলার" },
  { href: "/products?sort=discount", label: "অফার" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const router = useRouter();
  const hijri = useHijriDate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const close = () => setMenuOpen(false);

  const search = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
    close();
  };

  const Avatar = ({ size = "w-9 h-9" }) =>
    user?.photoURL ? (
      <img src={user.photoURL} alt="" className={`${size} rounded-full border-2 border-secondary object-cover`} />
    ) : (
      <div className={`${size} flex items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content`}>
        {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
      </div>
    );

  const userLinks = (
    <>
      <li><Link href="/dashboard" onClick={close}>📦 আমার অর্ডার</Link></li>
      <li>
        <Link href="/wishlist" onClick={close}>
          ❤️ উইশলিস্ট
          {wishlistCount > 0 && <span className="badge badge-sm ml-auto">{toBn(wishlistCount)}</span>}
        </Link>
      </li>
      {user?.role === "admin" && <li><Link href="/admin" onClick={close}>⚙️ অ্যাডমিন প্যানেল</Link></li>}
      <li className="mt-1 border-t border-base-300 pt-1">
        <button onClick={() => { logout(); close(); }} className="text-error">🚪 লগআউট</button>
      </li>
    </>
  );

  return (
    <div className="sticky top-0 z-50">
      {/* উপরের সরু পট্টি */}
      <div className="bg-primary text-primary-content">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 text-xs sm:px-6 lg:px-8">
          <span className="truncate">🌙 {hijri ? `আজ ${hijri}` : "আসসালামু আলাইকুম"}</span>
          <span className="hidden sm:inline">🚚 সারাদেশে ক্যাশ অন ডেলিভারি</span>
          <span className="hidden items-center gap-1 md:flex"><FiPhone /> ০১৭০০-০০০০০০</span>
        </div>
      </div>

      <div className="border-b border-base-300 bg-base-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-3 py-2.5 sm:px-6 lg:px-8">
          <Logo />

          {/* desktop search */}
          <form onSubmit={search} className="mx-auto hidden max-w-md flex-1 md:flex">
            <label className="input input-bordered input-sm flex h-10 w-full items-center gap-2 rounded-full bg-base-200">
              <FiSearch className="opacity-50" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="বই, লেখক বা প্রকাশনী খুঁজুন"
                className="grow"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <Link href="/wishlist" className="btn btn-ghost btn-circle btn-sm relative" aria-label="উইশলিস্ট">
              <FiHeart size={19} />
              {wishlistCount > 0 && (
                <span className="badge badge-error badge-xs absolute -right-0.5 -top-0.5 text-white">{toBn(wishlistCount)}</span>
              )}
            </Link>
            <Link href="/cart" className="btn btn-ghost btn-circle btn-sm relative" aria-label="কার্ট">
              <FiShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="badge badge-secondary badge-xs absolute -right-0.5 -top-0.5">{toBn(cartCount)}</span>
              )}
            </Link>

            {user ? (
              <div className="dropdown dropdown-end hidden lg:block">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <Avatar />
                </div>
                <ul tabIndex={0} className="menu dropdown-content z-50 mt-2 w-56 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">
                  <li className="menu-title">
                    <span className="truncate text-base-content">{user.name || "ব্যবহারকারী"}</span>
                    <span className="truncate text-xs font-normal">{user.email}</span>
                  </li>
                  {userLinks}
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm hidden rounded-full px-5 lg:flex">
                লগইন
              </Link>
            )}

            <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="মেনু">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* desktop links */}
        <nav className="hidden border-t border-base-300 lg:block">
          <ul className="mx-auto flex max-w-7xl items-center gap-7 px-8 py-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}><NavLink href={l.href}>{l.label}</NavLink></li>
            ))}
          </ul>
        </nav>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="border-b border-base-300 bg-base-100 px-4 pb-4 shadow-md lg:hidden">
          <form onSubmit={search} className="py-3 md:hidden">
            <label className="input input-bordered flex items-center gap-2 rounded-full">
              <FiSearch className="opacity-50" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="বই খুঁজুন" className="grow" />
            </label>
          </form>
          <ul className="menu w-full gap-1 px-0">
            {LINKS.map((l) => (
              <li key={l.href}><NavLink href={l.href} onClick={close}>{l.label}</NavLink></li>
            ))}
          </ul>
          <div className="mt-2 border-t border-base-300 pt-3">
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-base-200 p-2">
                  <Avatar size="w-10 h-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name || "ব্যবহারকারী"}</p>
                    <p className="truncate text-xs text-base-content/50">{user.email}</p>
                  </div>
                </div>
                <ul className="menu w-full px-0">{userLinks}</ul>
              </>
            ) : (
              <Link href="/login" onClick={close} className="btn btn-primary w-full">লগইন</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
