"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Product } from "@/lib/types";
import { ProductModal } from "@/components/admin/ProductModal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Product, "_id">),
          _id: doc.id,
        }));

        setProducts(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage your product catalog ({products.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredProducts}
        columns={[
          {
            key: "name",
            label: "Product",
            render: (_, item) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
              </div>
            ),
          },
          {
            key: "category",
            label: "Category",
          },
          {
            key: "price",
            label: "Price",
            render: (value) => `NPR ${(value ?? 0).toLocaleString()}`,
          },
          {
            key: "stock",
            label: "Stock",
            render: (value) => {
              const num =
                typeof value === "number"
                  ? value
                  : parseInt(String(value ?? "0")) || 0;

              return (
                <span
                  className={`font-medium ${
                    num > 10
                      ? "text-green-600"
                      : num > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {num}
                </span>
              );
            },
          },
          {
            key: "status",
            label: "Status",
            render: (value) => {
              const status =
                typeof value === "string"
                  ? value
                  : value == null
                    ? "active"
                    : String(value);
              return <StatusBadge status={status} />;
            },
          },
        ]}
        setIsOpen={setIsModalOpen}
        type="product"
        onEdit={(product) => {
          setSelectedProduct(product);
          setIsModalOpen(true);
        }}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct || undefined}
      />
    </div>
  );
}
