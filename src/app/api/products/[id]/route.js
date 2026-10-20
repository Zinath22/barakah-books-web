// import { dbConnect } from "@/lib/dbConnect";
// import { ObjectId } from "mongodb";

// // 🔥 UPDATE PRODUCT
// export async function PATCH(req, { params }) {
//   try {
//     // ✅ await params
//     const { id } = await params;

//     // ❌ invalid id
//     if (!ObjectId.isValid(id)) {
//       return Response.json(
//         {
//           success: false,
//           message: "Invalid product ID",
//         },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();

//     const db = await dbConnect();

//     await db.collection("products").updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           ...body,
//         },
//       }
//     );

//     return Response.json({
//       success: true,
//       message: "Product updated",
//     });

//   } catch (error) {
//     console.log("PATCH ERROR:", error);

//     return Response.json(
//       {
//         success: false,
//         message: "Update failed",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 🔥 DELETE PRODUCT
// export async function DELETE(req, { params }) {
//   try {
//     // ✅ await params
//     const { id } = await params;

//     // ❌ invalid id
//     if (!ObjectId.isValid(id)) {
//       return Response.json(
//         {
//           success: false,
//           message: "Invalid product ID",
//         },
//         { status: 400 }
//       );
//     }

//     const db = await dbConnect();

//     await db.collection("products").deleteOne({
//       _id: new ObjectId(id),
//     });

//     return Response.json({
//       success: true,
//       message: "Product deleted",
//     });

//   } catch (error) {
//     console.log("DELETE ERROR:", error);

//     return Response.json(
//       {
//         success: false,
//         message: "Delete failed",
//       },
//       { status: 500 }
//     );
//   }
// }



import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 🔥 GET SINGLE PRODUCT
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    const product = await db
      .collection("products")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      product,
    });

  } catch (error) {
    console.log("GET ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load product",
      },
      { status: 500 }
    );
  }
}

// 🔥 UPDATE PRODUCT
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const db = await dbConnect();

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
        },
      }
    );

    return Response.json({
      success: true,
      message: "Product updated",
    });

  } catch (error) {
    console.log("PATCH ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Update failed",
      },
      { status: 500 }
    );
  }
}

// 🔥 DELETE PRODUCT
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    return Response.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    console.log("DELETE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Delete failed",
      },
      { status: 500 }
    );
  }
}