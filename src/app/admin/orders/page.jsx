"use client";

import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    };

    loadOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-5">
        All Orders
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 mb-4"
        >
          <h2>
            <strong>User:</strong>{" "}
            {order.userEmail}
          </h2>

          <h3>
            <strong>Total:</strong> Tk{" "}
            {order.amount}
          </h3>

          <h3>
            <strong>Payment:</strong>{" "}
            {order.paymentStatus}
          </h3>

          <h3>
            <strong>Status:</strong>{" "}
            {order.orderStatus}
          </h3>

          <div className="mt-3">
            {order.products?.map(
              (item, index) => (
                <div
                  key={index}
                  className="border-b py-2"
                >
                  {item.title} - Tk {item.price}
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}