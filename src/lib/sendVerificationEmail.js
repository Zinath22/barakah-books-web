import { Resend } from "resend";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// নতুন account এর email যাচাই করার link পাঠায়
export const sendVerificationEmail = async (email, token) => {
  if (!email || !token) throw new Error("Missing email or verification token");
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY নেই — verification email পাঠানো হয়নি");
    return null;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Barakah Books <onboarding@resend.dev>",
    to: email,
    subject: "বারাকাহ বুকস — আপনার ইমেইল যাচাই করুন",
    html: `<h2>আপনার ইমেইল যাচাই করুন</h2><p>নিচের লিংকে ক্লিক করে account চালু করুন:</p><a href="${verifyUrl}">ইমেইল যাচাই করুন</a>`,
  });
};
