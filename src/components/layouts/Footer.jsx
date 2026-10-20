import Link from "next/link";
import { FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import Logo from "./Logo";
import { CATEGORY_VALUES, toBn } from "@/lib/books";

const Footer = () => (
  <div className="islamic-pattern bg-neutral text-neutral-content">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <div>
        <Logo light />
        <p className="mt-4 text-sm leading-relaxed text-neutral-content/70">
          বিশুদ্ধ জ্ঞানের আলো ঘরে ঘরে পৌঁছে দেওয়াই আমাদের লক্ষ্য। নির্ভরযোগ্য লেখক ও প্রকাশনীর ইসলামিক বই — সারাদেশে
          হোম ডেলিভারি।
        </p>
        <div className="mt-5 flex gap-2">
          {[FaFacebookF, FaYoutube, FaWhatsapp].map((Icon, i) => (
            <a key={i} href="#" className="btn btn-circle btn-sm border-0 bg-white/10 text-neutral-content hover:bg-secondary hover:text-secondary-content" aria-label="social">
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-secondary">ক্যাটাগরি</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-neutral-content/70 md:grid-cols-1">
          {CATEGORY_VALUES.map((c) => (
            <li key={c}>
              <Link href={`/products?category=${encodeURIComponent(c)}`} className="hover:text-secondary">{c}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-secondary">প্রয়োজনীয় লিংক</h3>
        <ul className="space-y-2 text-sm text-neutral-content/70">
          <li><Link href="/products" className="hover:text-secondary">সব বই</Link></li>
          <li><Link href="/products?sort=popular" className="hover:text-secondary">বেস্টসেলার</Link></li>
          <li><Link href="/products?sort=discount" className="hover:text-secondary">অফার</Link></li>
          <li><Link href="/dashboard" className="hover:text-secondary">আমার অর্ডার</Link></li>
          <li><Link href="/wishlist" className="hover:text-secondary">উইশলিস্ট</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-secondary">যোগাযোগ</h3>
        <ul className="space-y-3 text-sm text-neutral-content/70">
          <li className="flex gap-2"><FiMapPin className="mt-0.5 shrink-0" /> ঢাকা, বাংলাদেশ</li>
          <li className="flex gap-2"><FiPhone className="mt-0.5 shrink-0" /> ০১৭০০-০০০০০০</li>
          <li className="flex gap-2"><FiMail className="mt-0.5 shrink-0" /> info@barakahbooks.com</li>
        </ul>
        <p className="mt-5 mb-2 text-xs text-neutral-content/50">পেমেন্ট</p>
        <div className="flex flex-wrap gap-1.5">
          {["ক্যাশ অন ডেলিভারি", "বিকাশ", "নগদ", "কার্ড"].map((m) => (
            <span key={m} className="rounded-md bg-white/10 px-2 py-1 text-xs">{m}</span>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-white/10">
      <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-neutral-content/50">
        © {toBn(new Date().getFullYear())} বারাকাহ বুকস। সর্বস্বত্ব সংরক্ষিত।
      </p>
    </div>
  </div>
);

export default Footer;
