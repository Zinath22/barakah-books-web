



// "use client";

// import { useEffect } from "react";
// import Swal from "sweetalert2";
// import { getAuth } from "firebase/auth";
// import { useCart } from "@/context/CartContext";

// export default function SuccessPage() {
//   const { cart, clearCart } = useCart();

//   useEffect(() => {
//     const saveOrder = async () => {
//       try {
//         const auth = getAuth();
//         const user = auth.currentUser;

//         if (!user) {
//           console.log("User not found");
//           return;
//         }

//         if (!cart || cart.length === 0) {
//           console.log("Cart Empty");
//           return;
//         }

//         const total = cart.reduce(
//           (sum, item) => sum + Number(item.price || 0),
//           0
//         );

//         const orderData = {
//           userEmail: user.email,
//           products: cart,
//           total,
//           payment: "Paid",
//           status: "Pending",
//         };

//         console.log("ORDER DATA:", orderData);

//         const res = await fetch("/api/orders", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(orderData),
//         });

//         console.log("API STATUS:", res.status);

//         const data = await res.json();

//         console.log("API RESPONSE:", data);

//         if (data.success) {
//           clearCart();

//           Swal.fire({
//             icon: "success",
//             title: "Payment Successful",
//             text: "Your order has been placed successfully.",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//         } else {
//           Swal.fire({
//             icon: "error",
//             title: "Order Save Failed",
//             text: data.message || "Something went wrong",
//           });
//         }
//       } catch (error) {
//         console.log("SAVE ORDER ERROR:", error);

//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Something went wrong",
//         });
//       }
//     };

//     if (cart.length > 0) {
//       saveOrder();
//     }
//   }, [cart, clearCart]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white shadow-xl rounded-xl p-10 text-center">
//         <h1 className="text-4xl font-bold text-green-600 mb-4">
//           ✅ Payment Successful
//         </h1>

//         <p className="text-gray-600">
//           Thank you for your purchase.
//         </p>

//         <p className="text-sm text-gray-500">
//          Your order has been saved successfully.
//      </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import { getAuth } from "firebase/auth";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { cart, clearCart } = useCart();

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log("User not found");
          return;
        }

        if (!cart || cart.length === 0) {
          console.log("Cart Empty");
          return;
        }

        const total = cart.reduce(
          (sum, item) => sum + Number(item.price || 0),
          0
        );

        // 🔥 Get coupon data from localStorage
        let couponData = null;
        try {
          const saved = localStorage.getItem("appliedCoupon");
          if (saved) {
            couponData = JSON.parse(saved);
          }
        } catch (e) {
          console.log("Coupon parse error:", e);
        }

        const orderData = {
          userEmail:      user.email,
          products:       cart,
          originalAmount: couponData ? couponData.originalAmount : total,
          discountAmount: couponData ? couponData.discountAmount : 0,
          total:          couponData ? couponData.finalAmount    : total,
          couponCode:     couponData ? couponData.code           : null,
          payment:        "Paid",
          status:         "Pending",
        };

        console.log("ORDER DATA:", orderData);

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        console.log("API STATUS:", res.status);

        const data = await res.json();

        console.log("API RESPONSE:", data);

        if (data.success) {
          clearCart();

          // 🔥 Clear coupon from localStorage after order saved
          localStorage.removeItem("appliedCoupon");

          Swal.fire({
            icon:              "success",
            title:             "Payment Successful",
            text:              "Your order has been placed successfully.",
            timer:             2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon:  "error",
            title: "Order Save Failed",
            text:  data.message || "Something went wrong",
          });
        }
      } catch (error) {
        console.log("SAVE ORDER ERROR:", error);

        Swal.fire({
          icon:  "error",
          title: "Error",
          text:  "Something went wrong",
        });
      }
    };

    if (cart.length > 0) {
      saveOrder();
    }
  }, [cart, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-10 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Payment Successful
        </h1>

        <p className="text-gray-600">
          Thank you for your purchase.
        </p>

        <p className="text-sm text-gray-500">
          Your order has been saved successfully.
        </p>
      </div>
    </div>
  );
}
