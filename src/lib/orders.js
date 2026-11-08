// // অর্ডারের common helper — পেমেন্টের ধরন, অবস্থা আর লেবেল এক জায়গায়

// // অর্ডারের অবস্থা (ক্রম অনুযায়ী)
// export const ORDER_STATUSES = [
//   { value: "Pending", label: "অপেক্ষমাণ", badge: "badge-warning" },
//   { value: "Approved", label: "নিশ্চিত হয়েছে", badge: "badge-info" },
//   { value: "Shipped", label: "পাঠানো হয়েছে", badge: "badge-primary" },
//   { value: "Delivered", label: "পৌঁছে গেছে", badge: "badge-success" },
//   { value: "Cancelled", label: "বাতিল", badge: "badge-error" },
// ];
// export const STATUS_VALUES = ORDER_STATUSES.map((s) => s.value);

// // বাংলাদেশি মোবাইল নম্বর: 01 দিয়ে শুরু, মোট ১১ সংখ্যা (+880 থাকলেও চলবে)
// export const normalizePhone = (p) =>
//   String(p || "")
//     .replace(/[\s-]/g, "")
//     .replace(/^\+?880/, "0")
//     .replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
// export const isValidPhone = (p) => /^01[3-9]\d{8}$/.test(normalizePhone(p));

// // ডেলিভারির তথ্য যাচাই — ফেরত দেয় error বার্তা, ঠিক থাকলে null
// export function shippingError(s = {}) {
//   if (!String(s.name || "").trim()) return "আপনার নাম লিখুন";
//   if (!isValidPhone(s.phone)) return "সঠিক মোবাইল নম্বর দিন (যেমন ০১৭১২৩৪৫৬৭৮)";
//   if (String(s.address || "").trim().length < 10) return "পুরো ঠিকানা লিখুন (বাসা, রাস্তা, এলাকা, জেলা)";
//   return null;
// }

// // পুরোনো আর নতুন দুই ধরনের অর্ডার থেকেই মোট টাকা
// // (/api/orders এ "total", পুরোনো /api/payment/success এ "amount")
// export const orderTotal = (o) => Number(o?.total ?? o?.amount ?? 0) || 0;

// export const orderStatus = (o) => {
//   const v = o?.status || o?.orderStatus || "Pending";
//   return ORDER_STATUSES.find((s) => s.value === v) || ORDER_STATUSES[0];
// };

// // পেমেন্টের ধরন আর টাকা পাওয়া গেছে কিনা
// export function paymentInfo(o) {
//   const cod = o?.paymentMethod === "COD";
//   const paid = (o?.payment || o?.paymentStatus) === "Paid";
//   return {
//     cod,
//     paid,
//     method: cod ? "ক্যাশ অন ডেলিভারি" : "অনলাইন পেমেন্ট",
//     label: paid ? "টাকা পরিশোধিত" : cod ? "ডেলিভারিতে টাকা দেবেন" : "পরিশোধ হয়নি",
//     badge: paid ? "badge-success" : "badge-warning",
//   };
// }


// অর্ডারের common helper — পেমেন্টের ধরন, অবস্থা আর লেবেল এক জায়গায়

// অর্ডারের অবস্থা (ক্রম অনুযায়ী)
export const ORDER_STATUSES = [
  { value: "Pending", label: "অপেক্ষমাণ", badge: "badge-warning" },
  { value: "Approved", label: "নিশ্চিত হয়েছে", badge: "badge-info" },
  { value: "Shipped", label: "পাঠানো হয়েছে", badge: "badge-primary" },
  { value: "Delivered", label: "পৌঁছে গেছে", badge: "badge-success" },
  { value: "Cancelled", label: "বাতিল", badge: "badge-error" },
];
export const STATUS_VALUES = ORDER_STATUSES.map((s) => s.value);

// বাংলাদেশি মোবাইল নম্বর: 01 দিয়ে শুরু, মোট ১১ সংখ্যা (+880 থাকলেও চলবে)
export const normalizePhone = (p) =>
  String(p || "")
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0")
    .replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
export const isValidPhone = (p) => /^01[3-9]\d{8}$/.test(normalizePhone(p));

// ডেলিভারির তথ্য যাচাই — ফেরত দেয় error বার্তা, ঠিক থাকলে null
export function shippingError(s = {}) {
  if (!String(s.name || "").trim()) return "আপনার নাম লিখুন";
  if (!isValidPhone(s.phone)) return "সঠিক মোবাইল নম্বর দিন (যেমন ০১৭১২৩৪৫৬৭৮)";
  if (String(s.address || "").trim().length < 10) return "পুরো ঠিকানা লিখুন (বাসা, রাস্তা, এলাকা, জেলা)";
  return null;
}

// পুরোনো আর নতুন দুই ধরনের অর্ডার থেকেই মোট টাকা
// (/api/orders এ "total", পুরোনো /api/payment/success এ "amount")
export const orderTotal = (o) => Number(o?.total ?? o?.amount ?? 0) || 0;

export const orderStatus = (o) => {
  const v = o?.status || o?.orderStatus || "Pending";
  return ORDER_STATUSES.find((s) => s.value === v) || ORDER_STATUSES[0];
};

// পেমেন্টের ধরন আর টাকা পাওয়া গেছে কিনা
export function paymentInfo(o) {
  const cod = o?.paymentMethod === "COD";
  // COD আসার আগের পুরোনো অর্ডার সব অনলাইনে টাকা দেওয়া — তথ্য না থাকলে "Paid" ধরা হয়
  const paid = cod ? o?.payment === "Paid" : (o?.payment || o?.paymentStatus || "Paid") === "Paid";
  return {
    cod,
    paid,
    method: cod ? "ক্যাশ অন ডেলিভারি" : "অনলাইন পেমেন্ট",
    label: paid ? "টাকা পরিশোধিত" : cod ? "ডেলিভারিতে টাকা দেবেন" : "পরিশোধ হয়নি",
    badge: paid ? "badge-success" : "badge-warning",
  };
}