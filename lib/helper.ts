import { db, storage } from "@/config/firebase.config";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Brand, Category, Blog } from "./types";
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

// ---- Blogs ----

export const fetchBlogs = async (): Promise<Blog[]> => {
  const snapshot = await getDocs(collection(db, "blogs"));

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<Blog, "_id">),
    _id: doc.id,
  }));
};

export const handleBlogCreate = async (
  blog: Omit<Blog, "_id">,
): Promise<string> => {
  const docRef = await addDoc(collection(db, "blogs"), blog);
  return docRef.id;
};

export const handleBlogUpdate = async (
  blogId: string,
  updatedData: Partial<Blog>,
): Promise<void> => {
  const blogRef = doc(db, "blogs", blogId);
  await updateDoc(blogRef, updatedData);
};

export const handleBlogDelete = async (blogId: string): Promise<void> => {
  const blogRef = doc(db, "blogs", blogId);

  await deleteDoc(blogRef);
  toast.success("Blog deleted successfully");
};

/**
 * Uploads an image (e.g. from the blog rich text editor) to Firebase
 * Storage under `blog-images/` and returns its public download URL.
 */
export const uploadBlogImage = async (file: File): Promise<string> => {
  const path = `blog-images/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};