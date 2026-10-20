// "use client";

// import { useEffect, useState } from "react";

// export default function ReviewList({ productId }) {
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     fetch(`/api/reviews?productId=${productId}`)
//       .then((res) => res.json())
//       .then((data) => setReviews(data));
//   }, [productId]);

//   return (
//     <div className="mt-10">

//       <h2 className="text-lg font-semibold mb-4">
//         সব মতামত
//       </h2>

//       {reviews.length === 0 ? (
//         <p>এখনো কোনো মতামত নেই। প্রথম মতামতটি আপনিই দিন!</p>
//       ) : (
//         reviews.map((review) => (
//           <div
//             key={review._id}
//             className="border border-base-300 rounded-xl p-4 mb-3"
//           >
//             <h3 className="font-bold">
//               {review.name}
//             </h3>

//             <p>
//               {"⭐".repeat(review.rating)}
//             </p>

//             <p className="mt-2">
//               {review.review}
//             </p>
//           </div>
//         ))
//       )}

//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

export default function ReviewList({
  productId,
}) {
  const [reviews, setReviews] =
    useState([]);

  useEffect(() => {
    fetch(
      `/api/reviews?productId=${productId}`
    )
      .then((res) => res.json())
      .then((data) =>
        setReviews(data)
      );
  }, [productId]);

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">
        সব মতামত
      </h2>

      {reviews.length === 0 ? (
        <p>
          এখনো কোনো মতামত নেই। প্রথম মতামতটি আপনিই দিন!
        </p>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="border border-base-300 rounded-xl p-4 mb-3"
          >
            <h3 className="font-bold">
              {review.name}
            </h3>

            <p className="text-secondary">
              {"⭐".repeat(
                review.rating
              )}
            </p>

            <p className="mt-2">
              {review.review}
            </p>
          </div>
        ))
      )}
    </div>
  );
}