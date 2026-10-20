



// "use client";

// import { useEffect, useState } from "react";
// import Swal from "sweetalert2";

// export default function AdminOrders() {
//   const [orders, setOrders] = useState([]);

//   const loadOrders = async () => {
//     try {
//       const res  = await fetch("/api/orders");
//       const data = await res.json();

//       if (data.success) {
//         setOrders(data.orders);
//       } else {
//         setOrders([]);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetch("/api/orders")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("ORDERS:", data);
//         setOrders(data);
//       });
//   }, []);

//   const approveOrder = async (id) => {
//     try {
//       const res  = await fetch(`/api/orders/${id}`, { method: "PATCH" });
//       const data = await res.json();

//       if (data.success) {
//         Swal.fire("Success", "Order Approved Successfully", "success");
//         loadOrders();
//       } else {
//         Swal.fire("Error", data.message, "error");
//       }
//     } catch (error) {
//       console.log(error);
//       Swal.fire("Error", "Something went wrong", "error");
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">

//       <h1 className="text-3xl font-bold mb-6">📦 All Orders</h1>

//       {orders.length === 0 ? (
//         <div className="text-center py-20">
//           <h2 className="text-xl font-semibold">No Orders Found</h2>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-xl shadow border">
//           <table className="table table-zebra w-full">

//             <thead className="bg-gray-100 text-gray-700 text-sm">
//               <tr>
//                 <th>#</th>
//                 <th>Email</th>
//                 <th className="text-center">Payment</th>
//                 <th className="text-center">Status</th>
//                 <th>Products</th>
//                 <th className="text-center">Qty</th>
//                 <th className="text-right">Total Price</th>
//                 <th className="text-center">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {orders.map((order, index) => (
//                 <tr key={order._id} className="align-middle">

//                   <td className="font-semibold text-gray-500">
//                     {index + 1}
//                   </td>

//                   <td className="text-sm max-w-[180px] break-words">
//                     {order.userEmail}
//                   </td>

//                   <td className="text-center">
//                     <span className="badge badge-success badge-sm">
//                       {order.payment}
//                     </span>
//                   </td>

//                   <td className="text-center">
//                     <span
//                       className={`badge badge-sm ${
//                         order.status === "Approved"
//                           ? "badge-success"
//                           : "badge-warning"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>

//                   <td className="text-sm">
//                     {order.products?.map((p, i) => (
//                       <div key={i}>{p.title}</div>
//                     ))}
//                   </td>

//                   <td className="text-center text-sm">
//                     {order.products?.map((p, i) => (
//                       <div key={i}>{p.qty || 1}</div>
//                     ))}
//                   </td>

//                   <td className="text-right">
//                     <span className="font-bold">Tk {order.total}</span>
//                     {order.couponCode && order.discountAmount > 0 && (
//                       <div className="text-green-600 text-xs mt-1">
//                         🎉 saved Tk {order.discountAmount}
//                       </div>
//                     )}
//                   </td>

//                   <td className="text-center">
//                     {order.status !== "Approved" ? (
//                       <button
//                         onClick={() => approveOrder(order._id)}
//                         className="btn btn-success btn-sm"
//                       >
//                         Approve
//                       </button>
//                     ) : (
//                       <span className="text-green-600 text-sm font-semibold">
//                         ✅ Done
//                       </span>
//                     )}
//                   </td>

//                 </tr>
//               ))}
//             </tbody>

//           </table>
//         </div>
//       )}

//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const res  = await fetch("/api/orders");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDERS:", data);
        setOrders(data);
      });
  }, []);

  const approveOrder = async (id) => {
    try {
      const res  = await fetch(`/api/orders/${id}`, { method: "PATCH" });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Success", "Order Approved Successfully", "success");
        loadOrders();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      <h1 className="text-xl sm:text-3xl font-bold mb-6">📦 All Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">No Orders Found</h2>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto rounded-xl shadow border">
            <table className="table table-zebra w-full">

              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th className="text-center">Payment</th>
                  <th className="text-center">Status</th>
                  <th>Products</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Total Price</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id} className="align-middle">

                    <td className="font-semibold text-gray-500">
                      {index + 1}
                    </td>

                    <td className="text-sm max-w-[180px] break-words">
                      {order.userEmail}
                    </td>

                    <td className="text-center">
                      <span className="badge badge-success badge-sm">
                        {order.payment}
                      </span>
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge badge-sm ${
                          order.status === "Approved"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="text-sm">
                      {order.products?.map((p, i) => (
                        <div key={i}>{p.title}</div>
                      ))}
                    </td>

                    <td className="text-center text-sm">
                      {order.products?.map((p, i) => (
                        <div key={i}>{p.qty || 1}</div>
                      ))}
                    </td>

                    <td className="text-right">
                      <span className="font-bold">Tk {order.total}</span>
                      {order.couponCode && order.discountAmount > 0 && (
                        <div className="text-green-600 text-xs mt-1">
                          🎉 saved Tk {order.discountAmount}
                        </div>
                      )}
                    </td>

                    <td className="text-center">
                      {order.status !== "Approved" ? (
                        <button
                          onClick={() => approveOrder(order._id)}
                          className="btn btn-success btn-sm"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-semibold">
                          ✅ Done
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden space-y-4">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                  <span className="text-sm font-semibold text-gray-500">
                    Order #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success badge-sm">
                      {order.payment}
                    </span>
                    <span
                      className={`badge badge-sm ${
                        order.status === "Approved"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="px-4 py-3 space-y-2 text-sm">

                  <div className="flex justify-between text-gray-500">
                    <span>Customer</span>
                    <span className="text-right break-all max-w-[200px]">
                      {order.userEmail}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Products</span>
                    <div className="text-right">
                      {order.products?.map((p, i) => (
                        <div key={i}>{p.title} × {p.qty || 1}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Price</span>
                    <div className="text-right">
                      <span>Tk {order.total}</span>
                      {order.couponCode && order.discountAmount > 0 && (
                        <div className="text-green-600 text-xs font-normal">
                          🎉 saved Tk {order.discountAmount}
                        </div>
                      )}
                    </div>
                  </div>

                  {order.status !== "Approved" && (
                    <button
                      onClick={() => approveOrder(order._id)}
                      className="btn btn-success btn-sm w-full mt-2"
                    >
                      Approve Order
                    </button>
                  )}

                  {order.status === "Approved" && (
                    <p className="text-center text-green-600 font-semibold pt-1">
                      ✅ Done
                    </p>
                  )}

                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
