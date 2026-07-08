export type ProductImage = {
  _key?: string;
  url: string;
  alt?: string;
};

export type ProductSlug = {
  current: string;
};

export type Product = {
  _id: string;
  _type: "product";
  id: string;
  slug: ProductSlug;
  name: string;
  description: string;
  richDescription?: string;
  price: number;
  discount: number;
  stock: number;
  sku: string;
  category: string;
  brand: string;
  images: ProductImage[];
  thumbnail: string;
  ingredients: Array<{ title: string; description: string }>;
  benefits: string[];
  howToUse: string[];
  warnings: string[];
  storageInstructions: string[];
  faqs: Array<{ question: string; answer: string }>;
  specifications: Array<{ label: string; value: string }>;
  certifications: string[];
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    date: string;
    title: string;
    content: string;
  }>;
  ratings: number;
  gallery: ProductImage[];
  badges: string[];
  tags: string[];
  categories?: string[];
  variant?: string;
  status?: "new" | "hot" | "sale";
  isFeatured?: boolean;
};

export type Category = {
  _id: string;
  title: string;
  slug: ProductSlug;
  description: string;
  image: string;
  productCount?: number;
};

export type Brand = {
  _id: string;
  title: string;
  slug: ProductSlug;
  description: string;
  image: string;
};

export type Blog = {
  _id: string;
  title: string;
  slug: ProductSlug;
  mainImage: string;
  blogcategories: Array<{ title: string }>;
  publishedAt: string;
  author: { name: string };
  body: string;
};

export type Announcement = {
  text: string;
  emoji?: string;
};

export type OrderItem = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  email: string;
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  invoice?: { number: string; hosted_invoice_url?: string };
  amountDiscount?: number;
  products?: Array<{
    product: Product;
    quantity: number;
  }>;
};
