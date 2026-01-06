//C:\Users\studi\my-next-app\src\app\dashboard\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { useUser } from "@/context/UserContext";
import { User } from '@studio-perennis/contracts';

// Type for profile modal props
interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  initial?: {
    fullName?: string;
    residence?: string;
    gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | "";
    nationality?: string;
    avatarUrl?: string | null;
  };
}

// Reuse your ProfileModal and logic, using useUser!
function ProfileModal({ open, onClose, initial }: ProfileModalProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [residence, setResidence] = useState(initial?.residence ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [nationality, setNationality] = useState(initial?.nationality ?? "");
  const [preview, setPreview] = useState<string | null>(initial?.avatarUrl ?? null);
  const [file, setFile] = useState<File | null>(null);

  const { updateUser } = useUser();

  useEffect(() => {
    if (!open) return;
    setFullName(initial?.fullName ?? "");
    setResidence(initial?.residence ?? "");
    setGender((initial?.gender as typeof gender) ?? "");
    setNationality(initial?.nationality ?? "");
    setPreview(initial?.avatarUrl ?? null);
    setFile(null);
  }, [open, initial]);

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("fullName", fullName);
    fd.set("residence", residence);
    fd.set("gender", gender);
    fd.set("nationality", nationality);
    if (file) fd.set("avatar", file);

    // Simulate API response here (in actual code, fetch("/api/profile", ...) etc)
    // Assume API returns the updated user object
    // Replace with your real API code
    const updatedUser = {
      name: fullName,
      avatar: preview, // in real scenario, get path/url from your backend response
    };
    updateUser(updatedUser);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-[#1e1b2e] text-white shadow-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <Dialog.Title className="text-lg font-medium">Edit Profile</Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSave} className="px-6 py-5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-white/10 bg-black/30">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-gray-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-md bg-teal-600 px-3 py-2 text-sm hover:bg-teal-500">
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
                  />
                </label>
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFile(null);
                    }}
                    className="rounded-md px-3 py-2 text-sm bg-white/10 hover:bg-white/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Place of residence</label>
              <input
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                placeholder="City, Country"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Nationality</label>
                <input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                  placeholder="e.g., Indian"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm bg-white/5 hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="rounded-md px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500">
                Save changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Main Page Component
export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);

  // Default redirect: when landing on /dashboard root, go to /dashboard/overview
  useEffect(() => {
    if (!pathname) return;
    const normalized = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    if (normalized === "/dashboard") {
      router.replace("/dashboard/overview");
    }
  }, [pathname, router]);

  // Handler for profile modal
  const openProfile = () => setProfileOpen(true);

  // Expose an event for your sidebar to call (if needed)
  useEffect(() => {
    function onOpenProfile() {
      openProfile();
    }
    window.addEventListener("sp:open-profile", onOpenProfile);
    return () => window.removeEventListener("sp:open-profile", onOpenProfile);
  }, []);

  return (
    <>
      {/* Keep the page empty because it immediately redirects to /dashboard/overview */}
      {/* Show profile modal with user fields when editing */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initial={{
          fullName: user?.name || "",
          residence: "",
          gender: "",
          nationality: "",
          avatarUrl: user?.avatar || null,
        }}
      />
    </>
  );
}