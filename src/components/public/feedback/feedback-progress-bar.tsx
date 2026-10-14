import React from "react";

interface FeedbackProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export function FeedbackProgressBar({
  completedCount,
  totalCount,
}: FeedbackProgressBarProps) {
  const percentage = Math.min(
    100,
    Math.round((completedCount / totalCount) * 100)
  );

  return (
    <div className="w-full bg-[#F8F5EE] border-2 border-black p-3 shadow-[3px_3px_0px_#0A0A0A] space-y-2 select-none">
      <div className="flex items-center justify-between font-mono text-xs font-bold text-black">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F43F5E] animate-pulse" />
          <span>PROGRESO DEL CUESTIONARIO</span>
        </span>
        <span className="bg-[#FACC15] text-black px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
          {completedCount} / {totalCount} ({percentage}%)
        </span>
      </div>

      <div className="w-full h-3 bg-white border border-black overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-purple-800 via-[#F43F5E] to-[#FACC15] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
