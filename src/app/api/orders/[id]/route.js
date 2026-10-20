// import { dbConnect } from "@/lib/dbConnect";
// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// export async function PATCH(req, { params }) {
//   const db = await dbConnect();

//   await db.collection("orders").updateOne(
//     {
//       _id: new ObjectId(params.id),
//     },
//     {
//       $set: {
//         orderStatus: "Approved",
//       },
//     }
//   );

//   return NextResponse.json({
//     success: true,
//   });
// }

import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status:      "Approved",
          orderStatus: "Approved",
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order approved successfully",
    });
  } catch (error) {
    console.log("APPROVE ORDER ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}