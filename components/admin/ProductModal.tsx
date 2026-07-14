"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Brand, Category, Product } from "@/lib/types";
import {
  fetchBrands,
  fetchCategories,
  handleProductUpdate,
} from "@/lib/helper";
import { slugify } from "@/lib/slugify";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import toast from "react-hot-toast";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

const defaultProduct: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  discount: 0,
  stock: 0,
  sku: "",
  category: "",
  brand: "",
  thumbnail: "",
  images: [],
  ingredients: [{ title: "", description: "" }],
  benefits: [],
  howToUse: [],
  warnings: [],
  storageInstructions: [],
  faqs: [{ question: "", answer: "" }],
  specifications: [],
  certifications: [],
  reviews: [],
  ratings: 0,
  gallery: [],
  badges: [],
  tags: [],
  status: "new" as const,
  isFeatured: false,
};

type ImageItem = {
  url: string;
  file?: File;
};

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryItems, setGalleryItems] = useState<ImageItem[]>([]);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailObjectUrlRef = useRef<string | null>(null);
  const galleryObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await fetchBrands();
        setBrands(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadBrands();
  }, []);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(
    product || defaultProduct,
  );
  const [activeTab, setActiveTab] = useState("basic");
  const [slugValue, setSlugValue] = useState(
    product?.slug?.current || "",
  );
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const clearThumbnailObjectUrl = () => {
    if (thumbnailObjectUrlRef.current) {
      URL.revokeObjectURL(thumbnailObjectUrlRef.current);
      thumbnailObjectUrlRef.current = null;
    }
  };

  const clearGalleryObjectUrls = () => {
    galleryObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    galleryObjectUrlsRef.current = [];
  };

  const clearImageInputs = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  // populate form when editing
  useEffect(() => {
    if (product) {
      setFormData(product);
      setThumbnailPreview(product.thumbnail || "");
      setGalleryItems(
        (product.images || []).map((image) => ({ url: image.url })),
      );
      setSlugValue(product.slug?.current || "");
    } else {
      setFormData(defaultProduct);
      setThumbnailPreview("");
      setGalleryItems([]);
      setSlugValue("");
    }

    setIsSlugManuallyEdited(false);
    setThumbnailFile(null);
    clearThumbnailObjectUrl();
    clearGalleryObjectUrls();
    clearImageInputs();
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      clearThumbnailObjectUrl();
      clearGalleryObjectUrls();
    };
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title unless the user has manually edited it
    if (field === "name" && !isSlugManuallyEdited) {
      setSlugValue(slugify(value as string));
    }
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    // Allow only valid slug characters while typing
    setSlugValue(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleObjectArrayChange = (
    field: string,
    index: number,
    key: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const addArrayItem = (field: string, defaultValue: any = "") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), defaultValue],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();

    return data.url as string;
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    clearThumbnailObjectUrl();

    const objectUrl = URL.createObjectURL(file);
    thumbnailObjectUrlRef.current = objectUrl;

    setThumbnailFile(file);
    setThumbnailPreview(objectUrl);
  };

  const handleRemoveThumbnail = () => {
    clearThumbnailObjectUrl();
    setThumbnailFile(null);
    setThumbnailPreview("");
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const nextItems = files.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      galleryObjectUrlsRef.current.push(objectUrl);

      return {
        url: objectUrl,
        file,
      };
    });

    setGalleryItems((prev) => [...prev, ...nextItems]);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGalleryItems((prev) => {
      const item = prev[index];

      if (item?.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
        galleryObjectUrlsRef.current = galleryObjectUrlsRef.current.filter(
          (url) => url !== item.url,
        );
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalSlug = slugValue.trim() || slugify(formData.name || "");

    const payload = {
      _id: formData._id || `prod-${Date.now()}`,
      _type: "product",
      id: formData.id || `prod-${Date.now()}`,
      slug: {
        current: finalSlug,
      },
      name: formData.name || "",
      description: formData.description || "",
      price: formData.price || 0,
      discount: formData.discount || 0,
      stock: formData.stock || 0,
      sku: formData.sku || "",
      category: formData.category || "",
      brand: formData.brand || "",
      thumbnail: formData.thumbnail || "",
      images: formData.images || [],
      ingredients: formData.ingredients || [],
      benefits: formData.benefits || [],
      howToUse: formData.howToUse || [],
      warnings: formData.warnings || [],
      storageInstructions: formData.storageInstructions || [],
      faqs: formData.faqs || [],
      specifications: formData.specifications || [],
      certifications: formData.certifications || [],
      reviews: formData.reviews || [],
      ratings: formData.ratings || 0,
      gallery: formData.gallery || [],
      badges: formData.badges || [],
      tags: formData.tags || [],
      status: formData.status || "new",
      isFeatured: formData.isFeatured || false,
    };
    try {
      const thumbnailUrl = thumbnailFile
        ? await handleUpload(thumbnailFile)
        : formData.thumbnail || "";

      const images = await Promise.all(
        galleryItems.map(async (item) => ({
          url: item.file ? await handleUpload(item.file) : item.url,
        })),
      );

      const finalPayload = {
        ...payload,
        thumbnail: thumbnailUrl,
        images,
      };

      // update product
      if (product) {
        await handleProductUpdate(product._id, finalPayload);

        toast.success("Product updated successfully");
      }

      // create product
      else {
        await addDoc(collection(db, "products"), finalPayload);

        toast.success("Product created successfully");
      }

      setFormData(defaultProduct);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setGalleryItems([]);
      clearThumbnailObjectUrl();
      clearGalleryObjectUrls();
      clearImageInputs();

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        product ? "Failed to update product" : "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic" },
    { id: "images", label: "Images" },
    { id: "inventory", label: "Inventory" },
    { id: "details", label: "Details" },
    { id: "ingredients", label: "Ingredients" },
    { id: "faqs", label: "FAQs" },
    { id: "specs", label: "Specs" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Basic Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ""}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slugValue}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  placeholder="auto-generated-from-title"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {isSlugManuallyEdited
                    ? "Manually edited — clear the field to resume auto-generation."
                    : "Auto-generated from the product name. Edit to customize."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.category || ""}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                  >
                    <option value="">Select a category</option>

                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Brand *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.brand || ""}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                  >
                    <option value="">Select a brand</option>

                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Thumbnail Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Thumbnail Image *
                </h3>
                {thumbnailPreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-52 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                      aria-label="Remove thumbnail"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                    <span
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="inline-flex p-2 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-200"
                    >
                      <Upload size={16} />
                    </span>

                    <p className="mt-2 text-sm text-slate-500">
                      PNG, JPG, GIF or WebP.
                    </p>
                  </div>
                )}

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />

                {thumbnailPreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                    >
                      Replace thumbnail
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Product Images Gallery Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Product Images Gallery
                </h3>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                  <span
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex p-2 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-200"
                  >
                    <Upload size={16} />
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    Select one or more images to add to the gallery.
                  </p>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                </div>

                {galleryItems.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {galleryItems.map((img, index) => (
                      <div
                        key={`${img.url}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={img.url}
                          alt={`Product image ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(index)}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500 italic">
                    No gallery images added yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Price (NPR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) =>
                      handleInputChange("price", parseFloat(e.target.value))
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount || 0}
                    onChange={(e) =>
                      handleInputChange("discount", parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) =>
                      handleInputChange("stock", parseFloat(e.target.value))
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "new"}
                    onChange={(e) =>
                      handleInputChange(
                        "status",
                        e.target.value as "new" | "hot" | "sale",
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="new">New</option>
                    <option value="hot">Hot</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured || false}
                      onChange={(e) =>
                        handleInputChange("isFeatured", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-900">
                      Featured Product
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Badges
                </label>
                <div className="space-y-2">
                  {(formData.badges || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("badges", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Premium, Bestseller"
                      />
                      {(formData.badges || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("badges", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("badges", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Badge
                </button>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Benefits
                </label>
                <div className="space-y-2">
                  {(formData.benefits || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("benefits", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter benefit"
                      />
                      {(formData.benefits || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("benefits", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("benefits", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Benefit
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  How to Use
                </label>
                <div className="space-y-2">
                  {(formData.howToUse || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("howToUse", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter usage step"
                      />
                      {(formData.howToUse || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("howToUse", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("howToUse", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Warnings
                </label>
                <div className="space-y-2">
                  {(formData.warnings || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("warnings", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter warning"
                      />
                      {(formData.warnings || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("warnings", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("warnings", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Warning
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Storage Instructions
                </label>
                <div className="space-y-2">
                  {(formData.storageInstructions || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange(
                            "storageInstructions",
                            index,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter storage instruction"
                      />
                      {(formData.storageInstructions || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("storageInstructions", index)
                          }
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("storageInstructions", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Instruction
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Certifications
                </label>
                <div className="space-y-2">
                  {(formData.certifications || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange(
                            "certifications",
                            index,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., ISO 9001"
                      />
                      {(formData.certifications || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("certifications", index)
                          }
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("certifications", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Certification
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {(formData.tags || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("tags", index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter tag"
                      />
                      {(formData.tags || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("tags", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("tags", "")}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Ingredients
                </label>
                <div className="space-y-3">
                  {(formData.ingredients || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleObjectArrayChange(
                              "ingredients",
                              index,
                              "title",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Ingredient name"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            handleObjectArrayChange(
                              "ingredients",
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Ingredient description"
                        />
                      </div>
                      {(formData.ingredients || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("ingredients", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg h-fit"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("ingredients", { title: "", description: "" })
                  }
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Ingredient
                </button>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  FAQs
                </label>
                <div className="space-y-3">
                  {(formData.faqs || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            handleObjectArrayChange(
                              "faqs",
                              index,
                              "question",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Question"
                        />
                        <textarea
                          value={item.answer}
                          onChange={(e) =>
                            handleObjectArrayChange(
                              "faqs",
                              index,
                              "answer",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Answer"
                        />
                      </div>
                      {(formData.faqs || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("faqs", index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg h-fit"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("faqs", { question: "", answer: "" })
                  }
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add FAQ
                </button>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specs" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Specifications
                </label>
                <div className="space-y-2">
                  {(formData.specifications || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          handleObjectArrayChange(
                            "specifications",
                            index,
                            "label",
                            e.target.value,
                          )
                        }
                        className="w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) =>
                          handleObjectArrayChange(
                            "specifications",
                            index,
                            "value",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Value"
                      />
                      {(formData.specifications || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("specifications", index)
                          }
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("specifications", { label: "", value: "" })
                  }
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus size={16} />
                  Add Specification
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : product ? (
                "Update"
              ) : (
                "Create"
              )}{" "}
              Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
