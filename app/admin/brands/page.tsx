"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Brand } from "@/lib/types";
import { BrandModal } from "@/components/admin/BrandModal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "brands"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Brand, "_id">),
          _id: doc.id,
        }));

        setBrands(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brands</h1>
          <p className="text-slate-600 mt-1">Manage product brands</p>
        </div>
        <button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <DataTable
        data={filteredBrands}
        columns={[
          {
            key: "title",
            label: "Brand",
            render: (_, item) => (
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-10 h-10 rounded-lg object-cover"
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
        ]}
        setIsOpen={setIsModalOpen}
        type="brand"
        onEdit={(category) => {
          setSelectedBrand(category);
          setIsModalOpen(true);
        }}
      />

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand ?? undefined}
      />
    </div>
  );
}
