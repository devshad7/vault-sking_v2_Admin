"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/config/firebase.config";
import { Category } from "@/lib/types";
import { DataTable } from "@/components/admin/DataTable";
import { CategoryModal } from "@/components/admin/CategoryModal";
import { getCategoryProductCount } from "@/lib/helper";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Category, "_id">),
          _id: doc.id,
        }));

        setCategories(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      async (snapshot) => {
        const data = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const category = {
              ...(doc.data() as Category),
              _id: doc.id,
            };

            const productCount = await getCategoryProductCount(doc.id);

            return {
              ...category,
              productCount,
            };
          }),
        );

        setCategories(data);
      },
    );

    return unsubscribe;
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-slate-600">Manage product categories</p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />

        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <DataTable
        data={filteredCategories}
        columns={[
          {
            key: "title",
            label: "Category",
            render: (_, item) => (
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-10 w-10 rounded-lg object-cover"
                />

                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>

                  <p className="text-xs text-slate-500">{item.slug.current}</p>
                </div>
              </div>
            ),
          },
          {
            key: "description",
            label: "Description",
          },
          {
            key: "_id",
            label: "Products",
            render: (_, item) => (
              <span className="font-medium">{item.productCount ?? 0}</span>
            ),
          },
        ]}
        setIsOpen={setIsModalOpen}
        type="category"
        onEdit={(category) => {
          setSelectedCategory(category);
          setIsModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory ?? undefined}
      />
    </div>
  );
}
