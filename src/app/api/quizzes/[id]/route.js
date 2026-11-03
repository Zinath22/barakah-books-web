import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";
import { cleanQuiz, hideAnswers } from "@/lib/quiz";

// =========================
// একটা কুইজ
// GET /api/quizzes/:id         → ইউজারের জন্য, সঠিক উত্তর লুকানো
// GET /api/quizzes/:id?full=1  → অ্যাডমিনের এডিট পেজের জন্য, সব তথ্যসহ
// =========================
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });

    const db = await dbConnect();
    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(id) });
    if (!quiz) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });

    const full = new URL(req.url).searchParams.get("full");
    return Response.json({ success: true, quiz: full ? quiz : hideAnswers(quiz) });
  } catch (error) {
    console.log("QUIZ GET ERROR:", error);
    return Response.json({ success: false, message: "কুইজ আনা যায়নি" }, { status: 500 });
  }
}

// =========================
// কুইজ এডিট (অ্যাডমিন)
// PATCH /api/quizzes/:id
// =========================
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });

    const body = await req.json();
    const db = await dbConnect();

    // শুধু প্রকাশ/লুকানো বদলালে
    if (Object.keys(body).length === 1 && "published" in body) {
      await db.collection("quizzes").updateOne({ _id: new ObjectId(id) }, { $set: { published: !!body.published, updatedAt: new Date() } });
      return Response.json({ success: true });
    }

    const { quiz, error } = cleanQuiz(body);
    if (error) return Response.json({ success: false, message: error }, { status: 400 });

    const book = ObjectId.isValid(quiz.bookId) ? await db.collection("products").findOne({ _id: new ObjectId(quiz.bookId) }) : null;
    if (!book) return Response.json({ success: false, message: "বই পাওয়া যায়নি" }, { status: 404 });

    const result = await db
      .collection("quizzes")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...quiz, bookTitle: book.title, bookAuthor: book.author || "", updatedAt: new Date() } }
      );
    if (result.matchedCount === 0) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.log("QUIZ UPDATE ERROR:", error);
    return Response.json({ success: false, message: "আপডেট করা যায়নি" }, { status: 500 });
  }
}

// =========================
// কুইজ মুছে ফেলা (অ্যাডমিন)
// DELETE /api/quizzes/:id
// =========================
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });

    const db = await dbConnect();
    await db.collection("quizzes").deleteOne({ _id: new ObjectId(id) });
    return Response.json({ success: true });
  } catch (error) {
    console.log("QUIZ DELETE ERROR:", error);
    return Response.json({ success: false, message: "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}