import { dbConnect } from "@/lib/dbConnect";

// 🔥 GET ALL PRODUCTS
export async function GET() {
  try {
    const db = await dbConnect();

    const products = await db
      .collection("products")
      .find({})
      .toArray();

    return Response.json({
      success: true,
      products,
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// 🔥 ADD PRODUCT
export async function POST(req) {
  try {
    const body = await req.json();

    const db = await dbConnect();

    const result = await db
      .collection("products")
      .insertOne({
        ...body,
        createdAt: new Date(),
      });

    return Response.json({
      success: true,
      insertedId: result.insertedId,
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to add product",
      },
      { status: 500 }
    );
  }
}