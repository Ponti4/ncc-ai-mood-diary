import { NextRequest, NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const content: string = (body.content ?? "").trim().slice(0, 50000);
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const comment = updateComment(numId, content);
  return NextResponse.json({ comment });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  deleteComment(numId);
  return NextResponse.json({ success: true });
}
