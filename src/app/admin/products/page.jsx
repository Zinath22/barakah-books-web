

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Swal from "sweetalert2";

// export default function AdminProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔥 LOAD PRODUCTS
//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const res = await fetch("/api/products", {
//           cache: "no-store",
//         });

//         const data = await res.json();

//         if (data.success) {
//           setProducts(data.products);
//         }
//       } catch (error) {
//         console.log("LOAD ERROR:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProducts();
//   }, []);

//   // 🔥 DELETE PRODUCT
//   const deleteProduct = async (id) => {
//     try {
//       const confirm = await Swal.fire({
//         title: "বইটি মুছে ফেলবেন?",
//         text: "এটি আর ফেরত আনা যাবে না",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "হ্যাঁ, মুছুন",
//       });

//       if (!confirm.isConfirmed) return;

//       const res = await fetch(`/api/products/${id}`, {
//         method: "DELETE",
//       });

//       const data = await res.json();

//       if (data.success) {
//         Swal.fire(
//           "Deleted!",
//           "বইটি মুছে ফেলা হয়েছে",
//           "success"
//         );

//         // 🔥 REMOVE FROM UI
//         setProducts((prev) =>
//           prev.filter((p) => p._id !== id)
//         );
//       } else {
//         Swal.fire(
//           "Error",
//           data.message || "Delete failed",
//           "error"
//         );
//       }

//     } catch (error) {
//       console.log("DELETE ERROR:", error);

//       Swal.fire(
//         "Error",
//         "Server error",
//         "error"
//       );
//     }
//   };

//   // 🔥 LOADING
//   if (loading) {
//     return (
//       <div className="p-5">
//         <p>Loading products...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-5">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-5">

//         <h1 className="text-2xl font-bold">
//           Manage Products ({products.length})
//         </h1>

//         <Link href="/admin/products/add">
//           <button className="btn btn-primary">
//             Add Product
//           </button>
//         </Link>

//       </div>

//       {/* EMPTY */}
//       {products.length === 0 ? (
//         <p>এখনো কোনো বই নেই</p>
//       ) : (
//         <div className="space-y-3">
// {products.map((product) => (
//   <div
//     key={product._id.toString()}
//     className="border p-4 rounded-lg flex justify-between items-center"
//   >

//     <div className="flex items-center gap-4">

//       <img
//         src={product.img}
//         alt={product.title}
//         className="w-16 h-16 object-cover rounded"
//       />

//       <div>
//         <p className="font-bold text-lg">
//           {product.title}
//         </p>

//         <p className="text-sm text-gray-500">
//           Tk {product.price}
//         </p>
//       </div>

//     </div>

//     <div className="flex gap-2">

//       <Link
//         href={`/admin/products/edit/${product._id.toString()}`}
//       >
//         <button className="btn btn-warning btn-sm">
//           Edit
//         </button>
//       </Link>

//       <button
//         onClick={() =>
//           deleteProduct(product._id.toString())
//         }
//         className="btn btn-error btn-sm"
//       >
//         Delete
//       </button>

//     </div>

//   </div>
// ))}

//         </div>
//       )}
//     </div>
//   );
// }



"use client";
import BookCover from "@/components/books/BookCover";
import { taka, toBn } from "@/lib/books";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // 🔥 LOAD PRODUCTS
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res  = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.log("LOAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 🔥 DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      const confirm = await Swal.fire({
        title:             "বইটি মুছে ফেলবেন?",
        text:              "এটি আর ফেরত আনা যাবে না",
        icon:              "warning",
        showCancelButton:  true,
        confirmButtonText: "হ্যাঁ, মুছুন",
      });

      if (!confirm.isConfirmed) return;

      const res  = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Deleted!", "বইটি মুছে ফেলা হয়েছে", "success");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        Swal.fire("Error", data.message || "Delete failed", "error");
      }
    } catch (error) {
      console.log("DELETE ERROR:", error);
      Swal.fire("Error", "Server error", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold">
          📚 বই ম্যানেজ ({products.length})
        </h1>

        <Link href="/admin/products/add">
          <button className="btn btn-primary btn-sm sm:btn-md">
            + নতুন বই
          </button>
        </Link>
      </div>

      {/* EMPTY */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow border">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500">এখনো কোনো বই নেই</p>
          <Link href="/admin/products/add">
            <button className="btn btn-primary mt-4">বই যোগ করুন</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product._id.toString()}
              className="border p-3 sm:p-4 rounded-xl bg-white shadow-sm flex flex-wrap sm:flex-nowrap justify-between items-center gap-3"
            >
              {/* PRODUCT INFO */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-11 sm:w-12 flex-shrink-0">
                  <BookCover book={product} size="sm" />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-sm sm:text-lg truncate">
                    {product.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {product.author || "—"} · {product.category || "ক্যাটাগরি নেই"}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {taka(product.price)}
                    {product.stock !== undefined && product.stock !== "" && (
                      <span className={`ml-2 text-xs font-normal ${Number(product.stock) > 0 ? "text-gray-500" : "text-error"}`}>
                        স্টক: {toBn(product.stock)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/admin/products/edit/${product._id.toString()}`}>
                  <button className="btn btn-warning btn-sm">
                    এডিট
                  </button>
                </Link>

                <button
                  onClick={() => deleteProduct(product._id.toString())}
                  className="btn btn-error btn-sm"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
