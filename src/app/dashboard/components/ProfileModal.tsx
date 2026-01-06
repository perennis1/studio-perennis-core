// src/app/dashboard/_components/ProfileModal.tsx
"use client";


import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react"; // yarn add @headlessui/react
// Tailwind v3/v4 utility classes

type ProfileForm = {
  fullName: string;
  residence: string;
  gender: "Male" | "Female" | "Non-binary" | "Prefer not to say" | "";
  nationality: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ProfileForm> & { avatarUrl?: string };
  onSubmit: (data: FormData) => Promise<void> | void; // send to your API route
};

export default function ProfileModal({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<ProfileForm>({
    fullName: initial?.fullName ?? "",
    residence: initial?.residence ?? "",
    gender: (initial?.gender as ProfileForm["gender"]) ?? "",
    nationality: initial?.nationality ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial?.avatarUrl ?? null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Reset to latest initial values when opened
    setForm({
      fullName: initial?.fullName ?? "",
      residence: initial?.residence ?? "",
      gender: (initial?.gender as ProfileForm["gender"]) ?? "",
      nationality: initial?.nationality ?? "",
    });
    setAvatarPreview(initial?.avatarUrl ?? null);
  }, [open, initial]);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("fullName", form.fullName);
    fd.set("residence", form.residence);
    fd.set("gender", form.gender);
    fd.set("nationality", form.nationality);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("avatar", file);
    await onSubmit(fd); // POST to /api/profile or similar
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

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-white/10 bg-black/30">
                {avatarPreview ? (
                  <Image
                    
                    src={avatarPreview}
                    alt="Profile picture preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-gray-400">No photo</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-md bg-teal-600 px-3 py-2 text-sm hover:bg-teal-500">
                  Change photo
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      if (fileRef.current) fileRef.current.value = "";
                      setAvatarPreview(null);
                    }}
                    className="rounded-md px-3 py-2 text-sm bg-white/10 hover:bg-white/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                placeholder="Your name"
                required
              />
            </div>

            {/* Residence */}
            <div>
              <label className="block text-sm mb-1">Place of residence</label>
              <input
                value={form.residence}
                onChange={(e) => setForm({ ...form, residence: e.target.value })}
                className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                placeholder="City, Country"
              />
            </div>

            {/* Gender and Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as ProfileForm["gender"] })}
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
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-teal-500"
                  placeholder="e.g., Indian"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500"
              >
                Save changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
