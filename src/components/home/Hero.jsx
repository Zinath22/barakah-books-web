"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BookCover from "@/components/books/BookCover";

// ===================================================================
// স্লাইডগুলো — লেখা, বাটন বা ছবি বদলাতে চাইলে শুধু এখানে বদলান
//
// type: "design" → সবুজ ইসলামিক নকশা + ডানে ৩টা হেলানো বই
// type: "photo"  → এক পাশে ছবি, অন্য পাশে লেখা + টিক চিহ্নের তালিকা
// type: "image"  → Canva/Photoshop এ বানানো পুরো ব্যানারের ছবি
//                   banner = কম্পিউটারের ছবি (চওড়া, যেমন ১৬০০×৬০০)
//                   bannerMobile = মোবাইলের ছবি (লম্বা, যেমন ৮০০×১০০০) — না দিলে banner টাই দেখাবে
//
// শিরোনাম: title (১ম লাইন) + line2 (২য় লাইন) + highlight (রঙিন শব্দ)
// ===================================================================
const SLIDES = [
  {
    type: "design",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    title: "জ্ঞানের আলোয়",
    line2: "আলোকিত হোক",
    highlight: "জীবন",
    text: "কুরআন, হাদিস, সীরাত, ফিকহ আর শিশুদের ইসলামিক বই — নির্ভরযোগ্য লেখক ও প্রকাশনীর বাছাই করা সংগ্রহ, আপনার দোরগোড়ায়।",
    button: "সব বই দেখুন",
    href: "/products",
    images: ["/assets/images1.jpg"],
  },
  {
    type: "photo",
    photo: "/assets/cover.jpg",
    kicker: "আপনার ঘরে আনুন",
    title: "কুরআনুল",
    highlight: "কারীম",
    line2: "অনুবাদ ও তাফসীর সহ",
    points: ["সহজ বাংলা অনুবাদ", "নির্ভরযোগ্য তাফসীর", "মজবুত হার্ডকভার বাঁধাই", "সারাদেশে দ্রুত ডেলিভারি"],
    button: "কুরআন ও তাফসীর দেখুন",
    category: "কুরআন ও তাফসীর",
  },
  {
    type: "design",
    arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
    title: "প্রিয় নবীজির (সা.)",
    line2: "জীবন থেকে",
    highlight: "শিখুন",
    text: "রাসূলুল্লাহ (সা.)-এর জীবন, চরিত্র আর শিক্ষা — সীরাতের সেরা বইগুলো এক জায়গায়।",
    button: "সীরাতের বই",
    category: "সীরাত",
  },
  {
    type: "design",
    arabic: "قَالَ رَسُولُ اللَّهِ ﷺ",
    title: "সহীহ হাদিসের",
    line2: "নির্ভরযোগ্য",
    highlight: "সংকলন",
    text: "বুখারী, মুসলিম থেকে রিয়াদুস সালেহীন — দৈনন্দিন জীবনের জন্য নবীজির (সা.) বাণী।",
    button: "হাদিসের বই",
    category: "হাদিস",
  },
  {
    type: "photo",
    photo: "/assets/images2.jpg",
    photoFit: "contain", // বইয়ের ছবি কাটা না পড়ে পুরোটা দেখাবে
    kicker: "সীমিত সময়ের জন্য",
    title: "বিশেষ",
    highlight: "ছাড়",
    line2: "প্রিয় বইগুলোতে",
    points: ["নির্বাচিত বইয়ে বড় ছাড়", "ক্যাশ অন ডেলিভারি", "ত্রুটিপূর্ণ বই বদলের সুবিধা", "সারাদেশে হোম ডেলিভারি"],
    button: "অফারের বই দেখুন",
    href: "/products?sort=discount",
  },
  // পুরো ব্যানারের ছবি দিতে চাইলে এভাবে যোগ করুন:
  // { type: "image", banner: "https://i.ibb.co/.../desktop.jpg", bannerMobile: "https://i.ibb.co/.../mobile.jpg", href: "/products", alt: "ব্যানারের বর্ণনা" },
];

const INTERVAL = 5000; // কত সময় পর পর স্লাইড বদলাবে (মিলিসেকেন্ড)
const FALLBACK_IMAGES = ["/assets/images1.jpg", "/assets/images2.jpg", "/assets/cover.jpg"];

