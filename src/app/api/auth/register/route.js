import { NextResponse } from "next/server";
import { postUser } from "@/actions/server/auth";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await postUser(body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}