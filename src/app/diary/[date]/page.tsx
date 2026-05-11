import { notFound } from "next/navigation";
import { getEntry, getComments } from "@/lib/db";
import DiaryEditor from "./DiaryEditor";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DiaryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!DATE_RE.test(date)) {
    notFound();
  }

  const entry = getEntry(date);
  const comments = getComments(date);

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-2 bg-amber-50">
        <h2 className="text-lg font-bold text-gray-700">{dateLabel}</h2>
      </div>
      <DiaryEditor
        date={date}
        initialMood={entry?.mood ?? null}
        initialComments={comments}
      />
    </div>
  );
}
