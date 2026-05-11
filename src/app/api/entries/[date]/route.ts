import { NextRequest, NextResponse } from "next/server";
import { getEntry, upsertMood } from "@/lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const entry = getEntry(date);
  return NextResponse.json(entry ?? { date, mood: null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const body = await request.json();
  const mood: string | null = body.mood ?? null;

  upsertMood(date, mood);
  return NextResponse.json({ success: true });
}
