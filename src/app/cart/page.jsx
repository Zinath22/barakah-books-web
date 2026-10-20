

// "use client";

// import { useState } from "react";
// import { useCart } from "@/context/CartContext";
// import { FaTrash } from "react-icons/fa";
// import Swal from "sweetalert2";
// import CouponInput from "@/components/CouponInput";

// export default function CartPage() {
//   const { cart, removeFromCart } = useCart();

//   const [coupon, setCoupon] = useState(null);

//   const handleDelete = (id) => {
//     Swal.fire({
//       title: "Remove Item?",
//       text: "This item will be removed from cart",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         removeFromCart(id);
//         setCoupon(null);
//         localStorage.removeItem("appliedCoupon");
//         Swal.fire("Deleted!", "Item removed from cart", "success");
//       }
//     });
//   };

//   const totalPrice = cart.reduce(
//     (sum, item) => sum + Number(item.price || 0),
//     0
//   );

//   const discountAmount = coupon ? coupon.discountAmount : 0;
//   const finalAmount    = coupon ? coupon.finalAmount    : totalPrice;

//   const handleApplyCoupon = (result) => {
//     setCoupon(result);

//     // 🔥 Save coupon data to localStorage so success page can use it
//     localStorage.setItem("appliedCoupon", JSON.stringify({
//       code:           result.code,
//       discountAmount: result.discountAmount,
//       finalAmount:    result.finalAmount,
//       originalAmount: totalPrice,
//     }));
//   };

//   const handleRemoveCoupon = () => {
//     setCoupon(null);
//     localStorage.removeItem("appliedCoupon");
//   };

//   const handleCheckout = async () => {
//     try {
//       if (totalPrice <= 0) {
//         Swal.fire("Error", "কার্ট খালি", "error");
//         return;
//       }

//       if (coupon) {
//         const validateRes = await fetch("/api/coupons/validate", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             code:        coupon.code,
//             orderAmount: totalPrice,
//             userEmail:   "customer@test.com",
//           }),
//         });

//         const validateData = await validateRes.json();

//         if (!validateData.success) {
//           Swal.fire("Coupon Error", validateData.message, "error");
//           setCoupon(null);
//           localStorage.removeItem("appliedCoupon");
//           return;
//         }
//       }

//       const res = await fetch("/api/payment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount:         finalAmount,
//           name:           "Barakah Books Customer",
//           email:          "customer@test.com",
//           phone:          "01700000000",
//           products:       cart.map((item) => ({
//             title: item.title,
//             price: item.price,
//             qty:   item.qty || 1,
//           })),
//           couponCode:     coupon?.code        || null,
//           originalAmount: totalPrice,
//           discountAmount: discountAmount,
//         }),
//       });

//       const data = await res.json();

//       console.log(data);

//       if (data.success && data.url) {
//         window.location.href = data.url;
//       } else {
//         Swal.fire(
//           "Payment Error",
//           data.message || "Payment initialization failed",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Swal.fire("Error", "Something went wrong", "error");
//     }
//   };

//   return (
//     <div className="p-5 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-5">
//         🛒 আমার কার্ট
//       </h1>

//       {cart.length === 0 ? (
//         <p className="text-center text-gray-500">
//           No items in cart
//         </p>
//       ) : (
//         <>
//           <div className="space-y-4">
//             {cart.map((item) => (
//               <div
//                 key={item._id}
//                 className="flex gap-4 border p-4 rounded-lg shadow-sm items-center"
//               >
//                 <img
//                   src={item.img || "/no-image.png"}
//                   alt={item.title}
//                   className="w-24 h-24 object-cover rounded"
//                 />

//                 <div className="flex-1">
//                   <h2 className="font-semibold text-lg">
//                     {item.title}
//                   </h2>

//                   <p className="text-gray-600">
//                     {item.description || "No description"}
//                   </p>

//                   <p className="text-primary font-bold mt-2">
//                     TK {item.price}
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => handleDelete(item._id)}
//                   className="btn btn-error btn-sm"
//                 >
//                   <FaTrash />
//                 </button>
//               </div>
//             ))}
//           </div>

//           <CouponInput
//             orderAmount={totalPrice}
//             userEmail="customer@test.com"
//             onApply={handleApplyCoupon}
//             onRemove={handleRemoveCoupon}
//           />

