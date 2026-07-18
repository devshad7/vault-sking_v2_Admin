"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { db } from "@/config/firebase.config";
import {
  formatCurrency,
  formatOrderDate,
  getCustomerName,
  getOrderNumber,
  toDate,
} from "@/lib/order-utils";
import { AdminOrder } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const nextOrders = snapshot.docs
          .map(
            (orderDocument) =>
              ({
                ...(orderDocument.data() as Omit<AdminOrder, "id">),
                id: orderDocument.id,
              }) as AdminOrder,
          )
          .sort(
            (firstOrder, secondOrder) =>
              (toDate(secondOrder.createdAt)?.getTime() ?? 0) -
              (toDate(firstOrder.createdAt)?.getTime() ?? 0),
          );

        setOrders(nextOrders);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Unable to load orders:", snapshotError);
        setError("Orders could not be loaded. Please check your Firestore permissions and try again.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return orders;

    return orders.filter((order) =>
      [
        getOrderNumber(order),
        getCustomerName(order),
        order.customer?.email,
        order.customer?.phone,
        order.userId,
      ].some((value) => value?.toLowerCase().includes(search)),
    );
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-slate-600">Manage customer orders ({orders.length} total)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="search"
          placeholder="Search by order number, customer name, email, or phone..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "Order #",
                    "Customer",
                    "Date",
                    "Payment",
                    "Amount",
                    "Status",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading || "actions"}
                      className="px-6 py-3 text-left text-sm font-semibold text-slate-900"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      Loading orders…
                    </td>
                  </tr>
                ) : filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(order.id)}`}
                          className="font-semibold text-slate-900 hover:text-orange-600"
                        >
                          {getOrderNumber(order)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-slate-900">{getCustomerName(order)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{order.customer?.email || "No email"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="capitalize text-slate-900">{order.payment?.method || "—"}</p>
                        <p
                          className={`mt-0.5 text-xs ${
                            order.payment?.verified ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {order.payment?.verified ? "Verified" : "Not verified"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(order.totals?.total)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={order.status || "pending"} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(order.id)}`}
                          className="inline-flex rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                          title="View order details"
                          aria-label={`View order ${getOrderNumber(order)}`}
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      {searchTerm ? "No orders match your search." : "No orders have been placed yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
