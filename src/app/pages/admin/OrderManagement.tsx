import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, Eye, Edit, Truck, CheckCircle, XCircle, Clock, Package } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  source: 'website' | 'instagram' | 'facebook' | 'tiktok';
  shippingAddress: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    date: "2024-01-15",
    status: "delivered",
    total: 33117,
    source: "website",
    shippingAddress: "123 Main St, Kathmandu, Nepal",
    trackingNumber: "TK123456789",
    items: [
      { id: "3", name: "Urban Streetwear Set", quantity: 1, price: 33117 }
    ]
  },
  {
    id: "ORD-002",
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    date: "2024-01-14",
    status: "shipped",
    total: 21147,
    source: "instagram",
    shippingAddress: "456 Oak Ave, Pokhara, Nepal",
    trackingNumber: "TK987654321",
    items: [
      { id: "11", name: "Black Knit Sweater", quantity: 1, price: 21147 }
    ]
  },
  {
    id: "ORD-003",
    customerName: "Emma Davis",
    customerEmail: "emma.davis@email.com",
    date: "2024-01-13",
    status: "processing",
    total: 159000,
    source: "facebook",
    shippingAddress: "789 Pine Rd, Lalitpur, Nepal",
    items: [
      { id: "1", name: "Classic Black Jacket", quantity: 1, price: 39867 },
      { id: "6", name: "Essential White Tee", quantity: 2, price: 7847 }
    ]
  },
  {
    id: "ORD-004",
    customerName: "Alex Rodriguez",
    customerEmail: "alex.rodriguez@email.com",
    date: "2024-01-12",
    status: "pending",
    total: 398000,
    source: "tiktok",
    shippingAddress: "321 Elm St, Bhaktapur, Nepal",
    items: [
      { id: "9", name: "Runway Collection Piece", quantity: 1, price: 398000 }
    ]
  },
  {
    id: "ORD-005",
    customerName: "Lisa Wang",
    customerEmail: "lisa.wang@email.com",
    date: "2024-01-11",
    status: "cancelled",
    total: 46417,
    source: "website",
    shippingAddress: "654 Cedar Ln, Kathmandu, Nepal",
    items: [
      { id: "5", name: "Premium Denim Jacket", quantity: 1, price: 46417 }
    ]
  }
];

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(order => order.source === sourceFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sourceFilter]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "processing":
        return <Package size={16} className="text-blue-500" />;
      case "shipped":
        return <Truck size={16} className="text-purple-500" />;
      case "delivered":
        return <CheckCircle size={16} className="text-green-500" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
    }
  };

  const getSourceIcon = (source: Order['source']) => {
    switch (source) {
      case "website":
        return "🌐";
      case "instagram":
        return "📷";
      case "facebook":
        return "👥";
      case "tiktok":
        return "🎵";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Order Management</h2>
        <div className="text-sm text-gray-600 tracking-wider">
          {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSourceFilter("all");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors tracking-wider uppercase text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 tracking-wider">
                      {order.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 tracking-wider">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500 tracking-wider">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSourceIcon(order.source)}</span>
                      <span className="text-sm text-gray-900 capitalize tracking-wider">
                        {order.source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tracking-wider">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs px-2 py-1 rounded-full tracking-wider uppercase font-medium ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tracking-wider">
                    NPR {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 transition-colors">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-widest uppercase">
                  Order {selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 tracking-wider uppercase">Customer</h4>
                  <p className="text-sm tracking-wider">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600 tracking-wider">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 tracking-wider uppercase">Order Details</h4>
                  <p className="text-sm tracking-wider">Date: {formatDate(selectedOrder.date)}</p>
                  <p className="text-sm tracking-wider">Source: {selectedOrder.source}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium mb-2 tracking-wider uppercase">Shipping Address</h4>
                <p className="text-sm tracking-wider">{selectedOrder.shippingAddress}</p>
                {selectedOrder.trackingNumber && (
                  <p className="text-sm text-gray-600 tracking-wider mt-1">
                    Tracking: {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-4 tracking-wider uppercase">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium tracking-wider">{item.name}</p>
                        <p className="text-sm text-gray-600 tracking-wider">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium tracking-wider">NPR {item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold tracking-wider uppercase">Total</span>
                  <span className="font-semibold tracking-wider">NPR {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}