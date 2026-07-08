"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

import { db } from "@/config/firebase.config";
import { Brand } from "@/lib/types";
import { handleBrandUpdate } from "@/lib/helper";

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

  const [formData, setFormData] = useState<Partial<Brand>>(initialForm);

  // populate form when editing
  useEffect(() => {
    if (brand) {
      setFormData(brand);
    } else {
      setFormData(initialForm);
    }
  }, [brand, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      title: formData.title ?? "",
      description: formData.description ?? "",
      image: formData.image ?? "",
      slug: {
        current:
          formData.slug?.current ||
          formData.title?.trim().toLowerCase().replace(/\s+/g, "-") ||
          "",
      },
    };

    try {
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
              value={formData.title ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description *
            </label>

            <textarea
              required
              rows={3}
              value={formData.description ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Image URL</label>

            <input
              type="text"
              value={formData.image ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  image: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
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
