"use client";

import { useRouter } from "next/navigation";



type Props = {
  id: number;
};

export function RestoreButton({ id }: Props) {
  const router = useRouter();

  const handleRestore = async () => {
    const ok = window.confirm("Restore this post?");
    if (!ok) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/${id}/restore`,
        { method: "POST" }
      );

      if (!res.ok) {
        console.error("Restore failed");
        alert("Restore failed.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Restore failed.");
    }
  };

  return (
    <button
      onClick={handleRestore}
      className="px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
    >
      Restore
    </button>
  );
}

export function PermanentDeleteButton({ id }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmText = window.prompt(
      "Type DELETE to permanently remove this post:"
    );
    if (confirmText !== "DELETE") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/admin/${id}/hard`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        console.error("Hard delete failed");
        alert("Permanent delete failed.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Permanent delete failed.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 rounded-full text-xs font-medium border border-red-600/60 text-red-300 hover:bg-red-600/20"
    >
      Delete forever
    </button>
  );
}
