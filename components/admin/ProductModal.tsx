"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Brand, Category, Product } from "@/lib/types";
import {
  fetchBrands,
  fetchCategories,
  handleProductUpdate,
} from "@/lib/helper";
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

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

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

  // populate form when editing
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(defaultProduct);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      _id: formData._id || `prod-${Date.now()}`,
      _type: "product",
      id: formData.id || `prod-${Date.now()}`,
      slug: {
        current: formData.name?.toLowerCase().replace(/\s+/g, "-") || "",
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
      // update product
      if (product) {
        await handleProductUpdate(product._id, payload);

        toast.success("Product updated successfully");
      }

      // create product
      else {
        await addDoc(collection(db, "products"), payload);

        toast.success("Product created successfully");
      }

      setFormData(defaultProduct);

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
    { id: "inventory", label: "Inventory" },
    { id: "details", label: "Details" },
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

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={formData.thumbnail || ""}
                  onChange={(e) =>
                    handleInputChange("thumbnail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://..."
                />
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
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              {product ? "Update" : "Create"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
