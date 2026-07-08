import { db } from "@/config/firebase.config";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { Brand, Category } from "./types";
import toast from "react-hot-toast";

export const handleCategoryDelete = async (categoryId: string) => {
  const categoryRef = doc(db, "categories", categoryId);

  await deleteDoc(categoryRef);
  toast.success("Category deleted successfully");
};

export const handleCategoryUpdate = async (
  categoryId: string,
  updatedData: Partial<Category>,
) => {
  const categoryRef = doc(db, "categories", categoryId);

  await updateDoc(categoryRef, updatedData);
};

export const handleBrandUpdate = async (
  brandId: string,
  updatedData: Partial<Brand>,
) => {
  const brandRef = doc(db, "brands", brandId);

  await updateDoc(brandRef, updatedData);
};

export const handleProductUpdate = async (
  productId: string,
  updatedData: Record<string, any>,
) => {
  const productRef = doc(db, "products", productId);

  await updateDoc(productRef, updatedData);
};

export const handleBrandDelete = async (brandId: string) => {
  const brandRef = doc(db, "brands", brandId);

  await deleteDoc(brandRef);
  toast.success("Brand deleted successfully");
};

export const handleProductDelete = async (productId: string) => {
  const productRef = doc(db, "products", productId);

  await deleteDoc(productRef);
  toast.success("Product deleted successfully");
};

export const fetchCategories = async (): Promise<Category[]> => {
  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<Category, "_id">),
    _id: doc.id,
  }));
};

export const fetchBrands = async (): Promise<Brand[]> => {
  const snapshot = await getDocs(collection(db, "brands"));

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<Brand, "_id">),
    _id: doc.id,
  }));
};

export const getCategoryProductCount = async (
  categoryId: string,
): Promise<number> => {
  const q = query(
    collection(db, "products"),
    where("category", "==", categoryId),
  );

  const snapshot = await getCountFromServer(q);

  return snapshot.data().count;
};
