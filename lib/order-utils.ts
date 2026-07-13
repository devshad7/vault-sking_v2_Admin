import { AdminOrder, FirestoreDate, OrderLineItem, ShippingAddress } from "./types";

export const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type SelectableOrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];

export function toDate(value: FirestoreDate): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "object" && "toDate" in value) {
    return value.toDate();
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatOrderDate(value: FirestoreDate, includeTime = false) {
  const date = toDate(value);

  if (!date) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  return `NPR ${(Number.isFinite(amount) ? amount : 0).toLocaleString()}`;
}

export function getOrderNumber(order: AdminOrder) {
  return order.orderNumber || order.id;
}

export function getCustomerName(order: AdminOrder) {
  return order.customer?.fullName || order.shippingAddress?.fullName || "Unknown customer";
}

export function getItemName(item: OrderLineItem) {
  return (
    item.name ||
    item.productName ||
    item.title ||
    item.product?.name ||
    item.product?.title ||
    item.productId ||
    "Product"
  );
}

export function getItemImage(item: OrderLineItem) {
  return (
    item.image ||
    item.thumbnail ||
    item.product?.image ||
    item.product?.thumbnail ||
    item.product?.images?.[0]?.url
  );
}

export function getItemQuantity(item: OrderLineItem) {
  const quantity = Number(item.quantity ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function getItemUnitPrice(item: OrderLineItem) {
  const price = Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

export function getItemTotal(item: OrderLineItem) {
  const total = Number(item.total ?? item.totalPrice);
  return Number.isFinite(total) ? total : getItemUnitPrice(item) * getItemQuantity(item);
}

export function getAddressEntries(address?: ShippingAddress) {
  if (!address) return [];

  return Object.entries(address).filter(([, value]) =>
    ["string", "number", "boolean"].includes(typeof value),
  );
}

export function formatFieldLabel(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

export function getStatusLabel(status?: string) {
  if (!status) return "Pending";
  return formatFieldLabel(status);
}
