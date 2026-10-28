import { getProducts } from "@/actions/server/product";
import Hero from "@/components/home/Hero";
import DailyAyah from "@/components/home/DailyAyah";
import CategoryGrid from "@/components/home/CategoryGrid";
import BookShelf from "@/components/home/BookShelf";
import Features from "@/components/home/Features";
import { discountPercent, toBn } from "@/lib/books";

async function getActiveCoupon() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupons`, { cache: "no-store" });
    const data = await res.json();
    if (!data.success) return null;
    return (
      data.coupons.find(
        (c) =>
          c.isActive &&
          new Date() < new Date(c.expiryDate) &&
          (c.usageLimit === 0 || c.usedCount < c.usageLimit)
      ) || null
    );
  } catch {
    return null;
  }
}

const time = (b) => new Date(b.createdAt || 0).getTime();

const Home = async () => {
  const [books, coupon] = await Promise.all([getProducts(), getActiveCoupon()]);

  const newest = [...books].sort((a, b) => time(b) - time(a)).slice(0, 10);
  const popular = books.filter((b) => b.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 10);
  const offers = books.filter((b) => discountPercent(b) >= 20).slice(0, 5);

  return (
    <div className="space-y-14">
      <Hero books={popular.length >= 3 ? popular : newest} />

      {coupon && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-center text-secondary-content sm:flex-row sm:gap-4">
          <span className="font-semibold">🎁 বিশেষ অফার!</span>
          <span>
            কুপন <code className="rounded bg-base-100 px-2 py-0.5 font-bold text-primary">{coupon.code}</code> ব্যবহার করে
            পান {coupon.discountType === "percentage" ? `${toBn(coupon.discountValue)}%` : `৳ ${toBn(coupon.discountValue)}`} ছাড়
          </span>
        </div>
      )}

      <Features />
      <CategoryGrid books={books} />
      <BookShelf title="নতুন সংযোজন" subtitle="সদ্য আসা বইগুলো" books={newest} href="/products?sort=newest" />
      <DailyAyah />
      <BookShelf title="বিশেষ ছাড়" subtitle="২০% বা তার বেশি ছাড়ে" books={offers} href="/products?sort=discount" />

      {books.length === 0 && (
        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-2 font-semibold">এখনো কোনো বই যোগ করা হয়নি</p>
          <p className="mt-1 text-sm text-base-content/60">
            Admin panel থেকে বই যোগ করুন, অথবা server folder এ <code>npm run seed</code> চালিয়ে নমুনা বই বসান।
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
