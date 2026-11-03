import { ObjectId } from "mongodb";
import { dbConnect } from "@/lib/dbConnect";
import { todayStr } from "@/lib/reading";

// =========================
// কতটুকু পড়েছে আপডেট
// PATCH /api/reading/:id
// body: { userEmail, currentPage }  — এখন কোন পৃষ্ঠা পর্যন্ত পড়া হয়েছে
// =========================
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { userEmail, currentPage } = await req.json();

    if (!ObjectId.isValid(id) || !userEmail) {
      return Response.json({ success: false, message: "ভুল অনুরোধ" }, { status: 400 });
    }

    const db = await dbConnect();
    const col = db.collection("readingGoals");
    const goal = await col.findOne({ _id: new ObjectId(id), userEmail });
    if (!goal) {
      return Response.json({ success: false, message: "লক্ষ্য পাওয়া যায়নি" }, { status: 404 });
    }

    const page = Math.round(Number(currentPage));
    if (!Number.isFinite(page) || page < 0) {
      return Response.json({ success: false, message: "সঠিক পৃষ্ঠা নম্বর দিন" }, { status: 400 });
    }
    const newPage = Math.min(page, goal.totalPages);
    const gained = Math.max(0, newPage - (goal.currentPage || 0));

    // আজকের লগ — একই দিনে কয়েকবার আপডেট করলে যোগ হতে থাকে
    const today = todayStr();
    const logs = [...(goal.logs || [])];
    const i = logs.findIndex((l) => l.date === today);
    if (i >= 0) logs[i] = { ...logs[i], pages: logs[i].pages + gained, page: newPage };
    else if (gained > 0 || newPage !== goal.currentPage) logs.push({ date: today, pages: gained, page: newPage });

    const done = newPage >= goal.totalPages;
    const update = {
      currentPage: newPage,
      logs,
      status: done ? "completed" : "active",
      updatedAt: new Date(),
      ...(done && !goal.completedAt ? { completedAt: new Date(), completedDate: today } : {}),
    };

    await col.updateOne({ _id: goal._id }, { $set: update });
    return Response.json({ success: true, goal: { ...goal, ...update }, gained, completed: done && goal.status !== "completed" });
  } catch (error) {
    console.log("READING PATCH ERROR:", error);
    return Response.json({ success: false, message: "আপডেট করা যায়নি" }, { status: 500 });
  }
}

// =========================
// লক্ষ্য মুছে ফেলা
// DELETE /api/reading/:id?email=...
// =========================
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const email = new URL(req.url).searchParams.get("email");
    if (!ObjectId.isValid(id) || !email) {
      return Response.json({ success: false, message: "ভুল অনুরোধ" }, { status: 400 });
    }

    const db = await dbConnect();
    const result = await db.collection("readingGoals").deleteOne({ _id: new ObjectId(id), userEmail: email });
    if (result.deletedCount === 0) {
      return Response.json({ success: false, message: "লক্ষ্য পাওয়া যায়নি" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.log("READING DELETE ERROR:", error);
    return Response.json({ success: false, message: "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}