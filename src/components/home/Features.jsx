import { FiTruck, FiDollarSign, FiShield, FiRefreshCw } from "react-icons/fi";

const ITEMS = [
  { icon: FiTruck, title: "সারাদেশে ডেলিভারি", text: "ঢাকায় ১–২ দিন, ঢাকার বাইরে ৩–৫ দিন" },
  { icon: FiDollarSign, title: "ক্যাশ অন ডেলিভারি", text: "বই হাতে পেয়ে টাকা দিন" },
  { icon: FiShield, title: "১০০% অরিজিনাল", text: "প্রকাশনী থেকে সরাসরি সংগ্রহ" },
  { icon: FiRefreshCw, title: "সহজ বদল", text: "ত্রুটিপূর্ণ বই ৭ দিনের মধ্যে বদল" },
];

export default function Features() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-lg text-primary">
            <Icon />
          </span>
          <div>
            <p className="font-semibold leading-tight">{title}</p>
            <p className="mt-0.5 text-xs text-base-content/60 sm:text-sm">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
