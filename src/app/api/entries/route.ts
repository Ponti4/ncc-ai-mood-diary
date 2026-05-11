import { NextRequest, NextResponse } from "next/server";
import { getMonthEntries } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  const map = getMonthEntries(year, month);
  const entries = Array.from(map.entries()).map(([date, mood]) => ({ date, mood }));
  return NextResponse.json({ entries });
}