//           <div className="mt-6 border rounded-lg p-4 bg-base-100 space-y-2">
//             <div className="flex justify-between text-lg">
//               <span>মোট দাম</span>
//               <span>TK {totalPrice}</span>
//             </div>

//             {coupon && (
//               <div className="flex justify-between text-success font-semibold">
//                 <span>Discount ({coupon.code})</span>
//                 <span>- TK {coupon.discountAmount}</span>
//               </div>
//             )}

//             <div className="flex justify-between text-xl font-bold border-t pt-2">
//               <span>সর্বমোট</span>
//               <span>TK {finalAmount}</span>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={handleCheckout}
//               className="btn btn-success btn-lg"
//             >
//               অর্ডার করুন
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



"use client";
import BookCover from "@/components/books/BookCover";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import CouponInput from "@/components/CouponInput";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  const [coupon, setCoupon] = useState(null);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Item?",
      text: "This item will be removed from cart",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(id);
        setCoupon(null);
        localStorage.removeItem("appliedCoupon");
        Swal.fire("Deleted!", "Item removed from cart", "success");
      }
    });
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const discountAmount = coupon ? coupon.discountAmount : 0;
  const finalAmount    = coupon ? coupon.finalAmount    : totalPrice;

  const handleApplyCoupon = (result) => {
    setCoupon(result);
    localStorage.setItem("appliedCoupon", JSON.stringify({
      code:           result.code,
      discountAmount: result.discountAmount,
      finalAmount:    result.finalAmount,
      originalAmount: totalPrice,
    }));
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    localStorage.removeItem("appliedCoupon");
  };

  const handleCheckout = async () => {
    try {
      if (totalPrice <= 0) {
        Swal.fire("Error", "কার্ট খালি", "error");
        return;
      }

      if (coupon) {
        const validateRes = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code:        coupon.code,
            orderAmount: totalPrice,
            userEmail:   "customer@test.com",
          }),
        });

        const validateData = await validateRes.json();

        if (!validateData.success) {
          Swal.fire("Coupon Error", validateData.message, "error");
          setCoupon(null);
          localStorage.removeItem("appliedCoupon");
          return;
        }
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:         finalAmount,
          name:           "Barakah Books Customer",
          email:          "customer@test.com",
          phone:          "01700000000",
          products:       cart.map((item) => ({
            title: item.title,
            price: item.price,
            qty:   item.qty || 1,
          })),
          couponCode:     coupon?.code        || null,
          originalAmount: totalPrice,
          discountAmount: discountAmount,
        }),
      });

      const data = await res.json();

      console.log(data);

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        Swal.fire(
          "Payment Error",
          data.message || "Payment initialization failed",
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-5">
        🛒 আমার কার্ট
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg">আপনার কার্ট খালি</p>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 sm:gap-4 border p-3 sm:p-4 rounded-xl shadow-sm items-center bg-white"
              >
                {/* IMAGE */}
                <div className="w-14 sm:w-20 flex-shrink-0">
                  <BookCover book={item} size="sm" />
                </div>

                {/* DETAILS */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-lg truncate">
                    {item.title}
                  </h2>

                  <p className="text-gray-500 text-xs sm:text-sm truncate">
                    {item.description || "No description"}
                  </p>

                  <p className="text-primary font-bold mt-1 text-sm sm:text-base">
                    TK {item.price}
                  </p>
                </div>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-error btn-sm flex-shrink-0"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* COUPON INPUT */}
          <CouponInput
            orderAmount={totalPrice}
            userEmail="customer@test.com"
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
          />

          {/* PRICE SUMMARY */}
          <div className="mt-4 border rounded-xl p-4 bg-white space-y-2">
            <div className="flex justify-between text-sm sm:text-lg">
              <span className="text-gray-600">মোট দাম</span>
              <span>TK {totalPrice}</span>
            </div>

            {coupon && (
              <div className="flex justify-between text-success font-semibold text-sm sm:text-base">
                <span>Discount ({coupon.code})</span>
                <span>- TK {coupon.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-xl font-bold border-t pt-2">
              <span>সর্বমোট</span>
              <span className="text-primary">TK {finalAmount}</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCheckout}
              className="btn btn-success btn-md sm:btn-lg w-full sm:w-auto"
            >
              অর্ডার করুন
            </button>
          </div>
        </>
      )}
    </div>
  );
}
