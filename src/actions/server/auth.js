// "use server";

// import { collections, dbConnect } from "@/lib/dbConnect";
// import bcrypt from "bcryptjs";

// // REGISTER
// export const postUser = async (payload) => {
//   const { email, password, name } = payload;

//   if (!email || !password) {
//     return { success: false, message: "Missing fields" };
//   }

//   // ✅ FIX: get db first
//   const db = await dbConnect();
//   const users = db.collection(collections.USERS);

//   const exist = await users.findOne({ email });

//   if (exist) {
//     return { success: false, message: "User already exists" };
//   }

//   const hashed = await bcrypt.hash(password, 10);

//   await users.insertOne({
//     name,
//     email,
//     password: hashed,
//     role: "user",
//     createdAt: new Date(),
//   });

//   return { success: true };
// };


// // LOGIN
// export const loginUser = async ({ email, password }) => {
//   if (!email || !password) {
//     return { success: false, message: "Missing fields" };
//   }

//   // ✅ FIX: get db first
//   const db = await dbConnect();
//   const users = db.collection(collections.USERS);

//   const user = await users.findOne({ email });

//   if (!user) {
//     return { success: false, message: "User not found" };
//   }

//   const ok = await bcrypt.compare(password, user.password);

//   if (!ok) {
//     return { success: false, message: "Wrong password" };
//   }

//   // remove password
//   const { password: _, ...safeUser } = user;

//   return { success: true, user: safeUser };
// };


import { dbConnect } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export const postUser = async (form) => {
  try {
    const db = await dbConnect();
    const users = db.collection("users");

    if (!form.name || !form.email || !form.password) {
      return {
        success: false,
        message: "Name, email, and password are required",
      };
    }

    // 🔍 check existing user
    const existingUser = await users.findOne({
      email: form.email,
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    // 🔐 password hash
    const hashedPassword = await bcrypt.hash(form.password, 10);

    // 🔑 generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // 💾 save user in DB
    await users.insertOne({
      name: form.name,
      email: form.email,
      password: hashedPassword,
      verified: false,
      verifyToken: token,
      createdAt: new Date(),
    });

    // 📧 send verification email
    await sendVerificationEmail(form.email, token);

    return {
      success: true,
      message: "Registration successful. Please verify your email.",
    };

  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return {
      success: false,
      message: error.message,
    };
  }
};