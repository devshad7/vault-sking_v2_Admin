"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  handleBrandDelete,
  handleCategoryDelete,
  handleProductDelete,
} from "@/lib/helper";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T extends { _id: string }> {
  data: T[];
  columns: Column<T>[];
  type: "category" | "brand" | "product";

  setIsOpen: (isOpen: boolean) => void;
  onEdit: (item: T) => void;

  pageSize?: number;
}

export function DataTable<T extends { _id: string }>({
  data,
  columns,
  setIsOpen,
  onEdit,
  type,
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);

  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-6 py-3 text-left text-sm font-semibold text-slate-900"
                  >
                    {col.label}
                  </th>
                ))}

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr
                    key={item._id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-6 py-4 text-sm text-slate-700"
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : String(item[col.key] ?? "")}
                      </td>
                    ))}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* edit */}
                        <button
                          onClick={() => {
                            onEdit(item);
                            setIsOpen(true);
                          }}
                          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* delete */}
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <button
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            }
                          ></AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {type === "category"
                                  ? "Delete Category?"
                                  : "Delete Brand?"}
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() =>
                                  type === "category"
                                    ? handleCategoryDelete(item._id)
                                    : type === "brand"
                                      ? handleBrandDelete(item._id)
                                      : type === "product"
                                        ? handleProductDelete(item._id)
                                        : null
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-8 text-center text-slate-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {page * pageSize + 1} to{" "}
            {Math.min((page + 1) * pageSize, data.length)} of {data.length}{" "}
            results
          </div>

          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-lg px-3 py-2 ${
                  page === i
                    ? "bg-orange-500 text-white"
                    : "border border-slate-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
