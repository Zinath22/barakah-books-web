// import { dbConnect } from "@/lib/db";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const db = await dbConnect();

  if (email) {
    const userCart = await db
      .collection("carts")
      .findOne({ userEmail: email });

    return Response.json(userCart || { items: [] });
  }

  const allCarts = await db
    .collection("carts")
    .find({})
    .toArray();

  return Response.json(allCarts);
}