"use client";

import { useEffect, useMemo, useState } from "react";
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import Swal from "sweetalert2";
import { orderStatus, orderTotal, paymentInfo } from "@/lib/orders";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "online", label: "Online" },
  { value: "unpaid", label: "Unpaid" },
  { value: "Pending", label: "Pending" },
];

const tk = (n) => `Tk ${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const dateOf = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
const dayOf = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const hourOf = (d) => (d ? new Date(d).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" }) : "");

// Status badge — শুধু দেখায়, হাতে বদলানো যায় না।
// অর্ডার এলে "Pending", অ্যাডমিন Action এ Approve করলে "Approved"
const STATUS_STYLE = {
  Pending: "badge-warning",
  Approved: "badge-success text-white",
  Shipped: "badge-info text-white",
  Delivered: "badge-success text-white",
  Cancelled: "badge-error text-white",
};

function StatusBadge({ order }) {
  const v = orderStatus(order).value;
  return <span className={`badge badge-sm whitespace-nowrap ${STATUS_STYLE[v] || "badge-ghost"}`}>{v}</span>;
}

// Payment method + Paid / Unpaid
function PaymentCell({ order }) {
  const pay = paymentInfo(order);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="whitespace-nowrap text-xs font-medium text-gray-500">{pay.cod ? "Cash on Delivery" : "Online"}</span>
      <span className={`badge badge-sm ${pay.paid ? "badge-success text-white" : "badge-warning"}`}>{pay.paid ? "Paid" : "Unpaid"}</span>
    </div>
  );
}

// Approve → Status "Approved" + Payment "Paid" (সার্ভার দুটোই একসাথে বসায়)
const needsApproval = (o) => {
  const st = orderStatus(o).value;
  return st !== "Cancelled" && (st === "Pending" || !paymentInfo(o).paid);
};

function ActionCell({ order, busy, onApprove }) {
  if (orderStatus(order).value === "Cancelled") return <span className="text-sm font-semibold text-error">✕ Cancelled</span>;
  if (needsApproval(order)) {
    return (
      <button disabled={busy} onClick={onApprove} className="btn btn-success btn-sm whitespace-nowrap text-white">
        Approve
      </button>
    );
  }
  return <span className="whitespace-nowrap text-sm font-semibold text-success">✅ Done</span>;
}

// Customer details: name, email, phone, address
function OrderInfo({ order }) {
  const s = order.shipping;
  return (
    <div className="space-y-1 text-sm">
      <p className="flex items-center gap-2 font-semibold">
        <FiUser className="shrink-0 text-gray-400" /> {s?.name || "—"}
      </p>
      <p className="flex items-center gap-2 break-all text-gray-600">
        <FiMail className="shrink-0 text-gray-400" /> {order.userEmail}
      </p>
      <p className="flex items-center gap-2 text-gray-600">
        <FiPhone className="shrink-0 text-gray-400" />
        {s?.phone ? (
          <a href={`tel:${s.phone}`} className="link link-hover">
            {s.phone}
          </a>
        ) : (
          "—"
        )}
      </p>
      <p className="flex items-start gap-2 text-gray-600">
        <FiMapPin className="mt-0.5 shrink-0 text-gray-400" /> {s?.address || "No address (old order)"}
      </p>
      {s?.note && <p className="pl-6 text-xs italic text-gray-500">Note: {s.note}</p>}
    </div>
  );
}

function Products({ order }) {
  return (
    <div className="space-y-1 text-sm">
      {order.products?.map((p, i) => (
        <p key={i} className="flex justify-between gap-3">
          <span className="min-w-0">{p.title}</span>
          <span className="shrink-0 font-semibold text-gray-500">× {p.qty || 1}</span>
        </p>
      ))}
    </div>
  );
}

function Total({ order }) {
  return (
    <div>
      <p className="whitespace-nowrap font-bold text-primary">{tk(orderTotal(order))}</p>
      {Number(order.discountAmount) > 0 && (
        <p className="whitespace-nowrap text-xs text-success">🎉 saved {tk(order.discountAmount)}</p>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));
  }, []);

  const update = async (order, patch, confirmText) => {
    if (confirmText) {
      const ok = await Swal.fire({
        title: confirmText,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#1b5e45",
      });
      if (!ok.isConfirmed) return;
    }
    setBusy(order._id);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.success) return Swal.fire("Error", data.message || "Update failed", "error");
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, ...data.update } : o)));
    } finally {
      setBusy("");
    }
  };

  const approve = (order) =>
    update(
      order,
      { status: orderStatus(order).value === "Pending" ? "Approved" : orderStatus(order).value, payment: "Paid" },
      `Approve this order? Payment ${tk(orderTotal(order))} will be marked as Paid.`
    );

  const shown = useMemo(() => {
    return (orders || []).filter((o) => {
      const p = paymentInfo(o);
      if (filter === "cod") return p.cod;
      if (filter === "online") return !p.cod;
      if (filter === "unpaid") return !p.paid && orderStatus(o).value !== "Cancelled";
      if (filter === "Pending") return orderStatus(o).value === "Pending";
      return true;
    });
  }, [orders, filter]);

  const summary = useMemo(() => {
    const live = (orders || []).filter((o) => orderStatus(o).value !== "Cancelled");
    return {
      total: live.length,
      pending: live.filter((o) => orderStatus(o).value === "Pending").length,
      cod: live.filter((o) => paymentInfo(o).cod).length,
      due: live.filter((o) => !paymentInfo(o).paid).reduce((s, o) => s + orderTotal(o), 0),
    };
  }, [orders]);

  if (orders === null) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <h1 className="text-xl font-bold sm:text-3xl">📦 All Orders</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Orders", summary.total],
          ["Pending", summary.pending],
          ["Cash on Delivery", summary.cod],
          ["Amount Due", tk(summary.due)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{l}</p>
            <p className="mt-1 text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`btn btn-sm rounded-full ${filter === f.value ? "btn-primary" : "btn-ghost border-base-300 bg-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white py-16 text-center text-gray-500">No orders found</div>
      ) : (
        <>
          {/* ===== Desktop: table ===== */}
          <div className="hidden overflow-x-auto rounded-xl border bg-white shadow sm:block">
            <table className="table table-sm w-full">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th>Serial</th>
                  <th>Order</th>
                  <th className="text-center">Payment</th>
                  <th className="text-center">Status</th>
                  <th>Products × Qty</th>
                  <th className="text-right">Total Price</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`align-top ${index % 2 ? "bg-gray-50/70" : ""} ${orderStatus(order).value === "Cancelled" ? "opacity-50" : ""}`}
                  >
                    <td>
                      <p className="font-bold text-gray-500">{index + 1}</p>
                      <p className="mt-1 whitespace-nowrap text-xs text-gray-400">{dayOf(order.createdAt)}</p>
                      <p className="text-xs text-gray-400">{hourOf(order.createdAt)}</p>
                    </td>
                    <td className="min-w-[200px] max-w-[260px]">
                      <OrderInfo order={order} />
                    </td>
                    <td className="text-center">
                      <PaymentCell order={order} />
                    </td>
                    <td className="text-center">
                      <StatusBadge order={order} />
                    </td>
                    <td className="min-w-[140px]">
                      <Products order={order} />
                    </td>
                    <td className="text-right">
                      <Total order={order} />
                    </td>
                    <td className="text-center">
                      <ActionCell order={order} busy={busy === order._id} onApprove={() => approve(order)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Mobile: cards ===== */}
          <div className="space-y-3 sm:hidden">
            {shown.map((order, index) => (
              <div
                key={order._id}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm ${orderStatus(order).value === "Cancelled" ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Order #{index + 1}</p>
                    <p className="text-xs text-gray-400">{dateOf(order.createdAt)}</p>
                  </div>
                  <StatusBadge order={order} />
                </div>
                <div className="space-y-3 px-4 py-3">
                  <OrderInfo order={order} />
                  <div className="border-t pt-3">
                    <Products order={order} />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <PaymentCell order={order} />
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Price</p>
                      <Total order={order} />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-3">
                    <ActionCell order={order} busy={busy === order._id} onApprove={() => approve(order)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
