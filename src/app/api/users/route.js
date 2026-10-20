import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 🔥 GET ALL USERS
export async function GET() {
  try {
    const db = await dbConnect();

    const users = await db
      .collection("users")
      .find({})
      .project({
        password: 0, // hide password
      })
      .toArray();

    return Response.json({
      success: true,
      users,
    });

  } catch (error) {
    console.log("USERS API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// 🔥 DELETE USER
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    // ❌ no id
    if (!id) {
      return Response.json(
        {
          success: false,
          message: "User ID required",
        },
        { status: 400 }
      );
    }

    // ❌ invalid id
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    // 🔍 find user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(id),
    });

    // ❌ user not found
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // 🚫 prevent admin delete
    if (user.role === "admin") {
      return Response.json(
        {
          success: false,
          message: "Admin cannot be deleted",
        },
        { status: 403 }
      );
    }

    // 🔥 delete user
    await db.collection("users").deleteOne({
      _id: new ObjectId(id),
    });

    return Response.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.log("DELETE USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}