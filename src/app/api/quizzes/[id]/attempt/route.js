import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";

// =========================
// কুইজ জমা দেওয়া — নম্বর সার্ভারে হিসাব হয়, তাই ব্রাউজার থেকে উত্তর দেখে নেওয়া যায় না
// POST /api/quizzes/:id/attempt
// body: { userEmail, userName, answers: [প্রতিটা প্রশ্নে বাছাই করা অপশনের index, না দিলে null] }
// =========================
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { userEmail, userName, answers } = await req.json();

    if (!ObjectId.isValid(id)) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });
    if (!userEmail) return Response.json({ success: false, message: "কুইজ দিতে লগইন করুন" }, { status: 401 });
    if (!Array.isArray(answers)) return Response.json({ success: false, message: "উত্তর পাওয়া যায়নি" }, { status: 400 });

    const db = await dbConnect();
    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(id), published: true });
    if (!quiz) return Response.json({ success: false, message: "কুইজ পাওয়া যায়নি" }, { status: 404 });

    const results = quiz.questions.map((q, i) => {
      const chosen = Number.isInteger(answers[i]) ? answers[i] : null;
      return {
        question: q.question,
        options: q.options,
        chosen,
        answer: q.answer,
        correct: chosen === q.answer,
        explanation: q.explanation,
        source: q.source || "",
      };
    });

    const score = results.filter((r) => r.correct).length;
    const total = results.length;
    const percent = Math.round((score / total) * 100);

    const attempt = {
      quizId: id,
      quizTitle: quiz.title,
      chapter: quiz.chapter || "",
      bookId: quiz.bookId,
      bookTitle: quiz.bookTitle,
      userEmail,
      userName: userName || "",
      answers: results.map((r) => r.chosen),
      results, // কুইজ দেওয়ার সময়ের প্রশ্ন-উত্তর — পরে সমাধান পেজে দেখানোর জন্য
      score,
      total,
      percent,
      createdAt: new Date(),
    };
    const saved = await db.collection("quizAttempts").insertOne(attempt);

    return Response.json({ success: true, attemptId: saved.insertedId, score, total, percent, results });
  } catch (error) {
    console.log("QUIZ ATTEMPT ERROR:", error);
    return Response.json({ success: false, message: "কুইজ জমা দেওয়া যায়নি" }, { status: 500 });
  }
}