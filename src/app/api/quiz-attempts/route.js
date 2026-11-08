import { dbConnect } from "@/lib/dbConnect";

// =========================
// ইউজারের কুইজের ফলাফলের ইতিহাস
// GET /api/quiz-attempts?email=...
// =========================
export async function GET(req) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return Response.json({ success: false, message: "email দরকার" }, { status: 400 });

    const db = await dbConnect();
    const attempts = await db
      .collection("quizAttempts")
      .find({ userEmail: email }, { projection: { answers: 0, results: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return Response.json({ success: true, attempts });
  } catch (error) {
    console.log("QUIZ HISTORY ERROR:", error);
    return Response.json({ success: false, message: "ফলাফল আনা যায়নি" }, { status: 500 });
  }
}