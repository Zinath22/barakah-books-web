



// "use client";

// import { useAuth } from "@/provider/AuthProvider";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { getAuth } from "firebase/auth";

// export default function DashboardPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   const [orders, setOrders]               = useState([]);
//   const [ordersLoading, setOrdersLoading] = useState(true);

//   useEffect(() => {
//     if (loading) return;
//     if (user?.role === "admin") {
//       router.push("/admin");
//     }
//   }, [user, loading]);

//   useEffect(() => {
//     if (!user) return;

//     const fetchOrders = async () => {
//       try {
//         setOrdersLoading(true);

//         const auth         = getAuth();
//         const firebaseUser = auth.currentUser;
//         const email        = firebaseUser?.email || user?.email;

//         if (!email) return;

//         const res  = await fetch(`/api/orders/user?email=${email}`);
//         const data = await res.json();

//         if (data.success) {
//           setOrders(data.orders);
//         }
//       } catch (error) {
//         console.log("FETCH ORDERS ERROR:", error);
//       } finally {
//         setOrdersLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [user]);

//   if (loading) return <p className="p-5">Loading...</p>;

//   return (
//     <div className="max-w-6xl mx-auto p-6">

//       <div className="flex items-center gap-4 mb-8">
//         {user?.photoURL ? (
//           <img
//             src={user.photoURL}
//             alt="avatar"
//             className="w-16 h-16 rounded-full object-cover border-4 border-orange-300"
//           />
//         ) : (
//           <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
//             {user?.name?.[0]?.toUpperCase() || "U"}
//           </div>
//         )}

//         <div>
//           <h1 className="text-2xl font-bold">
//             Welcome, {user?.name || "User"} 👋
//           </h1>
//           <p className="text-gray-500 text-sm">{user?.email}</p>
//         </div>
//       </div>

//       <h2 className="text-xl font-bold mb-4">📦 My Orders</h2>

//       {ordersLoading ? (
//         <div className="text-center py-10">
//           <span className="loading loading-spinner loading-lg text-orange-500" />
//         </div>
//       ) : orders.length === 0 ? (
//         <div className="text-center py-16 bg-white rounded-xl shadow border">
//           <p className="text-5xl mb-4">🛍️</p>
//           <p className="text-gray-500 text-lg">No orders yet</p>
//           <button
//             onClick={() => router.push("/")}
//             className="btn btn-primary mt-4"
//           >
//             Start Shopping
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-xl shadow border">
//           <table className="table table-zebra w-full">
//             <thead className="bg-orange-50 text-gray-700 text-sm">
//               <tr>
//                 <th>#</th>
//                 <th>Date</th>
//                 <th>Products</th>
//                 <th className="text-center">Qty</th>
//                 <th className="text-right">Total Paid</th>
//                 <th className="text-center">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {orders.map((order, index) => (
//                 <tr key={order._id} className="align-middle">

//                   <td className="font-semibold text-gray-400">
//                     {index + 1}
//                   </td>

//                   <td className="text-sm text-gray-500 whitespace-nowrap">
//                     {order.createdAt
//                       ? new Date(order.createdAt).toLocaleDateString("en-BD", {
//                           year:  "numeric",
//                           month: "short",
//                           day:   "numeric",
//                         })
//                       : "—"}
//                   </td>

//                   <td className="text-sm">
//                     {order.products?.map((p, i) => (
//                       <div key={i} className="mb-0.5">{p.title}</div>
//                     ))}
//                   </td>

//                   <td className="text-center text-sm">
//                     {order.products?.map((p, i) => (
//                       <div key={i} className="mb-0.5">{p.qty || 1}</div>
//                     ))}
//                   </td>

//                   <td className="text-right font-bold text-orange-500">
//                     Tk {order.total}
//                   </td>

//                   <td className="text-center">
//                     <span
//                       className={`badge badge-sm ${
//                         order.status === "Approved"
//                           ? "badge-success"
//                           : "badge-warning"
//                       }`}
//                     >
//                       {order.status === "Approved" ? "✅ Approved" : "⏳ Pending"}
//                     </span>
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

import { useAuth } from "@/provider/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);

        const auth         = getAuth();
        const firebaseUser = auth.currentUser;
        const email        = firebaseUser?.email || user?.email;

        if (!email) return;

        const res  = await fetch(`/api/orders/user?email=${email}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.log("FETCH ORDERS ERROR:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-orange-300 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">
            Welcome, {user?.name || "User"} 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm truncate">
            {user?.email}
          </p>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-4">📦 My Orders</h2>

      {ordersLoading ? (
        <div className="text-center py-10">
          <span className="loading loading-spinner loading-lg text-orange-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow border">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500 text-lg">No orders yet</p>
          <button
            onClick={() => router.push("/")}
            className="btn btn-primary mt-4"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto rounded-xl shadow border">
            <table className="table table-zebra w-full">
              <thead className="bg-orange-50 text-gray-700 text-sm">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Total Paid</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id} className="align-middle">

                    <td className="font-semibold text-gray-400">
                      {index + 1}
                    </td>

                    <td className="text-sm text-gray-500 whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                            year:  "numeric",
                            month: "short",
                            day:   "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="text-sm">
                      {order.products?.map((p, i) => (
                        <div key={i} className="mb-0.5">{p.title}</div>
                      ))}
                    </td>

                    <td className="text-center text-sm">
                      {order.products?.map((p, i) => (
                        <div key={i} className="mb-0.5">{p.qty || 1}</div>
                      ))}
                    </td>

                    <td className="text-right font-bold text-orange-500">
                      Tk {order.total}
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge badge-sm ${
                          order.status === "Approved"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {order.status === "Approved" ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden space-y-3">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b">
                  <span className="text-sm font-semibold text-gray-600">
                    Order #{index + 1}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      order.status === "Approved"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {order.status === "Approved" ? "✅ Approved" : "⏳ Pending"}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Date</span>
                    <span>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                            year:  "numeric",
                            month: "short",
                            day:   "numeric",
                          })
                        : "—"}
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
                    <span>Total Paid</span>
                    <span className="text-orange-500">Tk {order.total}</span>
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
