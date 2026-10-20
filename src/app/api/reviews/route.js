// import { dbConnect } from "@/lib/dbConnect";

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     const db = await dbConnect();

//     await db.collection("reviews").insertOne({
//       ...body,
//       createdAt: new Date(),
//     });

//     return Response.json({
//       success: true,
//       message: "Review added",
//     });
//   } catch (error) {
//     return Response.json(
//       {
//         success: false,
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);

//   const productId = searchParams.get("productId");

//   const db = await dbConnect();

//   const reviews = await db
//     .collection("reviews")
//     .find({ productId })
//     .sort({ createdAt: -1 })
//     .toArray();

//   return Response.json(reviews);
// }

import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// GET REVIEWS
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId");

    const db = await dbConnect();

    const reviews = await db
      .collection("reviews")
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(reviews);
  } catch (error) {
    console.log(error);

    return Response.json([], {
      status: 500,
    });
  }
}

// ADD REVIEW
export async function POST(req) {
  try {
    const body = await req.json();

    const db = await dbConnect();

    await db.collection("reviews").insertOne({
      ...body,
      createdAt: new Date(),
    });

    // ALL REVIEWS
    const allReviews = await db
      .collection("reviews")
      .find({
        productId: body.productId,
      })
      .toArray();

    const totalRating = allReviews.reduce(
      (sum, item) => sum + Number(item.rating),
      0
    );

    const avgRating =
      totalRating / allReviews.length;

    // UPDATE PRODUCT
    await db.collection("products").updateOne(
      {
        _id: new ObjectId(body.productId),
      },
      {
        $set: {
          rating: Number(
            avgRating.toFixed(1)
          ),
          reviews: allReviews.length,
        },
      }
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}