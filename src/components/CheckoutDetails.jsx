"use client";

import { FiCheckCircle, FiCreditCard, FiTruck } from "react-icons/fi";

const METHODS = [
  {
    value: "cod",
    title: "ক্যাশ অন ডেলিভারি",
    text: "বই হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিন",
    icon: FiTruck,
  },
  {
    value: "online",
    title: "অনলাইন পেমেন্ট",
    text: "বিকাশ, নগদ, রকেট বা কার্ড (SSLCommerz)",
    icon: FiCreditCard,
  },
];

// কার্ট পেজের ডেলিভারির তথ্য আর পেমেন্টের ধরন বাছাই
export default function CheckoutDetails({ info, onInfo, method, onMethod }) {
  const set = (e) => onInfo({ ...info, [e.target.name]: e.target.value });

  return (
    <div className="mt-4 space-y-4">
      {/* ডেলিভারির ঠিকানা */}
      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <h2 className="mb-4 font-bold sm:text-lg">📦 ডেলিভারির তথ্য</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              নাম <span className="text-error">*</span>
            </span>
            <input name="name" value={info.name} onChange={set} className="input input-bordered w-full" placeholder="যিনি বই গ্রহণ করবেন" autoComplete="name" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              মোবাইল নম্বর <span className="text-error">*</span>
            </span>
            <input
              name="phone"
              value={info.phone}
              onChange={set}
              className="input input-bordered w-full"
              placeholder="০১XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">
              পুরো ঠিকানা <span className="text-error">*</span>
            </span>
            <textarea
              name="address"
              value={info.address}
              onChange={set}
              rows={2}
              className="textarea textarea-bordered w-full"
              placeholder="বাসা/ফ্ল্যাট, রাস্তা, এলাকা, থানা, জেলা"
              autoComplete="street-address"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">বিশেষ নির্দেশনা (ঐচ্ছিক)</span>
            <input name="note" value={info.note} onChange={set} className="input input-bordered w-full" placeholder="যেমন: বিকেল ৫টার পরে আসবেন" />
          </label>
        </div>
      </div>

      {/* পেমেন্টের ধরন */}
      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <h2 className="mb-4 font-bold sm:text-lg">💳 পেমেন্টের ধরন</h2>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {METHODS.map((m) => {
            const active = method === m.value;
            const Icon = m.icon;
            return (
              <label
                key={m.value}
                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                  active ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={active}
                  onChange={() => onMethod(m.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    active ? "bg-primary text-primary-content" : "bg-base-200"
                  }`}
                >
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="block text-sm text-gray-500">{m.text}</span>
                </span>
                {active && <FiCheckCircle className="absolute right-3 top-3 text-primary" />}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
