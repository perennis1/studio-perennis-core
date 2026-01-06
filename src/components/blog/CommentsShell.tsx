"use client";

import dynamic from "next/dynamic";

export const CommentsShell = dynamic(
  () => import("./CommentsSection"),
  { ssr: false }
);
