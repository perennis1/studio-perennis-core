// src/app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type SiteSettings = {
  siteName: string;
  tagline: string;
  supportEmail: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load settings from backend
  useEffect(() => {
    if (!API_BASE) return;
    const run = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`${API_BASE}/admin/settings`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings({
          siteName: data.siteName,
          tagline: data.tagline,
          supportEmail: data.supportEmail,
        });
      } catch (err) {
        console.error("Load settings error:", err);
        setMessage("Could not load settings.");
        // fallback defaults
        setSettings({
          siteName: "Studio Perennis",
          tagline: "Developing Intelligence, Realigning Awareness",
          supportEmail: "support@studioperennis.com",
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!API_BASE || !settings) {
      setMessage("API base URL not configured.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";

      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data = await res.json();
      setSettings({
        siteName: data.siteName,
        tagline: data.tagline,
        supportEmail: data.supportEmail,
      });
      setMessage("Settings saved.");
    } catch (err) {
      console.error("Save settings error:", err);
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const current = settings ?? {
    siteName: "",
    tagline: "",
    supportEmail: "",
  };

  return (
    <div className="space-y-6 pt-60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-sm text-slate-400">
            Configure Studio Perennis branding and admin options.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-sky-500/60 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
          {message}
        </div>
      )}

      {/* Site identity */}
      <section className="rounded-2xl border border-slate-800 bg-[#050712] px-4 py-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100">Site identity</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Site name</label>
            <input
              name="siteName"
              value={current.siteName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Tagline</label>
            <textarea
              name="tagline"
              value={current.tagline}
              onChange={handleChange}
              rows={2}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Contact / support */}
      <section className="rounded-2xl border border-slate-800 bg-[#050712] px-4 py-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Contact & support
        </h3>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Support email</label>
          <input
            name="supportEmail"
            value={current.supportEmail}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Feature flags placeholder */}
      <section className="rounded-2xl border border-slate-800 bg-[#050712] px-4 py-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Features</h3>
        <p className="text-[11px] text-slate-500">
          Future: toggle Labs features like Courses, Books, Messaging, and
          Revenue analytics.
        </p>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
