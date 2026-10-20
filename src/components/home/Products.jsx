"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import ProductCard from "../cards/ProductCard";
import { CATEGORY_VALUES, discountPercent, toBn } from "@/lib/books";

const PER_PAGE = 12;

const PRICE_RANGES = [
  { value: "all", label: "সব দাম" },
  { value: "u300", label: "৳ ৩০০ এর নিচে", test: (p) => p < 300 },
  { value: "300-700", label: "৳ ৩০০ – ৭০০", test: (p) => p >= 300 && p <= 700 },
  { value: "700-1500", label: "৳ ৭০০ – ১,৫০০", test: (p) => p > 700 && p <= 1500 },
  { value: "o1500", label: "৳ ১,৫০০ এর বেশি", test: (p) => p > 1500 },
];

const SORTS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "popular", label: "বেশি বিক্রি" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "discount", label: "বেশি ছাড়" },
];

const time = (b) => new Date(b.createdAt || 0).getTime();

const Products = ({ products = [], initialCategory = "all", initialQuery = "", initialSort = "newest" }) => {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.value === price);
    let list = products.filter((b) => {
      if (category !== "all" && b.category !== category) return false;
      if (range?.test && !range.test(Number(b.price) || 0)) return false;
      if (q) {
        const hay = [b.title, b.author, b.publisher, b.translator].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorters = {
      newest: (a, b) => time(b) - time(a),
      popular: (a, b) => (b.sold || 0) - (a.sold || 0),
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      discount: (a, b) => discountPercent(b) - discountPercent(a),
    };
    return [...list].sort(sorters[sort] || sorters.newest);
  }, [products, category, query, price, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const current = Math.min(page, Math.max(totalPages, 1));
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const reset = () => {
    setCategory("all");
    setQuery("");
    setPrice("all");
    setPage(1);
  };
  const pick = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const countFor = (cat) => products.filter((b) => b.category === cat).length;

  const CategoryButton = ({ value, label, count }) => (
    <button
      onClick={() => pick(setCategory)(value)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
        category === value ? "bg-primary text-primary-content" : "hover:bg-base-200"
      }`}
    >
      <span>{label}</span>
      <span className={`text-xs ${category === value ? "opacity-80" : "text-base-content/40"}`}>{toBn(count)}</span>
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* ===== বাম পাশ: filter (desktop) ===== */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-5">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <h3 className="mb-2 px-1 font-semibold">ক্যাটাগরি</h3>
            <CategoryButton value="all" label="সব বই" count={products.length} />
            {CATEGORY_VALUES.map((c) => (
              <CategoryButton key={c} value={c} label={c} count={countFor(c)} />
            ))}
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
            <h3 className="mb-2 px-1 font-semibold">দাম</h3>
            {PRICE_RANGES.map((r) => (
              <label key={r.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-sm">
                <input
                  type="radio"
                  name="price"
                  className="radio radio-primary radio-xs"
                  checked={price === r.value}
                  onChange={() => pick(setPrice)(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ===== ডান পাশ: বইয়ের তালিকা ===== */}
      <section>
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 sm:flex-row sm:items-center">
          <label className="input input-bordered flex flex-1 items-center gap-2">
            <FiSearch className="opacity-50" />
            <input
              type="search"
              value={query}
              onChange={(e) => pick(setQuery)(e.target.value)}
              placeholder="বইয়ের নাম, লেখক বা প্রকাশনী লিখুন..."
              className="grow"
            />
          </label>
          <select className="select select-bordered sm:w-52" value={sort} onChange={(e) => pick(setSort)(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* mobile এ ক্যাটাগরি chips */}
        <div className="no-scrollbar -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 lg:hidden">
          {["all", ...CATEGORY_VALUES].map((c) => (
            <button
              key={c}
              onClick={() => pick(setCategory)(c)}
              className={`btn btn-sm shrink-0 rounded-full ${category === c ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              {c === "all" ? "সব বই" : c}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">{category === "all" ? "সব বই" : category}</h1>
          <p className="text-sm text-base-content/60">{toBn(filtered.length)}টি বই</p>
        </div>

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 py-20 text-center">
            <p className="mb-2 text-5xl">📚</p>
            <p className="text-base-content/60">কোনো বই পাওয়া যায়নি</p>
            <button onClick={reset} className="btn btn-primary btn-sm mt-4 gap-1">
              <FiX /> সব filter মুছুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {shown.map((book) => (
              <ProductCard key={book._id} product={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <button onClick={() => setPage(current - 1)} disabled={current === 1} className="btn btn-sm btn-outline">
              ← আগের
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`btn btn-sm ${current === n ? "btn-primary" : "btn-outline"}`}
              >
                {toBn(n)}
              </button>
            ))}
            <button onClick={() => setPage(current + 1)} disabled={current === totalPages} className="btn btn-sm btn-outline">
              পরের →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