const hrefFor = (s) => s.href || (s.category ? `/products?category=${encodeURIComponent(s.category)}` : "/products");

// design স্লাইডের ৩টা বই
function pickBooks(slide, books) {
  if (slide.images?.length) {
    return [0, 1, 2].map((i) => ({ title: "বারাকাহ বুকস", img: slide.images[i] || slide.images[0] }));
  }
  const withImg = (list) => [...list].sort((a, b) => Number(!!b.img) - Number(!!a.img));
  let list = slide.category ? withImg(books.filter((b) => b.category === slide.category)) : [];
  if (list.length < 3) list = [...list, ...withImg(books.filter((b) => !list.includes(b)))];
  list = list.slice(0, 3);
  return [0, 1, 2].map((i) => list[i] || { title: "বারাকাহ বুকস", img: FALLBACK_IMAGES[i] });
}

// ===== ধরন ১: সবুজ ইসলামিক নকশা =====
function DesignSlide({ s, active, books }) {
  const stack = pickBooks(s, books);
  const link = (b) => (b._id ? `/products/${b._id}` : hrefFor(s));
  return (
    <div className="islamic-pattern relative h-full overflow-hidden bg-primary text-primary-content">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative grid h-full items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[1.2fr_1fr] md:gap-10 md:py-16 lg:px-14">
        <div className={`transition-transform duration-700 ${active ? "translate-y-0" : "translate-y-4"}`}>
          <p className="font-arabic text-left text-2xl text-secondary sm:text-3xl" lang="ar" dir="rtl">
            {s.arabic}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {s.title} <br className="hidden sm:block" />
            {s.line2} <span className="text-secondary">{s.highlight}</span>
          </h2>
          <p className="mt-4 max-w-lg text-primary-content/80">{s.text}</p>
          <Link href={hrefFor(s)} tabIndex={active ? 0 : -1} className="btn btn-secondary mt-7 gap-2 rounded-full px-7">
            {s.button} <FiArrowRight />
          </Link>
        </div>

        {/* ৩টা হেলানো বই — মোবাইলে একটু ছোট */}
        <div
          className={`relative mx-auto h-56 w-56 transition-all duration-700 md:h-80 md:w-72 ${
            active ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <Link href={link(stack[1])} tabIndex={-1} className="absolute left-0 top-8 w-28 -rotate-12 transition hover:-rotate-6 md:top-10 md:w-40">
            <BookCover book={stack[1]} />
          </Link>
          <Link href={link(stack[2])} tabIndex={-1} className="absolute right-0 top-8 w-28 rotate-12 transition hover:rotate-6 md:top-10 md:w-40">
            <BookCover book={stack[2]} />
          </Link>
          <Link
            href={link(stack[0])}
            tabIndex={-1}
            className="absolute left-1/2 top-0 z-10 w-32 -translate-x-1/2 transition hover:-translate-y-2 md:w-44"
          >
            <BookCover book={stack[0]} />
          </Link>
          <div className="absolute -bottom-2 left-1/2 h-4 w-48 -translate-x-1/2 rounded-full bg-black/25 blur-md md:w-64" />
        </div>
      </div>
    </div>
  );
}

// ===== ধরন ২: এক পাশে ছবি, অন্য পাশে লেখা =====
function PhotoSlide({ s, active }) {
  const contain = s.photoFit === "contain";
  return (
    <div className="grid h-full bg-base-100 md:grid-cols-2">
      <div className={`relative h-56 overflow-hidden sm:h-72 md:h-auto ${contain ? "bg-white" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.photo}
          alt=""
          className={`absolute inset-0 h-full w-full transition-transform duration-[6000ms] ease-out ${
            contain ? "object-contain p-6" : "object-cover"
          } ${active ? "scale-105" : "scale-100"}`}
        />
        {/* ছবি আর লেখার মাঝের হালকা ভাঁজ */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-base-300 md:block" />
      </div>

      <div
        className={`flex flex-col justify-center px-6 py-8 transition-transform duration-700 sm:px-10 md:py-12 lg:px-14 ${
          active ? "translate-y-0" : "translate-y-4"
        }`}
      >
        {s.kicker && <p className="text-lg text-base-content/70 sm:text-xl">{s.kicker}</p>}
        <h2 className="mt-1 text-4xl font-bold leading-none sm:text-5xl lg:text-6xl">
          {s.title} <span className="text-primary">{s.highlight}</span>
        </h2>
        {s.line2 && <p className="mt-3 text-xl font-medium text-base-content/80 sm:text-2xl">{s.line2}</p>}

        {s.points?.length > 0 && (
          <ul className="mt-5 max-w-md divide-y divide-base-300 border-y border-base-300">
            {s.points.map((pt) => (
              <li key={pt} className="flex items-center justify-between gap-3 py-2 text-base sm:text-lg">
                {pt}
                <FiCheckCircle className="shrink-0 text-xl text-success" aria-hidden />
              </li>
            ))}
          </ul>
        )}

        <Link
          href={hrefFor(s)}
          tabIndex={active ? 0 : -1}
          className="btn btn-primary mt-6 max-w-md gap-2 rounded-full text-base"
        >
          {s.button} <FiArrowRight />
        </Link>
      </div>
    </div>
  );
}

// ===== ধরন ৩: পুরো ব্যানারের ছবি =====
function ImageSlide({ s, active }) {
  return (
    <Link href={hrefFor(s)} tabIndex={active ? 0 : -1} className="block h-full bg-base-200">
      <picture>
        {s.bannerMobile && <source media="(max-width: 767px)" srcSet={s.bannerMobile} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.banner} alt={s.alt || "ব্যানার"} className="h-full w-full object-cover" />
      </picture>
    </Link>
  );
}

export default function Hero({ books = [] }) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const touchX = useRef(null);
  const count = SLIDES.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // অটো স্লাইড — প্রতি INTERVAL পর পর পরের স্লাইড।
  // হাতে স্লাইড বদলালে (ডট/তীর/সোয়াইপ) index বদলায়, তাই সময় আবার শূন্য থেকে গোনা শুরু হয়।
  // ব্রাউজারের অন্য ট্যাবে থাকলে বদলায় না, ফিরে এলে আবার চলে।
  useEffect(() => {
    const t = setTimeout(() => {
      if (!document.hidden) go(index + 1);
      else setTick((n) => n + 1); // লুকানো থাকলে একই স্লাইডে থেকে আবার অপেক্ষা
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [index, tick, go]);

  return (
    <section aria-roledescription="carousel" aria-label="বিশেষ সংগ্রহ">
      <div
        className="group relative overflow-hidden rounded-3xl border border-base-300 shadow-sm"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx > 50) go(index - 1);
          if (dx < -50) go(index + 1);
          touchX.current = null;
        }}
      >
        {/* সব স্লাইড একই জায়গায় থাকে, শুধু চালুটা দেখা যায় */}
        <div className="grid">
          {SLIDES.map((s, i) => {
            const active = i === index;
            const Slide = s.type === "photo" ? PhotoSlide : s.type === "image" ? ImageSlide : DesignSlide;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`}
                aria-hidden={!active}
                className={`[grid-area:1/1] transition-opacity duration-700 ${
                  active ? "z-10 opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Slide s={s} active={active} books={books} />
              </div>
            );
          })}
        </div>

        {/* আগের/পরের বাটন — কম্পিউটারে মাউস নিলে দেখা যায় */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="btn btn-circle absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 border-base-300 bg-base-100/90 opacity-0 shadow transition group-hover:opacity-100 md:flex"
          aria-label="আগের স্লাইড"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="btn btn-circle absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 border-base-300 bg-base-100/90 opacity-0 shadow transition group-hover:opacity-100 md:flex"
          aria-label="পরের স্লাইড"
        >
          <FiChevronRight className="text-xl" />
        </button>
      </div>

      {/* ব্যানারের নিচে ডট */}
      <div className="mt-4 flex items-center justify-center gap-1">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`স্লাইড ${i + 1}`}
            aria-current={i === index}
            className="group flex h-6 items-center px-1"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-7 bg-primary" : "w-2 bg-base-content/20 group-hover:bg-base-content/40"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
