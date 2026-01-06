"use client";

type QuickActionsProps = {
  hasActiveCourse: boolean;
  onContinueCourse?: () => void;
  onReviewLastLesson?: () => void;
};

export default function QuickActions({
  hasActiveCourse,
  onContinueCourse,
   onReviewLastLesson,
}: QuickActionsProps) {
  return (
    <div
      className="
        p-6 rounded-xl
        bg-white/5 backdrop-blur-2xl
        border border-white/10 shadow-xl
        text-white
      "
    >
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

      <div className="space-y-3">
        <button
          disabled={!hasActiveCourse}
          onClick={onContinueCourse}
          className="
            w-full px-4 py-2 rounded-lg text-sm
            bg-[#00ADB5] text-white font-medium
            disabled:bg-gray-600 disabled:text-gray-300
            hover:bg-[#00c0c9] transition
          "
        >
          Continue Course
        </button>

 <button
          disabled={!hasActiveCourse}
          onClick={onReviewLastLesson}
          className="w-full px-4 py-2 rounded-lg text-sm bg-white/10 text-white font-medium disabled:bg-gray-600 disabled:text-gray-300 hover:bg-white/20 transition"
        >
          Review last lesson’s MCQs
        </button>
        {/* you can add more actions later */}
      </div>
    </div>
  );
}

