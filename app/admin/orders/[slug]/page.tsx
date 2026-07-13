"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Package,
  Save,
} from "lucide-react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { db } from "@/config/firebase.config";
import {
  formatCurrency,
  formatFieldLabel,
  formatOrderDate,
  getAddressEntries,
  getCustomerName,
  getItemImage,
  getItemName,
  getItemQuantity,
  getItemTotal,
  getItemUnitPrice,
  getOrderNumber,
  getStatusLabel,
  ORDER_STATUS_OPTIONS,
  toDate,
} from "@/lib/order-utils";
import { AdminOrder } from "@/lib/types";

export default function OrderDetailsPage() {
  const params = useParams<{ slug: string }>();
  const orderId = typeof params.slug === "string" ? params.slug : "";
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (orderSnapshot) => {
        if (!orderSnapshot.exists()) {
          setOrder(null);
          setNotFound(true);
          setLoading(false);
          return;
        }

        const nextOrder = {
          ...(orderSnapshot.data() as Omit<AdminOrder, "id">),
          id: orderSnapshot.id,
        } as AdminOrder;

        setOrder(nextOrder);
        setSelectedStatus(nextOrder.status || "pending");
        setNotFound(false);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Unable to load order:", snapshotError);
        setError("This order could not be loaded. Please check your Firestore permissions and try again.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [orderId]);

  const timeline = useMemo(
    () =>
      [...(order?.timeline || [])].sort(
        (firstEntry, secondEntry) =>
          (toDate(firstEntry.at)?.getTime() ?? 0) - (toDate(secondEntry.at)?.getTime() ?? 0),
      ),
    [order?.timeline],
  );

  const updateStatus = async () => {
    if (!order || selectedStatus === (order.status || "pending")) return;

    setIsUpdatingStatus(true);

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: selectedStatus,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion({
          status: selectedStatus,
          note: statusNote.trim() || `Order status changed to ${getStatusLabel(selectedStatus)}.`,
          at: Timestamp.now(),
        }),
      });

      setStatusNote("");
      toast.success("Order status updated");
    } catch (updateError) {
      console.error("Unable to update order status:", updateError);
      toast.error("Unable to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const togglePaymentVerification = async () => {
    if (!order) return;

    setIsUpdatingPayment(true);

    try {
      await updateDoc(doc(db, "orders", order.id), {
        "payment.verified": !order.payment?.verified,
        updatedAt: serverTimestamp(),
      });

      toast.success(
        order.payment?.verified ? "Payment marked as unverified" : "Payment verified",
      );
    } catch (updateError) {
      console.error("Unable to update payment verification:", updateError);
      toast.error("Unable to update payment verification");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-500">
        <LoaderCircle className="mr-2 animate-spin" size={20} /> Loading order…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Order not found</h1>
          <p className="mt-2 text-sm text-slate-600">This order may have been deleted or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  const currentStatus = order.status || "pending";
  const addressEntries = getAddressEntries(order.shippingAddress);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600">
            <ArrowLeft size={16} /> Back to orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Order {getOrderNumber(order)}</h1>
            <StatusBadge status={currentStatus} />
          </div>
          <p className="mt-1 text-slate-600">Placed {formatOrderDate(order.createdAt, true)}</p>
        </div>
        <div className="rounded-lg bg-slate-900 px-5 py-3 text-right text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Order total</p>
          <p className="text-xl font-bold">{formatCurrency(order.totals?.total)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <Package size={20} className="text-orange-500" />
              <h2 className="font-semibold text-slate-900">Items ({order.items?.length || 0})</h2>
            </div>
            {order.items?.length ? (
              <div className="divide-y divide-slate-200">
                {order.items.map((item, index) => {
                  const itemImage = getItemImage(item);
                  const quantity = getItemQuantity(item);

                  return (
                    <div key={`${item.productId || getItemName(item)}-${index}`} className="flex gap-4 p-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {itemImage ? (
                          <img src={itemImage} alt={getItemName(item)} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={22} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{getItemName(item)}</p>
                        {item.productId && <p className="mt-1 text-xs text-slate-500">Product ID: {item.productId}</p>}
                        <p className="mt-1 text-sm text-slate-600">
                          {formatCurrency(getItemUnitPrice(item))} × {quantity}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-semibold text-slate-900">{formatCurrency(getItemTotal(item))}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-500">No item details were saved with this order.</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-orange-500" />
              <h2 className="font-semibold text-slate-900">Shipping address</h2>
            </div>
            {addressEntries.length ? (
              <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {addressEntries.map(([field, value]) => (
                  <div key={field}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {formatFieldLabel(field)}
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No shipping address was saved with this order.</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Order timeline</h2>
            {timeline.length ? (
              <ol className="mt-5 space-y-5 border-l-2 border-slate-200 pl-5">
                {timeline.map((entry, index) => (
                  <li key={`${entry.status}-${index}`} className="relative">
                    <span className="absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-slate-500">{formatOrderDate(entry.at, true)}</span>
                    </div>
                    {entry.note && <p className="mt-2 text-sm text-slate-700">{entry.note}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No timeline events have been recorded.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Order status</h2>
            <div className="mt-4 space-y-3">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={isUpdatingStatus}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {!ORDER_STATUS_OPTIONS.includes(currentStatus as (typeof ORDER_STATUS_OPTIONS)[number]) && (
                  <option value={currentStatus}>{getStatusLabel(currentStatus)}</option>
                )}
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder="Optional note for the customer/order history"
                rows={3}
                disabled={isUpdatingStatus}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                onClick={updateStatus}
                disabled={selectedStatus === currentStatus || isUpdatingStatus}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingStatus ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
                Update status
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Payment</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Method</span>
                <span className="font-medium capitalize text-slate-900">{order.payment?.method || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Verification</span>
                <span className={order.payment?.verified ? "font-medium text-green-600" : "font-medium text-amber-600"}>
                  {order.payment?.verified ? "Verified" : "Not verified"}
                </span>
              </div>
              <button
                onClick={togglePaymentVerification}
                disabled={isUpdatingPayment}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingPayment ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                {order.payment?.verified ? "Mark as unverified" : "Mark as verified"}
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Customer</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="mt-1 font-medium text-slate-900">{getCustomerName(order)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-all font-medium text-slate-900">{order.customer?.email || order.shippingAddress?.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="mt-1 font-medium text-slate-900">{order.customer?.phone || order.shippingAddress?.phone || "—"}</dd>
              </div>
              {order.userId && (
                <div>
                  <dt className="text-slate-500">User ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-900">{order.userId}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.totals?.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Discount</dt>
                <dd className={Number(order.totals?.discount ?? 0) > 0 ? "text-green-600" : ""}>
                  {Number(order.totals?.discount ?? 0) > 0 ? "−" : ""}
                  {formatCurrency(order.totals?.discount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Shipping</dt>
                <dd>{formatCurrency(order.totals?.shipping)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totals?.total)}</dd>
              </div>
            </dl>
          </section>

          <p className="text-xs text-slate-500">
            Last updated {formatOrderDate(order.updatedAt, true)}
          </p>
        </aside>
      </div>
    </div>
  );
}
