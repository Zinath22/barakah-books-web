import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: "admin" } }
    );

    return NextResponse.json({
      success: true,
      message: "User promoted to admin",
    });

  } catch (error) {
    console.log("MAKE ADMIN ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}