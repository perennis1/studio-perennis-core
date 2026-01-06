"use client";

import { Dialog } from "@headlessui/react";
import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";

type Props = {
  open: boolean;
  src: string;              // object URL from file input
  onClose: () => void;
  onCropped: (file: File) => void; // return cropped avatar file
};

export default function CropAvatarModal({ open, src, onClose, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); // 1:1 by default
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // helper: crop via canvas and return File
  const getCroppedFile = useCallback(async (): Promise<File | null> => {
    if (!croppedAreaPixels) return null;

    const image = new Image();
    image.src = src;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  }, [croppedAreaPixels, src]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const file = await getCroppedFile();
      if (!file) return;
      onCropped(file);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-[#1e1b2e] text-white shadow-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <Dialog.Title className="text-lg font-medium">Adjust profile photo</Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-300 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex justify-between items-center gap-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAspect(1)}
                  className={`px-3 py-1.5 rounded-md border text-[11px] ${
                    aspect === 1 ? "bg-white/20 border-white/60" : "bg-white/5 border-white/20"
                  }`}
                >
                  Square 1:1
                </button>
                <button
                  type="button"
                  onClick={() => setAspect(4 / 5)}
                  className={`px-3 py-1.5 rounded-md border text-[11px] ${
                    aspect === 4 / 5 ? "bg-white/20 border-white/60" : "bg-white/5 border-white/20"
                  }`}
                >
                  Portrait 4:5
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Use this photo"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
