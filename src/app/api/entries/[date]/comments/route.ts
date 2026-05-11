import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const comments = getComments(date);
  return NextResponse.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const body = await request.json();
  const content: string = (body.content ?? "").trim().slice(0, 50000);
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const comment = addComment(date, content);
  return NextResponse.json({ comment }, { status: 201 });
}
