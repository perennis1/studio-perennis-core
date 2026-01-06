"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import EditProfileModal from "./components/EditProfileModal";
import AddReflectionModal from "./components/AddReflectionModal";
import { useUser } from "@/context/UserContext";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

type ProfileLedger = {
  currentInquiry: string | null;
  currentlyStudying: string | null;
  lastActiveInquiry: string | null;
  updatedAt: string | null;
};

type ReflectionItem = {
  id: number;
  text: string;
  date: string; // ISO
};

type TrashReflectionItem = {
  id: number;
  text: string;
  date: string;
  deletedAt: string | null;
};

type CourseProgress = {
  courseId: number;
  title: string;
  slug: string;
  durationMin: number | null;
  progress: number; // 0–1
};

type ProgressStats = {
  totalCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  xp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalMinutesLearned: number;
  level: number;
};

type DashboardLesson = {
  id: number;
  lesson: {
    id: number;
    title: string;
    slug: string;
    courseId: number;
  };
  completedAt?: string; // depending on your model; optional for safety
};

type DashboardData = {
  recentLessons: DashboardLesson[];
  streakDays: number;
  weeklyMinutes: number;
  lessonsCompletedThisWeek: number;
};



const TABS = [
  { key: "learning", label: "Learning" },
  { key: "work", label: "Work" },
  { key: "reflections", label: "Reflections" },
  { key: "notes", label: "Notes" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PAGE_SIZE = 10;

export default function ProfilePage() {
  const { updateUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>("reflections");

  // profile basics
  const [user, setUser] = useState({
    name: "Lalle Singh",
    email: "lalle@perennis.com",
    avatar: "/fallback-avatar.png",
    tagline: "In pursuit of clarity",
    memberSince: "June 2025",
  });

  // ledger
  const [ledger, setLedger] = useState<ProfileLedger | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  // reflections (active)
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [reflectionsError, setReflectionsError] = useState<string | null>(null);
  const [loadingReflections, setLoadingReflections] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreReflections, setHasMoreReflections] = useState(false);

  // trash
  const [showTrash, setShowTrash] = useState(false);
  const [trashReflections, setTrashReflections] = useState<TrashReflectionItem[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [trashError, setTrashError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddReflection, setShowAddReflection] = useState(false);


const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
const [perCourse, setPerCourse] = useState<CourseProgress[]>([]);
const [learningLoading, setLearningLoading] = useState(false);
const [learningError, setLearningError] = useState<string | null>(null);

const [dashboard, setDashboard] = useState<DashboardData | null>(null);







const [editingLedger, setEditingLedger] = useState(false);
const [draftCurrentInquiry, setDraftCurrentInquiry] = useState("");
const [draftCurrentlyStudying, setDraftCurrentlyStudying] = useState("");
const [savingLedger, setSavingLedger] = useState(false);
const [ledgerSaveError, setLedgerSaveError] = useState<string | null>(null);


const activeCourses = perCourse.filter(
  (c) => c.progress > 0 && c.progress < 1
);



useEffect(() => {
  if (!ledger) return;
  setDraftCurrentInquiry(ledger.currentInquiry ?? "");
  setDraftCurrentlyStudying(ledger.currentlyStudying ?? "");
}, [ledger]);


  // seed user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // load ledger
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("GET /me/profile status", res.status);
        if (!res.ok) throw new Error("Failed to load profile ledger");
        const data = await res.json();
        setLedger({
          currentInquiry: data.currentInquiry ?? null,
          currentlyStudying: data.currentlyStudying ?? null,
          lastActiveInquiry: data.lastActiveInquiry ?? null,
          updatedAt: data.updatedAt ?? null,
        });
      } catch {
        setLedgerError("Could not load inquiry fields.");
      }
    };

    loadProfile();
  }, []);

  // tab from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;
    const isValid = TABS.some((t) => t.key === tabParam);
    if (isValid) setActiveTab(tabParam as TabKey);
  }, [searchParams]);

  // load reflections (paginated)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchPage = async (skip: number) => {
      const res = await fetch(
        `${API_BASE}/me/reflections?skip=${skip}&take=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("GET /me/reflections status", res.status);
      if (!res.ok) throw new Error("Failed to load reflections");
      const data: {
        items: ReflectionItem[];
        total: number;
        hasMore: boolean;
      } = await res.json();
      return data;
    };

    const loadInitial = async () => {
      try {
        setLoadingReflections(true);
        setReflectionsError(null);
        const data = await fetchPage(0);
        setReflections(data.items);
        setHasMoreReflections(data.hasMore);
      } catch {
        setReflectionsError("Could not load reflections.");
      } finally {
        setLoadingReflections(false);
      }
    };

    loadInitial();
  }, []);

  // load trash when toggled on
  useEffect(() => {
    if (!showTrash) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadTrash = async () => {
      try {
        setLoadingTrash(true);
        setTrashError(null);
        const res = await fetch(`${API_BASE}/me/reflections/trash`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("GET /me/reflections/trash status", res.status);
        if (!res.ok) throw new Error("Failed to load trash");
        const data: TrashReflectionItem[] = await res.json();
        setTrashReflections(data);
      } catch {
        setTrashError("Could not load trash.");
      } finally {
        setLoadingTrash(false);
      }
    };

    loadTrash();
  }, [showTrash]);


// load learning data
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const load = async () => {
    try {
      setLearningLoading(true);
      setLearningError(null);

      const [progressRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE}/me/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE}/me/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!progressRes.ok) throw new Error("Failed to load progress");
      if (!dashboardRes.ok) throw new Error("Failed to load dashboard");

      const progressJson = await progressRes.json();
      const dashboardJson = await dashboardRes.json();

      setProgressStats(progressJson.stats);
      setPerCourse(progressJson.perCourse || []);
      setDashboard({
        recentLessons: dashboardJson.recentLessons || [],
        streakDays: dashboardJson.streakDays ?? 0,
        weeklyMinutes: dashboardJson.weeklyMinutes ?? 0,
        lessonsCompletedThisWeek:
          dashboardJson.lessonsCompletedThisWeek ?? 0,
      });
    } catch (err) {
      setLearningError("Could not load learning data.");
    } finally {
      setLearningLoading(false);
    }
  };

  load();
}, []);






  const avatarSrc = useMemo(() => {
    if (user?.avatar?.startsWith("http")) return user.avatar;
    if (user?.avatar?.startsWith("/uploads/")) return `${API_BASE}${user.avatar}`;
    return "/fallback-avatar.png";
  }, [user?.avatar]);

  const reflectionsByDay = useMemo(() => {
    const groups: Record<string, ReflectionItem[]> = {};
    for (const r of reflections) {
      const key = new Date(r.date).toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [reflections]);

  const handleSaveProfile = (updatedUser: any) => {
    let avatar = updatedUser.avatar;
    if (
      avatar &&
      !avatar.startsWith("http") &&
      !avatar.startsWith("/uploads/")
    ) {
      avatar = `/uploads/${avatar}`;
    }
    const normalizedUser = { ...updatedUser, avatar };
    setUser(normalizedUser);
    setShowEditModal(false);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    updateUser(normalizedUser);
  };

  const handleAddReflection = async (text: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/me/reflections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add reflection");
      const created: ReflectionItem = await res.json();
      setReflections((prev) => [created, ...prev]);
      setShowAddReflection(false);
    } catch {
      alert("Could not save reflection. Please try again.");
    }
  };


const handleSaveLedger = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    setSavingLedger(true);
    setLedgerSaveError(null);
    const res = await fetch(`${API_BASE}/me/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentInquiry: draftCurrentInquiry,
        currentlyStudying: draftCurrentlyStudying,
      }),
    });
    if (!res.ok) throw new Error("Failed to save profile ledger");
    const data = await res.json();
    setLedger({
      currentInquiry: data.currentInquiry ?? null,
      currentlyStudying: data.currentlyStudying ?? null,
      lastActiveInquiry: data.lastActiveInquiry ?? null,
      updatedAt: data.updatedAt ?? null,
    });
    setEditingLedger(false);
  } catch {
    setLedgerSaveError("Could not save these fields. Please try again.");
  } finally {
    setSavingLedger(false);
  }
};




  const handleLoadMoreReflections = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoadingMore(true);
      const res = await fetch(
        `${API_BASE}/me/reflections?skip=${reflections.length}&take=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to load reflections");
      const data: {
        items: ReflectionItem[];
        total: number;
        hasMore: boolean;
      } = await res.json();
      setReflections((prev) => [...prev, ...data.items]);
      setHasMoreReflections(data.hasMore);
    } catch {
      // optional toast
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteReflection = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/me/reflections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setReflections((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // optional toast
    }
  };

  const handleRestoreReflection = async (id: number) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/me/reflections/${id}/restore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to restore");

    const restored: ReflectionItem = await res.json();

    // 1) Remove from trash
    setTrashReflections((prev) => prev.filter((r) => r.id !== id));

    // 2) Insert back into active reflections (at the top, since order is newest first)
    setReflections((prev) => [restored, ...prev]);
  } catch {
    // optional toast
  }
};


  const handleHardDeleteReflection = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/me/reflections/${id}/hard`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashReflections((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // optional toast
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B152D] to-[#0A0A0A] text-white p-4 md:p-8 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg"
      >
        <div className="relative w-32 h-32 shrink-0">
          {avatarSrc.startsWith("http://localhost:5000") ? (
            <img
              src={avatarSrc}
              alt="User Avatar"
              style={{
                width: "128px",
                height: "128px",
                borderRadius: "999px",
                objectFit: "cover",
                border: "2px solid #00ADB5",
                position: "absolute",
                inset: 0,
              }}
            />
          ) : (
            <Image
              src={avatarSrc || "/fallback-avatar.png"}
              alt="User Avatar"
              fill
              sizes="128px"
              className="rounded-full border-2 border-[#00ADB5] object-cover"
            />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          {user.tagline && (
            <p className="text-[#00ADB5] italic text-sm">{user.tagline}</p>
          )}

          <p className="text-sm text-gray-500">
            Member since <span className="text-gray-300">{user.memberSince}</span>
          </p>

         <div className="mt-2 space-y-2 text-sm">
  <div className="flex items-center justify-between gap-2">
    <span className="text-gray-500">Current inquiry of focus</span>
    <button
      className="text-[10px] text-gray-400 hover:text-gray-200"
      onClick={() => setEditingLedger((v) => !v)}
    >
      {editingLedger ? "Cancel" : "Edit"}
    </button>
  </div>
  {editingLedger ? (
    <textarea
      className="mt-1 w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-xs text-gray-100 resize-none"
      rows={3}
      value={draftCurrentInquiry}
      onChange={(e) => setDraftCurrentInquiry(e.target.value)}
      placeholder="What is the question or inquiry you are actively exploring?"
    />
  ) : (
    <p className="text-gray-200 mt-1">
      {ledger?.currentInquiry ?? "Not set yet"}
    </p>
  )}

  <div className="mt-2">
    <span className="text-gray-500">Currently studying</span>
    {editingLedger ? (
      <textarea
        className="mt-1 w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-xs text-gray-100 resize-none"
        rows={2}
        value={draftCurrentlyStudying}
        onChange={(e) => setDraftCurrentlyStudying(e.target.value)}
        placeholder="What course, topic, or material are you currently working through?"
      />
    ) : (
      <p className="text-gray-200 mt-1">
        {ledger?.currentlyStudying ?? "Not set yet"}
      </p>
    )}
  </div>

  <div className="mt-2">
    <span className="text-gray-500">Last active line of thought</span>
    <p className="text-gray-200 mt-1">
      {ledger?.lastActiveInquiry ?? "Not set yet"}
    </p>
  </div>

  {editingLedger && (
    <div className="mt-2 flex items-center gap-3">
      <button
        onClick={handleSaveLedger}
        disabled={savingLedger}
        className="text-[11px] bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
      >
        {savingLedger ? "Saving…" : "Save"}
      </button>
      {ledgerSaveError && (
        <p className="text-[11px] text-red-400">{ledgerSaveError}</p>
      )}
    </div>
  )}

  {ledgerError && !editingLedger && (
    <p className="text-xs text-red-400 mt-1">{ledgerError}</p>
  )}
</div>

          <div className="flex justify-center md:justify-start gap-3 mt-4">
            <button
              className="bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-white px-5 py-2 rounded-xl text-sm transition"
              onClick={() => setShowEditModal(true)}
            >
              Edit profile
            </button>
            <button
              className="bg-white/5 border border-white/15 text-gray-300 px-4 py-2 rounded-xl text-sm"
              onClick={() => {
                if (typeof window === "undefined") return;
                const url = window.location.href;
                navigator.clipboard?.writeText(url).catch(() => {});
              }}
            >
              Share profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs + content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 md:p-8 shadow-lg"
      >
        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex justify-center gap-4 text-[10px] uppercase tracking-[0.12em] text-gray-500">
            {TABS.map(({ key, label }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveTab(key);
                    const params = new URLSearchParams(window.location.search);
                    params.set("tab", key);
                    const query = params.toString();
                    router.push(
                      `/dashboard/profile${query ? `?${query}` : ""}`
                    );
                  }}
                  className={`
                    pb-3 border-b-2 transition whitespace-nowrap
                    ${
                      isActive
                        ? "border-[#00ADB5] text-white"
                        : "border-transparent text-gray-500"
                    }
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reflections / Trash */}
        {activeTab === "reflections" && (
          <>
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base md:text-lg font-semibold">
                {showTrash ? "Trash" : "Your reflections"}
              </h2>
              <div className="flex gap-2">
                {!showTrash && (
                  <button
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition self-start"
                    onClick={() => setShowAddReflection(true)}
                  >
                    Add reflection
                  </button>
                )}
                <button
                  className={`text-xs px-3 py-1.5 rounded-xl transition self-start ${
                    showTrash
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-white/5 text-gray-300 border border-white/15"
                  }`}
                  onClick={() => setShowTrash((prev) => !prev)}
                >
                  {showTrash ? "Back to reflections" : "View trash"}
                </button>
              </div>
            </div>

            {showTrash ? (
              <div className="mt-6">
                {loadingTrash ? (
                  <p className="text-sm text-gray-400">Loading trash…</p>
                ) : trashError ? (
                  <p className="text-sm text-red-400">{trashError}</p>
                ) : trashReflections.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Nothing in trash. Deleted reflections will show here for a
                    while before they are removed forever.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {trashReflections.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl bg-white/5 border border-red-500/30 p-4 flex flex-col justify-between"
                      >
                        <p className="text-sm text-gray-100 mb-3 line-clamp-4">
                          {r.text}
                        </p>
                        <div className="flex justify-between items-end gap-3">
                          <div className="text-[11px] text-gray-500">
                            <div>
                              Created{" "}
                              {new Date(r.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            {r.deletedAt && (
                              <div>
                                Deleted{" "}
                                {new Date(
                                  r.deletedAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-[10px] text-emerald-400 hover:text-emerald-300"
                              onClick={() => handleRestoreReflection(r.id)}
                            >
                              Restore
                            </button>
                            <button
                              className="text-[10px] text-red-400 hover:text-red-300"
                              onClick={() => handleHardDeleteReflection(r.id)}
                            >
                              Delete forever
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : loadingReflections ? (
              <p className="text-sm text-gray-400 mt-6">
                Loading reflections…
              </p>
            ) : reflectionsError ? (
              <p className="text-sm text-red-400 mt-6">{reflectionsError}</p>
            ) : reflections.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <p className="text-sm text-gray-200">
        You have not added any reflections yet.
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Capture a short thought or observation you do not want to lose. It does
        not need to be polished.
      </p>
    </div>
    <button
      className="text-xs bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-xl transition self-start"
      onClick={() => setShowAddReflection(true)}
    >
      Add your first reflection
    </button>
  </div>
            ) : (
              <>
                <div className="mt-6 space-y-6">
                  {reflectionsByDay.map(([day, items]) => (
                    <div key={day} className="space-y-3">
                      <h3 className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                        {new Date(day).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col justify-between"
                          >
                            <p className="text-sm text-gray-100 mb-3">
                              {r.text}
                            </p>
                            <div className="flex justify-between items-end">
                              <span className="text-[11px] text-gray-500">
                                {new Date(
                                  r.date
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                              <button
                                className="text-[10px] text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteReflection(r.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {!loadingReflections &&
                  !reflectionsError &&
                  hasMoreReflections && (
                    <div className="mt-4 flex justify-center">
                      <button
                        className="text-xs bg白/10 hover:bg-white/20 px-4 py-1.5 rounded-xl transition"
                        onClick={handleLoadMoreReflections}
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Loading..." : "Load older reflections"}
                      </button>
                    </div>
                  )}
              </>
            )}
          </>
        )}

        {activeTab === "learning" && (
  <div className="mt-6 space-y-6">
    {learningLoading && (
      <p className="text-sm text-gray-400">Loading your learning data…</p>
    )}
    {learningError && (
      <p className="text-sm text-red-400">{learningError}</p>
    )}

    {!learningLoading && !learningError && (
      <>


 {/* Learning summary */}
        {progressStats && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-wrap gap-4 text-xs md:text-sm">
            <div>
              <p className="text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                XP
              </p>
              <p className="text-white text-sm md:text-base font-medium">
                {progressStats.xp}
              </p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                Level
              </p>
              <p className="text-white text-sm md:text-base font-medium">
                {progressStats.level} / {progressStats.totalCourses}
              </p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                Completed lessons
              </p>
              <p className="text-white text-sm md:text-base font-medium">
                {progressStats.totalLessonsCompleted}
              </p>
            </div>
            {dashboard && (
              <div>
                <p className="text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                  Streak
                </p>
                <p className="text-white text-sm md:text-base font-medium">
                  {dashboard.streakDays} day
                  {dashboard.streakDays === 1 ? "" : "s"}
                </p>
              </div>
            )}
          </section>
        )}




        {/* Currently studying */}
        <section>
  <h2 className="text-base md:text-lg font-semibold mb-3">
    Currently studying
  </h2>

  {activeCourses.length === 0 ? (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm text-gray-200">
          You are not actively studying any course yet.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          When you start a course, it will show up here so you can see what you
          are in the middle of.
        </p>
      </div>
      <button
        className="text-xs bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-xl transition self-start"
        onClick={() => {
          // adjust route when you have a catalog
          router.push("/dashboard/courses");
        }}
      >
        Browse courses
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activeCourses.map((course) => (
        <div
          key={course.courseId}
          className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-white">
                {course.title}
              </h3>
              <p className="text-[11px] text-gray-400">
                Approx.{" "}
                {course.durationMin ? `${course.durationMin} min` : "self‑paced"}
              </p>
            </div>
            <span className="text-[11px] text-gray-400">
              {Math.round(course.progress * 100)}% complete
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#00ADB5]"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, course.progress * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* Recently completed lessons */}
        <section>
          <h2 className="text-base md:text-lg font-semibold mb-3">
            Recently completed lessons
          </h2>

          {!dashboard || dashboard.recentLessons.length === 0 ? (
            <p className="text-sm text-gray-400">
              Your recent lesson completions will show up here as you study.
            </p>
          ) : (
            <div className="space-y-3">
              {dashboard.recentLessons.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <p className="text-sm text-white">
                        {item.lesson.title}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Lesson • Course #{item.lesson.courseId}
                      </p>
                    </div>
                    {item.completedAt && (
                      <span className="text-[11px] text-gray-500">
                        {new Date(item.completedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    )}
  </div>
)}

        {activeTab === "work" && (
  <div className="mt-6 space-y-6">
    {/* Pinned projects */}
    <section>
      <h2 className="text-base md:text-lg font-semibold mb-3">
        Pinned projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Static example cards for now */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-white">
            Studio Perennis – Learning platform
          </h3>
          <p className="text-xs text-gray-300">
            Ongoing build of the core learning environment and profile‑based
            ledger for reflections, learning, and applied work.
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Stack: Next.js · Node.js · PostgreSQL
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-white">
            Critical thinking exercises (beta)
          </h3>
          <p className="text-xs text-gray-300">
            Prototype set of structured prompts designed to train careful
            reasoning using short, daily exercises.
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Status: Concept / early design
          </p>
        </div>
      </div>
    </section>

    {/* Applied experiments */}
    <section>
      <h2 className="text-base md:text-lg font-semibold mb-3">
        Applied experiments
      </h2>
      <p className="text-sm text-gray-400">
        Over time, this space will collect snapshots of how you apply ideas
        from courses and inquiries into real work: features you ship, tests
        you run, and changes you make to your practice.
      </p>
    </section>
  </div>
)}


       {activeTab === "notes" && (
  <div className="mt-6 space-y-6">
    {/* Notes intro */}
    <section>
      <h2 className="text-base md:text-lg font-semibold mb-2">
        Working notes
      </h2>
      <p className="text-sm text-gray-400">
        This space is for loose notes that sit between formal lessons and
        finished work—fragments, questions, and rough connections you do not
        want to lose.
      </p>
    </section>

    {/* Future notes list */}
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">
        Recent notes
      </h3>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <p className="text-sm text-gray-400">
          Soon, you will be able to capture short notes tied to your current
          inquiry and see them collected here.
        </p>
      </div>
    </section>

    {/* How notes will behave */}
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">
        How this will evolve
      </h3>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2 text-sm text-gray-300">
        <p>
          Notes will likely be short, text‑only entries connected to an inquiry
          or course, so you can sketch ideas without turning them into full
          reflections.
        </p>
        <p>
          Over time, they may link to lessons, projects, or reflections so you
          can see how a rough thought became concrete work.
        </p>
      </div>
    </section>
  </div>
)}

      </motion.div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {showAddReflection && (
        <AddReflectionModal
          onClose={() => setShowAddReflection(false)}
          onAdd={handleAddReflection}
        />
      )}
    </div>
  );
}
