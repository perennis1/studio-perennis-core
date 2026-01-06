"use client";

import { motion } from "framer-motion";
import { MessageCircle, PlayCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type RecentItem = {
  id: number;
  completedAt: string | null;
  lesson: {
    id: number;
    title: string;
    slug: string;
    courseId: number;
  };
};

type ActivityItem = {
  id: number;
  type: string; // "lesson_completed" | "ai_generated" | "comment_posted" | ...
  createdAt: string;
  lesson?: {
    id: number;
    title: string;
    slug: string;
    courseId: number;
  } | null;
};

type Props = {
  items: RecentItem[];
  courseSlug?: string | null;
  activities?: ActivityItem[];
};

export default function RecentActivity({ items, courseSlug, activities = [] }: Props) {
  const router = useRouter();

  const goToLesson = (lessonSlug: string) => {
    if (!courseSlug) return;
    router.push(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  };

  const goToActivityLesson = (activity: ActivityItem) => {
    if (!courseSlug || !activity.lesson) return;
    router.push(`/courses/${courseSlug}/lessons/${activity.lesson.slug}`);
  };

  const labelForType = (type: string) => {
    if (type === "lesson_completed") return "Completed a lesson";
    if (type === "ai_generated") return "Generated AI summary & MCQs";
    if (type === "comment_posted") return "Posted a lesson comment";
    return "Activity";
  };

  const iconForType = (type: string) => {
    if (type === "lesson_completed") return <PlayCircle className="w-4 h-4" />;
    if (type === "ai_generated") return <Sparkles className="w-4 h-4" />;
    if (type === "comment_posted") return <MessageCircle className="w-4 h-4" />;
    return <PlayCircle className="w-4 h-4" />;
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        p-6 rounded-xl
        bg-white/5 backdrop-blur-2xl
        border border-white/10
        shadow-xl text-white
        h-full flex flex-col
      "
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity yet.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2">
          {items.map((act) => (
            <motion.div
              key={act.id}
              whileHover={{ scale: 1.02 }}
              className="
                bg-white/5 border border-white/10
                p-3 rounded-lg
                flex justify-between items-center
                hover:bg-[#00ADB5]/10 transition
              "
            >
              <div>
                <div className="text-sm font-medium">
                  Completed – {act.lesson.title}
                </div>
                <div className="text-xs text-gray-400">
                  {act.completedAt ? formatTime(act.completedAt) : ""}
                </div>
              </div>

              <button
                onClick={() => goToLesson(act.lesson.slug)}
                className="
                  text-[#00ADB5] font-medium text-xs flex items-center
                  gap-1 hover:text-[#00ADB5]/80 transition
                "
              >
                <PlayCircle className="w-4 h-4" />
                View lesson
              </button>
            </motion.div>
          ))}

          {activities.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between text-xs text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    {iconForType(act.type)}
                    <div>
                      <div className="font-medium">
                        {labelForType(act.type)}
                        {act.lesson ? ` – ${act.lesson.title}` : ""}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {formatTime(act.createdAt)}
                      </div>
                    </div>
                  </div>

                  {act.lesson && (
                    <button
                      onClick={() => goToActivityLesson(act)}
                      className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition"
                    >
                      View
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
