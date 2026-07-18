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

/**
 * Payment method / status shared between the storefront checkout
 * (Manual QR Payment support) and the admin panel.
 */
export type PaymentMethod = "cod" | "qr";

export type PaymentStatus = "pending" | "verified" | "rejected";

export type OrderItem = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  email: string;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  invoice?: { number: string; hosted_invoice_url?: string };
  amountDiscount?: number;
  products?: Array<{
    product: Product;
    quantity: number;
  }>;
  // Payment (added for Manual QR Payment support)
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  paymentScreenshot?: string;
};

/**
 * Shape stored by the storefront when an order is created. The `id` field is
 * the Firestore document id and is added by the admin app when reading an
 * order from the `orders` collection.
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type FirestoreDate =
  | Date
  | string
  | number
  | { toDate: () => Date }
  | null
  | undefined;

export type OrderCustomer = {
  fullName?: string;
  phone?: string;
  email?: string;
};

export type ShippingAddress = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  city?: string;
  state?: string;
  province?: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
  [key: string]: unknown;
};

export type OrderLineItem = {
  productId?: string;
  name?: string;
  productName?: string;
  title?: string;
  image?: string;
  thumbnail?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
  total?: number;
  totalPrice?: number;
  product?: {
    name?: string;
    title?: string;
    price?: number;
    image?: string;
    thumbnail?: string;
    images?: Array<{ url?: string }>;
  };
  [key: string]: unknown;
};

export type OrderTimelineEntry = {
  status: string;
  note?: string;
  at?: FirestoreDate;
};

export type AdminOrder = {
  id: string;
  orderNumber?: string;
  userId?: string;
  status?: string;
  customer?: OrderCustomer;
  shippingAddress?: ShippingAddress;
  payment?: {
    method?: PaymentMethod;
    verified?: boolean;
    status?: PaymentStatus;
    transactionId?: string;
    paymentScreenshot?: string;
  };
  totals?: {
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
  };
  items?: OrderLineItem[];
  timeline?: OrderTimelineEntry[];
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
};