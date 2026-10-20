import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import BookCover from "@/components/books/BookCover";

// ===== ডান পাশের ৩টা হেলানো ছবি =====
// ১টা লিংক দিলে ৩ জায়গাতেই সেই ছবি দেখাবে
// ৩টা লিংক দিলে আলাদা আলাদা দেখাবে (১ম = মাঝে, ২য় = বাঁ পাশে, ৩য় = ডান পাশে)
const HERO_IMAGES = [
  "/assets/images1.jpg",
];

export default function Hero() {
  const stack = [0, 1, 2].map((i) => ({
    title: "বারাকাহ বুকস",
    img: HERO_IMAGES[i] || HERO_IMAGES[0],
  }));

  return (
    <section className="islamic-pattern relative overflow-hidden rounded-3xl bg-primary text-primary-content">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 md:grid-cols-[1.2fr_1fr] md:py-16 lg:px-14">
        <div>
          <p className="font-arabic text-left text-2xl text-secondary sm:text-3xl" lang="ar">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            জ্ঞানের আলোয় <br className="hidden sm:block" />
            আলোকিত হোক <span className="text-secondary">জীবন</span>
          </h1>
          <p className="mt-4 max-w-lg text-primary-content/80">
            কুরআন, হাদিস, সীরাত, ফিকহ আর শিশুদের ইসলামিক বই — নির্ভরযোগ্য লেখক ও প্রকাশনীর বাছাই করা সংগ্রহ, আপনার
            দোরগোড়ায়।
          </p>

          <form action="/products" className="mt-7 flex max-w-lg gap-2 rounded-full bg-base-100 p-1.5 shadow-lg">
            <label className="flex flex-1 items-center gap-2 pl-4 text-base-content">
              <FiSearch className="opacity-50" />
              <input name="q" type="search" placeholder="কোন বই খুঁজছেন?" className="w-full bg-transparent outline-none" />
            </label>
            <button className="btn btn-secondary rounded-full px-6">খুঁজুন</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="text-primary-content/60">জনপ্রিয়:</span>
            {["সীরাত", "হাদিস", "শিশু-কিশোর"].map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-primary-content/25 px-3 py-0.5 hover:border-secondary hover:text-secondary"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* ডান পাশের ৩টা হেলানো ছবি */}
        <div className="relative mx-auto hidden h-80 w-72 md:block">
          <Link href="/products" className="absolute left-0 top-10 w-40 -rotate-12 transition hover:-rotate-6">
            <BookCover book={stack[1]} />
          </Link>
          <Link href="/products" className="absolute right-0 top-10 w-40 rotate-12 transition hover:rotate-6">
            <BookCover book={stack[2]} />
          </Link>
          <Link href="/products" className="absolute left-1/2 top-0 z-10 w-44 -translate-x-1/2 transition hover:-translate-y-2">
            <BookCover book={stack[0]} />
          </Link>
          <div className="absolute -bottom-2 left-1/2 h-4 w-64 -translate-x-1/2 rounded-full bg-black/25 blur-md" />
        </div>
      </div>
    </section>
  );
}





// import Link from "next/link";
// import { FiSearch } from "react-icons/fi";
// import BookCover from "@/components/books/BookCover";

// const SAMPLE = [
//   { title: "আর রাহীকুল মাখতূম", author: "শফীউর রহমান মুবারকপুরী" },
//   { title: "রিয়াদুস সালেহীন", author: "ইমাম নববী (রহ.)" },
//   { title: "তাফসীর ইবনে কাসীর", author: "ইমাম ইবনে কাসীর (রহ.)" },
// ];

// export default function Hero({ books = [] }) {
//   const stack = books.length >= 3 ? books.slice(0, 3) : SAMPLE;

//   return (
//     <section className="islamic-pattern relative overflow-hidden rounded-3xl bg-primary text-primary-content">
//       <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
//       <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 md:grid-cols-[1.2fr_1fr] md:py-16 lg:px-14">
//         <div>
//           <p className="font-arabic text-left text-2xl text-secondary sm:text-3xl" lang="ar">
//             بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
//           </p>
//           <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
//             জ্ঞানের আলোয় <br className="hidden sm:block" />
//             আলোকিত হোক <span className="text-secondary">জীবন</span>
//           </h1>
//           <p className="mt-4 max-w-lg text-primary-content/80">
//             কুরআন, হাদিস, সীরাত, ফিকহ আর শিশুদের ইসলামিক বই — নির্ভরযোগ্য লেখক ও প্রকাশনীর বাছাই করা সংগ্রহ, আপনার
//             দোরগোড়ায়।
//           </p>

//           <form action="/products" className="mt-7 flex max-w-lg gap-2 rounded-full bg-base-100 p-1.5 shadow-lg">
//             <label className="flex flex-1 items-center gap-2 pl-4 text-base-content">
//               <FiSearch className="opacity-50" />
//               <input name="q" type="search" placeholder="কোন বই খুঁজছেন?" className="w-full bg-transparent outline-none" />
//             </label>
//             <button className="btn btn-secondary rounded-full px-6">খুঁজুন</button>
//           </form>

//           <div className="mt-5 flex flex-wrap gap-2 text-sm">
//             <span className="text-primary-content/60">জনপ্রিয়:</span>
//             {["সীরাত", "হাদিস", "শিশু-কিশোর"].map((c) => (
//               <Link
//                 key={c}
//                 href={`/products?category=${encodeURIComponent(c)}`}
//                 className="rounded-full border border-primary-content/25 px-3 py-0.5 hover:border-secondary hover:text-secondary"
//               >
//                 {c}
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* বইয়ের স্তূপ */}
//         <div className="relative mx-auto hidden h-80 w-72 md:block">
//           <Link href={books[1] ? `/products/${books[1]._id}` : "/products"} className="absolute left-0 top-10 w-40 -rotate-12 transition hover:-rotate-6">
//             <BookCover book={stack[1]} />
//           </Link>
//           <Link href={books[2] ? `/products/${books[2]._id}` : "/products"} className="absolute right-0 top-10 w-40 rotate-12 transition hover:rotate-6">
//             <BookCover book={stack[2]} />
//           </Link>
//           <Link href={books[0] ? `/products/${books[0]._id}` : "/products"} className="absolute left-1/2 top-0 z-10 w-44 -translate-x-1/2 transition hover:-translate-y-2">
//             <BookCover book={stack[0]} />
//           </Link>
//           <div className="absolute -bottom-2 left-1/2 h-4 w-64 -translate-x-1/2 rounded-full bg-black/25 blur-md" />
//         </div>
//       </div>
//     </section>
//   );
// }
