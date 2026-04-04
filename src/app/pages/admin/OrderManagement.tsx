import { useState, useEffect, useMemo, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { motion } from "motion/react";
import { Search, Eye, Edit, Truck, CheckCircle, XCircle, Clock, Package, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { appendAdminAuditLog, getAdminSession } from "../../utils/admin";

type Order = any;


export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});
  const [exchangeResponseDraft, setExchangeResponseDraft] = useState("");
  const adminSession = useMemo(() => getAdminSession(), []);

  const fetchOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*");

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }

  setOrders(
    (data || []).map((o: any) => ({
      ...o,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      date: o.created_at,
      shippingAddress: o.address,
    }))
  );
};

//user effect to fetch orders on component mount
  useEffect(() => {
  fetchOrders();
}, []);


  useEffect(() => {
    let filtered = orders;

    if (adminSession && adminSession.branch !== "Head Office") {
      filtered = filtered.filter((order) => order.branch === adminSession.branch);
    }

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
  }, [adminSession?.branch, orders, searchTerm, statusFilter, sourceFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      toast.error("Failed to update status");
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      await fetchOrders();
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setRemarksDraft(
      Object.fromEntries(order.items.map((item: { id: any; adminRemark: any; }) => [String(item.id), item.adminRemark ?? ""]))
    );
    setExchangeResponseDraft(order.exchangeRequest?.adminMessage ?? "");
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Unable to open the print window.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .meta { margin-bottom: 20px; }
            .meta p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h1>Order ${order.id}</h1>
          <div class="meta">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Address:</strong> ${order.shippingAddress}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item: { name: any; quantity: any; price: { toLocaleString: () => any; }; adminRemark: any; }) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>NPR ${item.price.toLocaleString()}</td>
                      <td>${item.adminRemark || "-"}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p style="margin-top: 20px;"><strong>Total:</strong> NPR ${order.total.toLocaleString()}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    if (adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "printed",
        entityType: "order",
        entityName: order.id,
        details: "Printed order summary.",
      });
    }
  };

  const handleSaveRemarks = async () => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.items.map((item: any) => ({
      ...item,
      adminRemark: (remarksDraft[String(item.id)] ?? "").trim(),
    }));

    const { error } = await supabase
      .from("orders")
      .update({ items: updatedItems })
      .eq("id", selectedOrder.id);

    if (error) {
      console.error(error);
      toast.error("Failed to save remarks");
      return;
    }

    await fetchOrders();
    toast.success("Order remarks saved");
  };

  const handleExchangeDecision = async (orderId: string, decision: "approved" | "rejected") => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.exchangeRequest) return;

    const updatedExchange = {
      ...order.exchangeRequest,
      status: decision,
      adminMessage: exchangeResponseDraft.trim(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminSession?.name || "Admin",
    };

    const { error } = await supabase
      .from("orders")
      .update({
        status: decision === "approved" ? "exchange_requested" : "delivered",
        exchangeRequest: updatedExchange,
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      toast.error("Failed to update exchange request");
      return;
    }

    await fetchOrders();
    setSelectedOrder(null);
    toast.success("Exchange updated");
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
      case "returned":
        return <XCircle size={16} className="text-orange-500" />;
      case "exchange_requested":
        return <Edit size={16} className="text-cyan-600" />;
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
      case "returned":
        return "text-orange-600 bg-orange-100";
      case "exchange_requested":
        return "text-cyan-700 bg-cyan-100";
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
      {adminSession && adminSession.branch !== "Head Office" ? (
        <p className="text-sm text-gray-600">
          Showing orders assigned to {adminSession.branch}.
        </p>
      ) : null}

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
            <option value="returned">Returned</option>
            <option value="exchange_requested">Exchange Request</option>
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
                        <option value="returned">Returned</option>
                        <option value="exchange_requested">Exchange Request</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tracking-wider">
                    NPR {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Order"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openOrderModal(order)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Edit Remarks"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="text-gray-700 hover:text-black transition-colors"
                        title="Print Order"
                      >
                        <Printer size={16} />
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
                  { selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium tracking-wider">{item.name}</p>
                        <p className="text-sm text-gray-600 tracking-wider">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium tracking-wider">NPR {item.price.toLocaleString()}</p>
                      </div>
                      <div className="mt-3">
                        <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                          Admin Remark For This Product
                        </label>
                        <textarea
                          value={remarksDraft[String(item.id)] ?? ""}
                          onChange={(event) =>
                            setRemarksDraft((current) => ({
                              ...current,
                              [String(item.id)]: event.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm tracking-wider focus:border-black focus:outline-none"
                          placeholder="Add handling notes or remarks for this product in the order"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold tracking-wider uppercase">Total</span>
                  <span className="font-semibold tracking-wider">NPR {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
              {selectedOrder.exchangeRequest ? (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <h4 className="font-medium mb-2 tracking-wider uppercase">Exchange Request</h4>
                    <p className="text-sm tracking-wider text-gray-700">
                      {selectedOrder.exchangeRequest.reason}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">
                      Status: {selectedOrder.exchangeRequest.status.replace("_", " ")}
                    </p>
                    {selectedOrder.exchangeRequest.reviewedBy ? (
                      <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                        Reviewed by {selectedOrder.exchangeRequest.reviewedBy}
                      </p>
                    ) : null}
                    {selectedOrder.exchangeRequest.adminMessage ? (
                      <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Message to Customer
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {selectedOrder.exchangeRequest.adminMessage}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {selectedOrder.exchangeRequest.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {selectedOrder.exchangeRequest.images.map((image: string | undefined, index: number) => (
                        <img
                          key={`${selectedOrder.id}-exchange-${index}`}
                          src={image}
                          alt={`Exchange request ${index + 1}`}
                          className="h-28 w-full rounded object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  {selectedOrder.exchangeRequest.status === "pending" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                          Message to Customer
                        </label>
                        <textarea
                          value={exchangeResponseDraft}
                          onChange={(event) => setExchangeResponseDraft(event.target.value)}
                          rows={4}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm tracking-wider focus:border-black focus:outline-none"
                          placeholder="Add a note explaining the approval or denial of this exchange request"
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleExchangeDecision(selectedOrder.id, "approved")}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors tracking-wider uppercase text-sm"
                      >
                        Approve Exchange
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExchangeDecision(selectedOrder.id, "rejected")}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors tracking-wider uppercase text-sm"
                      >
                        Reject Exchange
                      </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors tracking-wider uppercase text-sm"
                >
                  Print Order
                </button>
                <button
                  onClick={handleSaveRemarks}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
