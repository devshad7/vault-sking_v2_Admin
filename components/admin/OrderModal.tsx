'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { OrderItem } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  order?: OrderItem
  onStatusChange?: (order: OrderItem, newStatus: OrderItem['status']) => void
}

export function OrderModal({ isOpen, onClose, order, onStatusChange }: OrderModalProps) {
  const [newStatus, setNewStatus] = useState<OrderItem['status']>(order?.status || 'pending')

  if (!isOpen || !order) return null

  const handleStatusUpdate = () => {
    if (onStatusChange) {
      onStatusChange(order, newStatus)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Order Number</p>
              <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Order Date</p>
              <p className="text-lg font-bold text-slate-900">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Name</p>
                <p className="font-medium text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{order.email}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Order Status</h3>
            <div className="flex items-center gap-4">
              <StatusBadge status={order.status} />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderItem['status'])}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {newStatus !== order.status && (
                <button
                  onClick={handleStatusUpdate}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Update
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">NPR {(order.totalPrice + (order.amountDiscount || 0)).toLocaleString()}</span>
              </div>
              {order.amountDiscount && order.amountDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium text-green-600">-NPR {order.amountDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg">NPR {order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Invoice */}
          {order.invoice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Invoice #{order.invoice.number}
              </p>
              {order.invoice.hosted_invoice_url && (
                <a
                  href={order.invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                >
                  View Invoice →
                </a>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
