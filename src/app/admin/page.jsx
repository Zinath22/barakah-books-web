"use client";

import SalesDashboard from "@/components/admin/SalesDashboard";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        {/* <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1> */}
        <p className="text-2xl font-bold">দোকানের বিক্রির হিসাব</p>
      </div>
      <SalesDashboard />
    </div>
  );
}
