"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

import { db } from "@/config/firebase.config";
import { Brand } from "@/lib/types";
import { handleBrandUpdate } from "@/lib/helper";
import { slugify } from "@/lib/slugify";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand;
}

const initialForm = {
  title: "",
  slug: {
    current: "",
  },
  description: "",
  image: "",
};

export function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<Partial<Brand>>(initialForm);

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  // populate form when editing
  useEffect(() => {
    if (brand) {
      setFormData(brand);
      setImagePreview(brand.image ?? "");
    } else {
      setFormData(initialForm);
      setImagePreview("");
    }

    setSelectedImage(null);
    clearObjectUrl();

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [brand, isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "brands");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();

      console.log("File uploaded successfully:", data.url);

      return data.url as string;
    } else {
      throw new Error("Image upload failed");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    clearObjectUrl();

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setSelectedImage(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    clearObjectUrl();
    setSelectedImage(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      let imageUrl = formData.image ?? "";

      if (selectedImage) {
        imageUrl = await handleUpload(selectedImage);
      }

      const payload = {
        title: formData.title ?? "",
        description: formData.description ?? "",
        image: imageUrl,
        slug: {
          current:
            formData.slug?.current ||
            slugify(formData.title || ""),
        },
      };

      // update form
      if (brand) {
        await handleBrandUpdate(brand._id, payload);

        toast.success("Brand updated successfully");
      }

      // create form
      else {
        await addDoc(collection(db, "brands"), payload);

        toast.success("Brand created successfully");
      }

      setFormData(initialForm);
      setSelectedImage(null);
      setImagePreview("");
      clearObjectUrl();

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(brand ? "Failed to update brand" : "Failed to create brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold">
            {brand ? "Edit Brand" : "Add Brand"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Brand Name *
            </label>

            <input
              required
              type="text"
              placeholder="Enter brand name"
              value={formData.title ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 placeholder:text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description *
            </label>

            <textarea
              required
              rows={3}
              placeholder="Enter brand description"
              value={formData.description ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 placeholder:text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Brand Image
            </label>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  alt="Brand preview"
                  className="h-52 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                <span
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex p-2 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-200"
                >
                  <Upload size={16} />
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG, GIF or WebP.
                </p>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                >
                  Replace image
                </button>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              type="submit"
              className="flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : brand ? (
                "Update Brand"
              ) : (
                "Create Brand"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
