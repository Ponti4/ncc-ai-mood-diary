"use client";

import { useState } from "react";
import Link from "next/link";

const MOODS = [
  { emoji: "😊", label: "행복" },
  { emoji: "🙂", label: "좋음" },
  { emoji: "😐", label: "보통" },
  { emoji: "😔", label: "슬픔" },
  { emoji: "😢", label: "힘듦" },
  { emoji: "😠", label: "화남" },
];

interface Comment {
  id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DiaryEditor({
  date,
  initialMood,
  initialComments,
}: {
  date: string;
  initialMood?: string | null;
  initialComments: Comment[];
}) {
  const [year, month] = date.split("-");

  const [mood, setMood] = useState<string | null>(initialMood ?? null);
  const [moodStatus, setMoodStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newText, setNewText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function saveMood() {
    setMoodStatus("saving");
    try {
      const res = await fetch(`/api/entries/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      if (!res.ok) throw new Error();
      setMoodStatus("saved");
      setTimeout(() => setMoodStatus("idle"), 2000);
    } catch {
      setMoodStatus("error");
      setTimeout(() => setMoodStatus("idle"), 2000);
    }
  }

  async function handleAddComment() {
    if (!newText.trim()) return;
    const res = await fetch(`/api/entries/${date}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newText.trim() }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewText("");
      setIsAdding(false);
    }
  }

  async function handleUpdateComment(id: number) {
    if (!editText.trim()) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText.trim() }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? comment : c)));
      setEditingId(null);
    }
  }

  async function handleDeleteComment(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
    }
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditText(comment.content);
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <Link
          href={`/${year}/${month}`}
          className="text-amber-600 hover:text-amber-800 text-sm font-medium"
        >
          ← 달력으로
        </Link>
        <button
          onClick={saveMood}
          disabled={moodStatus === "saving"}
          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {moodStatus === "saving"
            ? "저장 중..."
            : moodStatus === "saved"
            ? "저장됨 ✓"
            : moodStatus === "error"
            ? "오류 발생"
            : "기분 저장"}
        </button>
      </div>

      {/* 기분 선택 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <p className="text-xs text-gray-400 mb-3 font-medium tracking-wide">오늘의 기분</p>
        <div className="flex gap-2">
          {MOODS.map(({ emoji, label }) => {
            const selected = mood === emoji;
            return (
              <button
                key={emoji}
                onClick={() => setMood(selected ? null : emoji)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                  selected
                    ? "border-amber-400 bg-amber-50"
                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className="text-2xl leading-none">{emoji}</span>
                <span className={`text-xs font-medium ${selected ? "text-amber-600" : "text-gray-400"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 코멘트 목록 */}
      <div className="flex-1 px-4 py-5 flex flex-col gap-3">
        <p className="text-xs text-gray-400 font-medium tracking-wide">오늘의 이야기</p>

        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm">
            {editingId === comment.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 text-sm leading-relaxed resize-none outline-none focus:border-amber-400 transition-colors"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                  >
                    저장
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-300">{formatTime(comment.created_at)}</span>
                  {deletingId === comment.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">삭제할까요?</span>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-2 py-1 text-xs rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(comment)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeletingId(comment.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* 새 코멘트 입력 */}
        {isAdding ? (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="이야기를 적어보세요..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 text-sm leading-relaxed resize-none outline-none focus:border-amber-400 transition-colors"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={() => { setIsAdding(false); setNewText(""); }}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddComment}
                className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-amber-200 text-amber-400 hover:border-amber-400 hover:bg-white text-sm transition-colors"
          >
            + 이야기 추가
          </button>
        )}
      </div>
    </div>
  );
}
