import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";

// =========================
// একটা কুইজের সমাধান (কোন প্রশ্ন সঠিক / ভুল হয়েছিল)
// GET /api/quiz-attempts/:id?email=...
// শুধু যে ইউজার কুইজ দিয়েছে, সে-ই দেখতে পারবে
// =========================
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const email = new URL(req.url).searchParams.get("email");

    if (!ObjectId.isValid(id) || !email) {
      return Response.json({ success: false, message: "ভুল অনুরোধ" }, { status: 400 });
    }

    const db = await dbConnect();
    const attempt = await db.collection("quizAttempts").findOne({ _id: new ObjectId(id), userEmail: email });
    if (!attempt) {
      return Response.json({ success: false, message: "ফলাফল পাওয়া যায়নি" }, { status: 404 });
    }

    // নতুন attempt এ কুইজ দেওয়ার সময়ের প্রশ্নগুলো সেভ থাকে (পরে অ্যাডমিন বদলালেও ঠিক দেখায়)
    let results = attempt.results;
    let changed = false;

    // পুরোনো attempt এ শুধু উত্তর আছে — বর্তমান কুইজ থেকে মিলিয়ে বানানো হয়
    if (!Array.isArray(results)) {
      const quiz = ObjectId.isValid(attempt.quizId)
        ? await db.collection("quizzes").findOne({ _id: new ObjectId(attempt.quizId) })
        : null;
      if (!quiz) {
        return Response.json({ success: false, message: "এই কুইজটি মুছে ফেলা হয়েছে, তাই সমাধান দেখানো যাচ্ছে না" }, { status: 404 });
      }
      const answers = attempt.answers || [];
      results = quiz.questions.map((q, i) => {
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
      changed = quiz.questions.length !== attempt.total;
    }

    const { answers, ...rest } = attempt;
    return Response.json({ success: true, attempt: { ...rest, results }, quizChanged: changed });
  } catch (error) {
    console.log("QUIZ SOLUTION ERROR:", error);
    return Response.json({ success: false, message: "সমাধান আনা যায়নি" }, { status: 500 });
  }
}