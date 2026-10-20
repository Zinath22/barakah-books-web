import Link from "next/link";
import ProductCard from "@/components/cards/ProductCard";

// একটা শিরোনাম আর পাশাপাশি বইয়ের সারি (mobile এ আড়াআড়ি scroll)
export default function BookShelf({ title, subtitle, books = [], href = "/products" }) {
  if (!books.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-base-content/60">{subtitle}</p>}
        </div>
        <Link href={href} className="btn btn-sm btn-ghost text-primary">
          সব দেখুন →
        </Link>
      </div>
      <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:gap-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-5">
        {books.map((b) => (
          <div key={b._id} className="w-44 shrink-0 snap-start sm:w-52 md:w-auto">
            <ProductCard product={b} />
          </div>
        ))}
      </div>
    </section>
  );
}
