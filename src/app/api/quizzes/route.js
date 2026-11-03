import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";
import { cleanQuiz } from "@/lib/quiz";

// =========================
// কুইজের তালিকা (প্রশ্ন ছাড়া, শুধু সংক্ষেপ)
// GET /api/quizzes            → প্রকাশিত সব কুইজ
// GET /api/quizzes?bookId=... → একটা বইয়ের কুইজ
// GET /api/quizzes?all=1      → অ্যাডমিনের জন্য, অপ্রকাশিতসহ
// =========================
export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const filter = {};
    if (sp.get("bookId")) filter.bookId = sp.get("bookId");
    if (!sp.get("all")) filter.published = true;

    const db = await dbConnect();
    const quizzes = await db.collection("quizzes").find(filter).sort({ bookTitle: 1, createdAt: 1 }).toArray();

    // তালিকায় প্রশ্ন পাঠাই না, শুধু কয়টা প্রশ্ন আছে
    return Response.json({
      success: true,
      quizzes: quizzes.map(({ questions, ...q }) => ({ ...q, questionCount: (questions || []).length })),
    });
  } catch (error) {
    console.log("QUIZ LIST ERROR:", error);
    return Response.json({ success: false, message: "কুইজ আনা যায়নি" }, { status: 500 });
  }
}

// =========================
// নতুন কুইজ (অ্যাডমিন)
// POST /api/quizzes
// =========================
export async function POST(req) {
  try {
    const { quiz, error } = cleanQuiz(await req.json());
    if (error) return Response.json({ success: false, message: error }, { status: 400 });

    const db = await dbConnect();
    if (!ObjectId.isValid(quiz.bookId)) {
      return Response.json({ success: false, message: "বই পাওয়া যায়নি" }, { status: 404 });
    }
    const book = await db.collection("products").findOne({ _id: new ObjectId(quiz.bookId) });
    if (!book) return Response.json({ success: false, message: "বই পাওয়া যায়নি" }, { status: 404 });

    const now = new Date();
    const doc = { ...quiz, bookTitle: book.title, bookAuthor: book.author || "", createdAt: now, updatedAt: now };
    const result = await db.collection("quizzes").insertOne(doc);
    return Response.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.log("QUIZ CREATE ERROR:", error);
    return Response.json({ success: false, message: "কুইজ সেভ করা যায়নি" }, { status: 500 });
  }
}