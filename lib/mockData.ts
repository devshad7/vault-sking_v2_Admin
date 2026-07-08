import {
  Product,
  Category,
  Brand,
  Blog,
  Announcement,
  OrderItem,
} from "./types";

export const products: Product[] = [
  {
    _id: "prod-001",
    _type: "product",
    id: "prod-001",
    slug: { current: "vitamin-c-brightening-serum" },
    name: "Vitamin C Brightening Serum",
    description:
      "A daily antioxidant serum that visibly brightens and evens skin tone.",
    richDescription:
      "This multitasking serum combines vitamin C, niacinamide, and ferulic acid to brighten dullness, support collagen, and protect against environmental stressors.",
    price: 3200,
    discount: 400,
    stock: 18,
    sku: "SK-VC-001",
    category: "Serums",
    brand: "The Ordinary",
    images: [
      {
        _key: "img-1",
        url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        alt: "Vitamin C serum",
      },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      {
        title: "Vitamin C",
        description: "Brightens the look of dull skin and supports collagen.",
      },
    ],
    benefits: ["Brightening", "Antioxidant protection"],
    howToUse: ["Apply 2-3 drops to cleansed skin in the morning."],
    warnings: ["Avoid contact with eyes."],
    storageInstructions: ["Store in a cool, dry place."],
    faqs: [
      {
        question: "Is it suitable for sensitive skin?",
        answer: "Yes, it is designed to be gentle.",
      },
    ],
    specifications: [{ label: "Skin Type", value: "Normal, Dry, Oily" }],
    certifications: ["Cruelty-free"],
    reviews: [
      {
        id: 1,
        author: "Nira",
        rating: 5,
        date: "2026-06-01",
        title: "Glowing skin",
        content: "Love how radiant my skin looks.",
      },
    ],
    ratings: 4.8,
    gallery: [
      {
        _key: "gal-1",
        url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      },
    ],
    badges: ["Best Seller"],
    tags: ["brightening", "serum"],
    categories: ["serums"],
    status: "new",
    isFeatured: true,
  },
  {
    _id: "prod-002",
    _type: "product",
    id: "prod-002",
    slug: { current: "hydrating-gel-cream" },
    name: "Hydrating Gel Cream",
    description: "A lightweight gel cream that locks in moisture.",
    richDescription:
      "This moisturizer combines glycerin and ceramides to support the skin barrier.",
    price: 2800,
    discount: 300,
    stock: 24,
    sku: "SK-HC-002",
    category: "Moisturizers",
    brand: "CeraVe",
    images: [
      {
        _key: "img-3",
        url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        alt: "Gel cream",
      },
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { title: "Ceramides", description: "Reinforces the skin barrier." },
    ],
    benefits: ["Deep hydration", "Barrier support"],
    howToUse: ["Massage over damp skin after cleansing."],
    warnings: ["For external use only."],
    storageInstructions: ["Keep sealed and away from heat."],
    faqs: [
      {
        question: "Can I use it day and night?",
        answer: "Yes, it works well morning and evening.",
      },
    ],
    specifications: [{ label: "Texture", value: "Gel cream" }],
    certifications: ["Dermatologist tested"],
    reviews: [
      {
        id: 2,
        author: "Mina",
        rating: 4,
        date: "2026-05-20",
        title: "Comforting",
        content: "Perfect for humid weather.",
      },
    ],
    ratings: 4.6,
    gallery: [
      {
        _key: "gal-2",
        url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      },
    ],
    badges: ["Hydrating"],
    tags: ["moisturizer", "hydration"],
    categories: ["moisturizers"],
    status: "hot",
    isFeatured: true,
  },
];

export const blogs: Blog[] = [
  {
    _id: "blog-1",
    title: "How to build a simple skincare routine",
    slug: { current: "how-to-build-a-simple-skincare-routine" },
    mainImage:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    blogcategories: [{ title: "Routine" }],
    publishedAt: "2026-06-10",
    author: { name: "Asha" },
    body: "A simple routine should focus on cleansing, hydration, and sun protection.",
  },
  {
    _id: "blog-2",
    title: "Skincare ingredients explained",
    slug: { current: "skincare-ingredients-explained" },
    mainImage:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    blogcategories: [{ title: "Education" }],
    publishedAt: "2026-06-05",
    author: { name: "Priya" },
    body: "Understanding key ingredients helps you choose the right products.",
  },
];

export const orders: OrderItem[] = [
  {
    orderNumber: "ORD-1001",
    orderDate: "2026-06-12",
    customerName: "Asha B.",
    email: "asha@example.com",
    totalPrice: 5800,
    status: "paid",
    invoice: { number: "INV-1001" },
  },
  {
    orderNumber: "ORD-1002",
    orderDate: "2026-06-11",
    customerName: "Priya K.",
    email: "priya@example.com",
    totalPrice: 3200,
    status: "shipped",
    invoice: { number: "INV-1002" },
  },
  {
    orderNumber: "ORD-1003",
    orderDate: "2026-06-10",
    customerName: "Nira S.",
    email: "nira@example.com",
    totalPrice: 2800,
    status: "pending",
    invoice: { number: "INV-1003" },
  },
];

export const announcement: Announcement = {
  text: "Free shipping on orders over NPR 5,000",
  emoji: "✨",
};
