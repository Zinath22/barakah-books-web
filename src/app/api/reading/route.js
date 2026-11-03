import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";
import { addDays, planGoal, todayStr } from "@/lib/reading";

// =========================
// ইউজারের সব পড়ার লক্ষ্য
// GET /api/reading?email=...
// =========================
export async function GET(req) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) {
      return Response.json({ success: false, message: "email দরকার" }, { status: 400 });
    }

    const db = await dbConnect();
    const goals = await db
      .collection("readingGoals")
      .find({ userEmail: email })
      .sort({ status: 1, updatedAt: -1 }) // চলমান লক্ষ্য আগে
      .toArray();

    return Response.json({ success: true, goals });
  } catch (error) {
    console.log("READING GET ERROR:", error);
    return Response.json({ success: false, message: "লক্ষ্য আনা যায়নি" }, { status: 500 });
  }
}

// =========================
// নতুন পড়ার লক্ষ্য
// POST /api/reading
// body: { userEmail, bookId, totalPages, goalType: "days" | "daily", targetDays, dailyPages }
// =========================
export async function POST(req) {
  try {
    const body = await req.json();
    const { userEmail, bookId } = body;

    if (!userEmail || !bookId || !ObjectId.isValid(bookId)) {
      return Response.json({ success: false, message: "লগইন করে একটি বই বেছে নিন" }, { status: 400 });
    }

    const db = await dbConnect();
    const book = await db.collection("products").findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      return Response.json({ success: false, message: "বই পাওয়া যায়নি" }, { status: 404 });
    }

    // একই বইয়ের একটা চলমান লক্ষ্য থাকলে নতুন করে বানানো যাবে না
    const running = await db.collection("readingGoals").findOne({ userEmail, bookId, status: "active" });
    if (running) {
      return Response.json({ success: false, message: "এই বইয়ের একটা লক্ষ্য আগে থেকেই চলছে" }, { status: 409 });
    }

    const totalPages = Number(body.totalPages) || Number(book.pages) || 0;
    if (totalPages < 1 || totalPages > 10000) {
      return Response.json({ success: false, message: "বইয়ের পৃষ্ঠা সংখ্যা দিন" }, { status: 400 });
    }

    const goalType = body.goalType === "daily" ? "daily" : "days";
    const plan = planGoal({ totalPages, goalType, targetDays: body.targetDays, dailyPages: body.dailyPages });
    if (plan.targetDays > 3650) {
      return Response.json({ success: false, message: "লক্ষ্য ১০ বছরের কম রাখুন" }, { status: 400 });
    }

    const startDate = todayStr();
    const now = new Date();
    const goal = {
      userEmail,
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author || "",
      bookImg: book.img || book.image || "",
      goalType,
      ...plan,
      startDate,
      deadline: addDays(startDate, plan.targetDays - 1),
      currentPage: 0,
      status: "active",
      logs: [], // [{ date: "YYYY-MM-DD", pages: সেদিন কত পৃষ্ঠা, page: সেদিন শেষে কোন পৃষ্ঠায় }]
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("readingGoals").insertOne(goal);
    return Response.json({ success: true, goal: { ...goal, _id: result.insertedId } });
  } catch (error) {
    console.log("READING POST ERROR:", error);
    return Response.json({ success: false, message: "লক্ষ্য সেভ করা যায়নি" }, { status: 500 });
  }
}