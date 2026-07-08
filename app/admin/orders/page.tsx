'use client'

import { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { OrderItem } from '@/lib/types'
import { orders as mockOrders } from '@/lib/mockData'
import { OrderModal } from '@/components/admin/OrderModal'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleView = (order: OrderItem) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleStatusChange = (order: OrderItem, newStatus: OrderItem['status']) => {
    setOrders(
      orders.map((o) => (o.orderNumber === order.orderNumber ? { ...o, status: newStatus } : o))
    )
    alert(`Order status updated to ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-1">Manage customer orders ({orders.length} total)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by order number, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <DataTable
        data={filteredOrders}
        columns={[
          {
            key: 'orderNumber',
            label: 'Order #',
            render: (value) => <span className="font-medium text-slate-900">{value}</span>,
          },
          {
            key: 'customerName',
            label: 'Customer',
            render: (_, item) => (
              <div>
                <p className="font-medium text-slate-900">{item.customerName}</p>
                <p className="text-xs text-slate-500">{item.email}</p>
              </div>
            ),
          },
          {
            key: 'orderDate',
            label: 'Date',
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            key: 'totalPrice',
            label: 'Amount',
            render: (value) => (
              <span className="font-medium">NPR {value.toLocaleString()}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => <StatusBadge status={value} />,
          },
        ]}
        onEdit={handleView}
      />

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder || undefined}
        onStatusChange={(order, newStatus) => {
          handleStatusChange(order, newStatus)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
