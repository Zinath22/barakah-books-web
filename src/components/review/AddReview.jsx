// "use client";

// import { useState } from "react";
// import Swal from "sweetalert2";

// export default function AddReview({ productId }) {
//   const [rating, setRating] = useState(5);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = e.target;

//     const reviewData = {
//       productId,
//       name: form.name.value,
//       email: form.email.value,
//       review: form.review.value,
//       rating,
//     };

//     const res = await fetch("/api/reviews", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(reviewData),
//     });

//     const data = await res.json();

//     if (data.success) {
//       Swal.fire(
//         "ধন্যবাদ!",
//         "Review submitted",
//         "success"
//       );

//       form.reset();
//     }
//   };

//   return (
//     <div className="border rounded-xl p-5 mt-10">
//       <h2 className="text-2xl font-bold mb-5">
//         Add Review
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-4">

//         <input
//           name="name"
//           placeholder="Name"
//           className="input input-bordered w-full"
//           required
//         />

//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           className="input input-bordered w-full"
//           required
//         />

//         <select
//           className="select select-bordered w-full"
//           value={rating}
//           onChange={(e) =>
//             setRating(Number(e.target.value))
//           }
//         >
//           <option value={5}>⭐⭐⭐⭐⭐</option>
//           <option value={4}>⭐⭐⭐⭐</option>
//           <option value={3}>⭐⭐⭐</option>
//           <option value={2}>⭐⭐</option>
//           <option value={1}>⭐</option>
//         </select>

//         <textarea
//           name="review"
//           placeholder="Write review..."
//           className="textarea textarea-bordered w-full"
//           required
//         />

//         <button className="btn btn-primary">
//           মতামত দিন
//         </button>

//       </form>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function AddReview({
  productId,
}) {
  const [rating, setRating] =
    useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const reviewData = {
      productId,
      name: form.name.value,
      email: form.email.value,
      review: form.review.value,
      rating,
    };

    const res = await fetch(
      "/api/reviews",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          reviewData
        ),
      }
    );

    const data = await res.json();

    if (data.success) {
      Swal.fire(
        "ধন্যবাদ!",
        "আপনার মতামত যোগ হয়েছে",
        "success"
      );

      form.reset();
    }
  };

  return (
    <div className="border rounded-xl p-5">
      <h2 className="text-2xl font-bold mb-5">
        মতামত লিখুন
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="আপনার নাম"
          className="input input-bordered w-full"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="আপনার ইমেইল"
          className="input input-bordered w-full"
          required
        />

        <select
          className="select select-bordered w-full"
          value={rating}
          onChange={(e) =>
            setRating(
              Number(
                e.target.value
              )
            )
          }
        >
          <option value="5">
            ⭐⭐⭐⭐⭐
          </option>

          <option value="4">
            ⭐⭐⭐⭐
          </option>

          <option value="3">
            ⭐⭐⭐
          </option>

          <option value="2">
            ⭐⭐
          </option>

          <option value="1">
            ⭐
          </option>
        </select>

        <textarea
          name="review"
          className="textarea textarea-bordered w-full"
          placeholder="বইটি কেমন লাগলো লিখুন..."
          required
        />

        <button className="btn btn-primary">
          মতামত দিন
        </button>
      </form>
    </div>
  );
}