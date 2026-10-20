// বই সংক্রান্ত সব common তথ্য ও helper — website এর সব জায়গায় এখান থেকে নেওয়া হয়

export const CATEGORIES = [
  { value: "কুরআন ও তাফসীর", icon: "quran", note: "তিলাওয়াত, অনুবাদ ও ব্যাখ্যা" },
  { value: "হাদিস", icon: "hadith", note: "সহীহ হাদিস সংকলন" },
  { value: "সীরাত", icon: "seerah", note: "নবীজির ﷺ জীবনী" },
  { value: "ফিকহ ও মাসায়েল", icon: "fiqh", note: "ইবাদত ও দৈনন্দিন বিধান" },
  { value: "আকীদা", icon: "aqeedah", note: "ঈমান ও বিশ্বাস" },
  { value: "আত্মশুদ্ধি", icon: "tazkiyah", note: "দোয়া, যিকির ও আত্মার পরিচর্যা" },
  { value: "শিশু-কিশোর", icon: "kids", note: "ছোটদের জন্য গল্প ও শিক্ষা" },
  { value: "ইতিহাস", icon: "history", note: "ইসলামের ইতিহাস ও সভ্যতা" },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);
export const LANGUAGES = ["বাংলা", "আরবি", "ইংরেজি", "উর্দু"];
export const BINDINGS = ["হার্ডকভার", "পেপারব্যাক"];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (value) => String(value ?? "").replace(/\d/g, (d) => BN_DIGITS[d]);

// ৳ ১,২৫০
export const taka = (value) => `৳ ${toBn(Math.round(Number(value) || 0).toLocaleString("en-IN"))}`;

// originalPrice থাকলে সেখান থেকে ছাড় হিসাব
export function discountPercent(book) {
  const price = Number(book?.price) || 0;
  const original = Number(book?.originalPrice) || 0;
  if (original > price && price > 0) return Math.round(((original - price) / original) * 100);
  return 0;
}

export const inStock = (book) => book?.stock === undefined || book?.stock === null || Number(book.stock) > 0;
