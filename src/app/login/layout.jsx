import { Suspense } from "react";

// useSearchParams ব্যবহার করা পেজের জন্য Suspense দরকার (Next.js এর নিয়ম)
export default function Layout({ children }) {
  return <Suspense fallback={<div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>}>{children}</Suspense>;
}
