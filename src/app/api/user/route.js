import { dbConnect } from "@/lib/dbConnect";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const db = await dbConnect();

    const user = await db.collection("users").findOne({ email });

    return Response.json(user);

  } catch (error) {
    return Response.json(
      { message: "User not found" },
      { status: 500 }
    );
  }
}