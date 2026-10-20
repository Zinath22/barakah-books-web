// প্রতিদিন একটা করে আয়াত (তারিখ অনুযায়ী বদলায়)
const AYAHS = [
  { ar: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", bn: "পড়ো তোমার প্রতিপালকের নামে, যিনি সৃষ্টি করেছেন।", ref: "সূরা আল-আলাক, ৯৬:১" },
  { ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا", bn: "আর বলো, হে আমার প্রতিপালক! আমার জ্ঞান বৃদ্ধি করে দাও।", ref: "সূরা ত্বহা, ২০:১১৪" },
  { ar: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ", bn: "বলো, যারা জানে আর যারা জানে না, তারা কি সমান?", ref: "সূরা আয-যুমার, ৩৯:৯" },
  { ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", bn: "নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।", ref: "সূরা আশ-শারহ, ৯৪:৫" },
  { ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", bn: "জেনে রাখো, আল্লাহর স্মরণেই অন্তর প্রশান্ত হয়।", ref: "সূরা আর-রা'দ, ১৩:২৮" },
  { ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", bn: "আল্লাহ কাউকে তার সাধ্যের বাইরে দায়িত্ব দেন না।", ref: "সূরা আল-বাকারা, ২:২৮৬" },
  {
    ar: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    bn: "তোমাদের মধ্যে যারা ঈমান এনেছে এবং যাদের জ্ঞান দেওয়া হয়েছে, আল্লাহ তাদের মর্যাদা উঁচু করে দেবেন।",
    ref: "সূরা আল-মুজাদালা, ৫৮:১১",
  },
];

function todayIndex() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear % AYAHS.length;
}

export default function DailyAyah() {
  const a = AYAHS[todayIndex()];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary/40 bg-gradient-to-br from-base-100 to-secondary/10 px-6 py-8 text-center sm:px-12">
      <span className="badge badge-secondary badge-outline mb-4">আজকের আয়াত</span>
      <p className="font-arabic text-2xl leading-loose text-primary sm:text-3xl" lang="ar" dir="rtl">
        {a.ar}
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-base-content/80">“{a.bn}”</p>
      <p className="mt-2 text-sm text-base-content/50">— {a.ref}</p>
    </section>
  );
}
