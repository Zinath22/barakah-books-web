import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    const db = await dbConnect();

    // 🔍 check if exists
    const existing = await db
      .collection("users")
      .findOne({ email });

    if (existing) {
      return Response.json({ success: true });
    }

    // 🔥 insert new user
    await db.collection("users").insertOne({
      email,
      name,
      role: "user", // 🔥 DEFAULT ROLE
      createdAt: new Date(),
    });

    return Response.json({ success: true });

  } catch (error) {
    console.log("SAVE USER ERROR:", error);

    return Response.json(
      { success: false },
      { status: 500 }
    );
  }
}