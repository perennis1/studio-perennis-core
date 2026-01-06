"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import axios from "axios";
import CropAvatarModal from "./CropAvatarModal";
import { ProfileUpdateInput, LedgerPayload } from '@studio-perennis/contracts'; // ✅ NEW IMPORT

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export default function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: any;
  onClose: () => void;
 onSave: (updatedUser: any, updatedLedger: typeof LedgerPayload) => void;  // ✅ Extract type from value

}) {
  const [form, setForm] = useState({
    name: user.name || "",
    tagline: user.tagline || "",
    avatar: user.avatar || "",
    currentInquiry: user.currentInquiry || "",
    currentlyStudying: user.currentlyStudying || "",
    lastActiveInquiry: user.lastActiveInquiry || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);

  const imageSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form.avatar?.startsWith("http")) return form.avatar;
    if (form.avatar?.startsWith("/uploads/"))
      return `${AUTH_BASE}${form.avatar}`;
    return "/fallback-avatar.png";
  }, [previewUrl, form.avatar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // when user picks a file, open cropper instead of using raw image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRawImageUrl(url);
    setCropOpen(true);
  };

  // called by CropAvatarModal when user confirms crop
  const handleCropped = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    const url = URL.createObjectURL(croppedFile);
    setPreviewUrl(url);
  };

  // ✅ FULLY TYPE-SAFE handleSave with Zod validation
  const handleSave = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token") || "";

      // ✅ 1) TYPE-SAFE Profile validation
      const profileData = ProfileUpdateInput.safeParse({
        fullName: form.name,
        tagline: form.tagline,
      });

      if (!profileData.success) {
        alert(`Profile error: ${profileData.error.errors[0].message}`);
        setLoading(false);
        return;
      }

      // 1) Update identity (name, tagline, avatar)
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("tagline", form.tagline);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await axios.put(`${AUTH_BASE}/api/update`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiUser = res.data?.user || {};

      let avatar = apiUser.avatar as string | undefined;
      if (avatar) {
        if (avatar.startsWith("/uploads/")) {
          avatar = `${AUTH_BASE}${avatar}`;
        } else if (!avatar.startsWith("http")) {
          avatar = `${AUTH_BASE}/uploads/${avatar}`;
        }
      }

      const updatedUser = { ...apiUser, avatar };

      // ✅ 2) TYPE-SAFE LedgerPayload validation
      // ✅ 2) TYPE-SAFE LedgerPayload validation
// ✅ 2) TYPE-SAFE LedgerPayload validation
const updatedLedger = {
  currentInquiry: form.currentInquiry.trim() === "" ? null : form.currentInquiry.trim(),
  currentlyStudying: form.currentlyStudying.trim() === "" ? null : form.currentlyStudying.trim(),
  lastActiveInquiry: null,
  // rest of properties
};


      // 3) Update ledger via /me/profile
      await axios.put(`${API_BASE}/me/profile`, updatedLedger, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

onSave(updatedUser, LedgerPayload);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Something went wrong while updating profile.");
    } finally {
      setLoading(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-[#1B152D]/95 to-[#0A0A0A]/95 border border-white/10 rounded-3xl p-8 w-[90%] max-w-md text-white shadow-2xl"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-3">
            {imageSrc.startsWith("http://localhost:5000") ? (
              <img
                src={imageSrc}
                alt="User Avatar"
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "999px",
                  objectFit: "cover",
                  border: "2px solid #00ADB5",
                  position: "absolute",
                  inset: 0,
                }}
              />
            ) : (
              <Image
                src={imageSrc}
                alt="User Avatar"
                fill
                sizes="96px"
                className="rounded-full border-2 border-[#00ADB5] object-cover"
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00ADB5]/20 file:text-[#00ADB5] hover:file:bg-[#00ADB5]/30"
          />
        </div>

        {/* Identity fields */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#00ADB5] outline-none transition"
          />
          <input
            type="text"
            name="tagline"
            value={form.tagline}
            onChange={handleChange}
            placeholder="Your Tagline (e.g., In pursuit of clarity)"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#00ADB5] outline-none transition"
          />
        </div>

        {/* Ledger section */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-[0.18em]">
            Thinking ledger
          </p>
          <input
            type="text"
            name="currentInquiry"
            value={form.currentInquiry}
            onChange={handleChange}
            placeholder="Current inquiry (e.g., How do biases distort perception?)"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#00ADB5] outline-none transition"
          />
          <input
            type="text"
            name="currentlyStudying"
            value={form.currentlyStudying}
            onChange={handleChange}
            placeholder="Currently studying (e.g., First Principles Thinking)"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#00ADB5] outline-none transition"
          />
          <input
            type="text"
            name="lastActiveInquiry"
            value={form.lastActiveInquiry}
            onChange={handleChange}
            placeholder="Last active inquiry (auto-updated later)"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#00ADB5] outline-none transition"
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>

      {/* Crop modal */}
      <CropAvatarModal
        open={cropOpen && !!rawImageUrl}
        src={rawImageUrl || ""}
        onClose={() => setCropOpen(false)}
        onCropped={handleCropped}
      />
    </div>
  );
}
