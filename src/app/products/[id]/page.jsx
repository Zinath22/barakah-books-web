import Link from "next/link";
import { notFound } from "next/navigation";
import { FiTruck, FiDollarSign, FiRefreshCw } from "react-icons/fi";
import { getProducts, getSingleProduct } from "@/actions/server/product";
import CartButton from "@/components/buttons/CartButton";
import AddReview from "@/components/review/AddReview";
import ReviewList from "@/components/review/ReviewList";
import BookCover from "@/components/books/BookCover";
import WishlistButton from "@/components/books/WishlistButton";
import Stars from "@/components/books/Stars";
import ProductCard from "@/components/cards/ProductCard";
import { discountPercent, inStock, taka, toBn } from "@/lib/books";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = await getSingleProduct(id);
  if (!book) return { title: "বই পাওয়া যায়নি" };
  const description = (book.description || `${book.title} — ${book.author || ""}`).slice(0, 160);
  return {
    title: book.title,
    description,
    openGraph: { title: book.title, description, images: book.img ? [{ url: book.img }] : [] },
  };
}

const BookDetails = async ({ params }) => {
  const { id } = await params;
  const book = await getSingleProduct(id);
  if (!book) notFound();

  const off = discountPercent(book);
  const available = inStock(book);
  const related = (await getProducts())
    .filter((b) => b.category === book.category && b._id !== book._id)
    .slice(0, 4);

  const specs = [
    ["লেখক", book.author],
    ["অনুবাদক", book.translator],
    ["প্রকাশনী", book.publisher],
    ["ক্যাটাগরি", book.category],
    ["পৃষ্ঠা", book.pages && toBn(book.pages)],
    ["ভাষা", book.language],
    ["বাঁধাই", book.binding],
    ["সংস্করণ", book.edition],
    ["ISBN", book.isbn],
  ].filter(([, v]) => v);

  return (
    <div className="space-y-10">
      {/* breadcrumb */}
      <div className="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><Link href="/">হোম</Link></li>
          <li><Link href="/products">সব বই</Link></li>
          {book.category && (
            <li><Link href={`/products?category=${encodeURIComponent(book.category)}`}>{book.category}</Link></li>
          )}
          <li className="line-clamp-1 text-base-content">{book.title}</li>
        </ul>
      </div>

      <div className="grid gap-8 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8 md:grid-cols-[minmax(0,340px)_1fr]">
        {/* প্রচ্ছদ */}
        <div className="mx-auto w-full max-w-[300px] md:sticky md:top-28 md:self-start">
          <div className="rounded-2xl bg-base-200 px-10 py-8">
            <BookCover book={book} size="lg" />
          </div>
        </div>

        {/* তথ্য */}
        <div>
          {book.category && <span className="badge badge-primary badge-outline mb-3">{book.category}</span>}
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{book.title}</h1>
          {book.author && (
            <p className="mt-2 text-base-content/70">
              লেখক: <span className="font-medium text-primary">{book.author}</span>
              {book.translator && <> · অনুবাদ: <span className="font-medium">{book.translator}</span></>}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-base-content/60">
            <Stars rating={book.rating} count={book.reviews || 0} size={14} />
            {book.sold > 0 && <span>· {toBn(book.sold)} কপি বিক্রি হয়েছে</span>}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3 rounded-2xl bg-base-200 p-4">
            <span className="text-3xl font-bold text-primary">{taka(book.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-base-content/40 line-through">{taka(book.originalPrice)}</span>
                <span className="badge badge-secondary">{toBn(off)}% ছাড়</span>
              </>
            )}
            <span className={`ml-auto text-sm font-medium ${available ? "text-success" : "text-error"}`}>
              {available ? "● স্টকে আছে" : "● স্টক শেষ"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CartButton product={book} disabled={!available} />
            <WishlistButton book={book} withText />
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-base-content/70 sm:grid-cols-3">
            <li className="flex items-center gap-2"><FiTruck className="text-primary" /> সারাদেশে হোম ডেলিভারি</li>
            <li className="flex items-center gap-2"><FiDollarSign className="text-primary" /> ক্যাশ অন ডেলিভারি</li>
            <li className="flex items-center gap-2"><FiRefreshCw className="text-primary" /> ত্রুটিপূর্ণ বই বদল</li>
          </ul>

          {specs.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-base-300">
              <table className="table table-sm">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k} className="even:bg-base-200/60">
                      <th className="w-32 font-medium text-base-content/60">{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {book.description && (
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
          <h2 className="mb-3 text-xl font-bold">বই সম্পর্কে</h2>
          <div className="space-y-3 leading-relaxed text-base-content/80">
            {book.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <h2 className="mb-4 text-xl font-bold">পাঠকের মতামত</h2>
        <AddReview productId={book._id.toString()} />
        <ReviewList productId={book._id.toString()} />
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">একই ক্যাটাগরির আরও বই</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((b) => (
              <ProductCard key={b._id} product={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetails;
