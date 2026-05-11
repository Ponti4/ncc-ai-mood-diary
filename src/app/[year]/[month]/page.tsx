import Link from "next/link";
import { getMonthEntries } from "@/lib/db";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);

  const entryMap = await Promise.resolve(getMonthEntries(year, month));

  const firstDay = new Date(y, m - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const prevMonth = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
  const nextMonth = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg bg-green-100 rounded-2xl shadow-md p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/${prevMonth.y}/${pad(prevMonth.m)}`}
            className="text-2xl text-green-700 hover:text-green-900 px-2"
          >
            ‹
          </Link>
          <h1 className="text-xl font-bold text-green-900">
            {y}년 {m}월
          </h1>
          <Link
            href={`/${nextMonth.y}/${pad(nextMonth.m)}`}
            className="text-2xl text-green-700 hover:text-green-900 px-2"
          >
            ›
          </Link>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-green-700"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${pad(m)}-${pad(day)}`;
            const isToday = dateStr === todayStr;
            const hasEntry = entryMap.has(dateStr);
            const mood = entryMap.get(dateStr);
            const dayOfWeek = (startOffset + i) % 7;

            return (
              <Link
                key={dateStr}
                href={`/diary/${dateStr}`}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors hover:bg-green-200 ${
                  isToday ? "bg-green-300 font-bold" : ""
                }`}
              >
                <span
                  className={`text-sm ${
                    dayOfWeek === 0
                      ? "text-red-400"
                      : dayOfWeek === 6
                      ? "text-blue-400"
                      : "text-green-900"
                  }`}
                >
                  {day}
                </span>
                {hasEntry && (
                  mood
                    ? <span className="text-base leading-none mt-0.5">{mood}</span>
                    : <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
