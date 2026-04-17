import { useState, useEffect, useMemo, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { motion } from "motion/react";
import { Search, Eye, Edit, Truck, CheckCircle, XCircle, Clock, Package, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { appendAdminAuditLog, getAdminSession } from "../../utils/admin";

const formatOrderCode = (id: string | number) => {
  const clean = String(id).replace("ORDER-", "");
  const short = clean.slice(-4);
  return `CLO-${short.padStart(4, "0")}`;
};

// Payment log helper
const logPayment = async (orderId: string, status: string) => {
  await supabase.from("payment_logs").insert({
    order_id: orderId,
    status,
    created_at: new Date().toISOString(),
  });
};

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
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    const mappedOrders = (data || []).map((o: any) => ({
      ...o,
      id: o.order_code || o.id, // fallback to id if needed
      customerName:
        o.customer_name ||
        o.customerName ||
        o.name ||
        o.full_name ||
        o.formData?.fullName ||
        o.formData?.name ||
        o.shipping_details?.name ||
        "Customer",
      customerEmail:
        o.customer_email ||
        o.customerEmail ||
        o.email ||
        o.user_email ||
        o.formData?.email ||
        o.formData?.customerEmail ||
        o.shipping_details?.email ||
        o.shipping_details?.customerEmail ||
        o.billing_details?.email ||
        (typeof o.formData === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(o.formData);
                return parsed?.email || parsed?.customerEmail || null;
              } catch {
                return null;
              }
            })()
          : null) ||
        "No Email",
      date: o.created_at,
      shippingAddress:
        o.address ||
        o.shipping_address ||
        o.formData?.address ||
        o.shipping_details?.address ||
        "",
      items: Array.isArray(o.items)
        ? o.items.map((item: any) => ({
            ...item,
            image:
              item.image ||
              (Array.isArray(item.images) ? item.images[0] : item.images) ||
              null,
          }))
        : [],
      total: Number(o.total || 0),

      subtotal: (
        o.subtotal !== undefined && o.subtotal !== null
          ? Number(o.subtotal)
          : Number(o.total || 0) + Number(o.discount_amount || 0) - Number(o.shipping_cost || 0)
      ),

      discount_amount: Number(
        o.discount_amount ||
        o.discount ||
        o.promo_discount ||
        0
      ),

      promo_code:
        o.promo_code ||
        o.coupon_code ||
        o.discount_code ||
        (typeof o.formData === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(o.formData);
                return parsed?.promo_code || parsed?.coupon || null;
              } catch {
                return null;
              }
            })()
          : o.formData?.promo_code || null),

     shipping_cost: Number(o.shipping_cost ?? 0),

      source: o.source || "website", // ensure it doesn't get filtered out
      paymentMethod: o.payment_method || "cod",
      paymentStatus:
        o.payment_status === "failed"
          ? "failed"
          : o.payment_status || "pending",
      orderCode: o.order_code,
    }));

    // 🔥 Prevent double shipping addition (common eSewa bug) and clean up order numbers
    const cleanedOrders = mappedOrders.map((o: any) => {
      let shipping = Number(o.shipping_cost ?? 0);
      const discount = Number(o.discount_amount || 0);
      const total = Number(o.total || 0);

      const correctedSubtotal =
        o.subtotal !== undefined && o.subtotal !== null
          ? Number(o.subtotal)
          : total + discount - shipping;

      return {
        ...o,
        subtotal: correctedSubtotal,
        shipping_cost: shipping,
        discount_amount: discount,
        total: total,
      };
    });

    setOrders(cleanedOrders.filter((o: any) => {
      if (!o.is_custom) return true;
      return (
        o.approved_price ||
        o.custom_designs?.approved_price ||
        o.total ||
        o.items?.length
      );
    }));
  };

// Enhanced useEffect: fetch orders and listen for payment/order updates
  useEffect(() => {
    fetchOrders();

    const handleOrdersUpdate = () => {
      fetchOrders();
    };

    window.addEventListener("ordersUpdated", handleOrdersUpdate);

    return () => {
      window.removeEventListener("ordersUpdated", handleOrdersUpdate);
    };
  }, []);

    // Supabase real-time subscription
    useEffect(() => {
      const channel = supabase
        .channel("orders-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const order = payload.new;
            if (!order) return;
            // Safe mapping to prevent undefined values in notification payload
            const safeOrder = {
              id: order?.order_code ?? order?.id ?? "Unknown",
              customer:
                order?.customer_name ||
                order?.name ||
                order?.customerEmail ||
                "Customer",
              amount: Number(order?.total ?? 0),
            };
            window.dispatchEvent(
              new CustomEvent("newOrder", {
                detail: safeOrder,
              })
            );
            fetchOrders();
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          () => {
            // Only refresh data, DO NOT trigger new order notification
            fetchOrders();
          }
        )
        .subscribe((status) => {
          console.log("Realtime status:", status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }, []);

    // Focus order listener: scroll & highlight specific order row
    useEffect(() => {
      const handler = (e: any) => {
        const orderId = e.detail;
        if (!orderId) return;
        // Try to find the row element
        const el = document.getElementById(`order-${orderId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight animation
          el.classList.add("ring-2", "ring-white");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-white");
          }, 2000);
        }
      };
      window.addEventListener("focusOrder", handler);
      return () => {
        window.removeEventListener("focusOrder", handler);
      };
    }, []);


  useEffect(() => {
    let filtered = orders;

    /*
    if (adminSession && adminSession.branch !== "Head Office") {
      filtered = filtered.filter((order) => order.branch === adminSession.branch);
    }
    */

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        String(order.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(order.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
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
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(orderId);

    const query = supabase
      .from("orders")
      .update({ status: newStatus });

    const { error } = isUUID
      ? await query.eq("id", orderId)
      : await query.eq("order_code", orderId);

    if (error) {
      console.error(error);
      toast.error("Failed to update status");
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          (order.orderCode === orderId || order.id === orderId)
            ? {
                ...order,
                status: newStatus,
                paymentStatus:
                  order.paymentMethod === "cod" && newStatus === "delivered"
                    ? "paid"
                    : order.paymentStatus,
              }
            : order
        )
      );
      // Payment log tracking (frontend side for now)
      if (newStatus === "processing" || newStatus === "delivered") {
        await logPayment(orderId, "updated");
      }
      await fetchOrders();
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setRemarksDraft(
      Object.fromEntries(order.items.map((item: { id: any; adminRemark: any; }) => [String(item.id), item.adminRemark ?? ""]))
    );
    setExchangeResponseDraft(order.exchange_request?.adminMessage ?? "");
  };

  const handlePrintOrder = (order: Order) => {
    // Clean address: remove duplicate ward numbers
    const cleanAddress = String(order.shippingAddress || "").replace(/,\s*(\d+),\1/g, ", $1");
    // --- Dynamic printer size and order QR/barcode setup ---
    const printerSize = localStorage.getItem("printerSize") || "80";
    const width = printerSize === "58" ? "58mm" : "80mm";
    const height = printerSize === "58" ? "100mm" : "120mm";
    const orderQRData = formatOrderCode(order.id);
    // -------------------------------------------------------
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Unable to open the print window.");
      return;
    }
    printWindow.document.write(`
<html>
  <head>
    <title>Pro Label v3 ${formatOrderCode(order.id)}</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <link rel="preload" as="image" href="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${formatOrderCode(order.id)}" />
    <style>
      @page {
        size: ${width} ${height};
        margin: 0;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
      }
      .sticker {
        width: ${width};
        height: ${height};
        border: 2px solid #000;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-right: 90px; /* space for QR */
      }
      .logo {
        width: 42px;
        height: 42px;
      }
      .brand {
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 3px;
      }
      .tagline {
        font-size: 10px;
        letter-spacing: 2px;
      }
      .order-id {
        font-size: 16px;
        font-weight: bold;
        margin-top: 6px;
      }
      .datetime {
        font-size: 10px;
        color: #555;
      }
      .divider {
        border-top: 1px dashed #aaa;
        margin: 8px 0;
      }
      .section {
        font-size: 12px;
      }
      .label {
        font-size: 10px;
        color: #777;
        text-transform: uppercase;
      }
      .value {
        font-weight: 600;
      }
      .delivery {
        border: 1px dashed #000;
        padding: 6px;
        font-size: 11px;
      }
      .items {
        font-size: 11px;
      }
      .total {
        font-size: 15px;
        font-weight: bold;
      }
      .barcode {
        text-align: center;
        font-size: 10px;
        letter-spacing: 2px;
        word-break: break-all;
        overflow: hidden;
      }
      .footer {
        font-size: 10px;
        text-align: center;
        letter-spacing: 2px;
      }
      .qr-top {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 75px;
        height: 75px;
      }
    </style>
  </head>
  <body>
    <div class="sticker">
      <div class="header">
        <img src="${window.location.origin}/clo-sitelogo.svg" class="logo" />
        <div>
          <div class="brand">CLO</div>
          <div class="tagline">BUILT DIFFERENT</div>
        </div>
      </div>
      <div class="qr-top">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${orderQRData}" />
      </div>
      <div>
        <div class="order-id">#${formatOrderCode(order.id)}</div>
        <div class="datetime">${new Date(order.date).toLocaleString()}</div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="label">Customer</div>
        <div class="value">${order.customerName}</div>
      </div>

      <div class="section">
        <div class="label">Address</div>
        <div class="value">${cleanAddress}</div>
      </div>

      <div class="divider"></div>

      <div class="delivery">
        <div><strong>Type:</strong> ${
          order.paymentMethod === "cod" ? "COD" : "Prepaid"
        }</div>
      </div>

      <div class="divider"></div>

      <div class="section items">
        ${order.items
          .map(
            (item: any) =>
              `<div>${item.name} × ${item.quantity}</div>`
          )
          .join("")}
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="label">Subtotal</div>
        <div class="value">
          ${(() => {
            const total = Number(order.total || 0);
            const discount = Number(order.discount_amount || 0);
            const shipping = Number(order.shipping_cost || 0);

            const subtotal =
              order.subtotal !== undefined && order.subtotal !== null
                ? Number(order.subtotal)
                : total + discount - shipping;

            return `NPR ${subtotal.toLocaleString()}`;
          })()}
        </div>
      </div>

      ${
        order.discount_amount
          ? `
      <div class="section" style="color: green;">
        <div class="label">Discount ${order.promo_code ? `(${order.promo_code})` : ""}</div>
        <div class="value">
          - NPR ${Number(order.discount_amount).toLocaleString()}
        </div>
      </div>
      `
          : ""
      }

      ${
        order.shipping_cost
          ? `
      <div class="section">
        <div class="label">Shipping</div>
        <div class="value">
          NPR ${Number(order.shipping_cost || 0).toLocaleString()}
        </div>
      </div>
      `
          : ""
      }

      <div class="divider"></div>

      <div class="total">
        NPR ${Number(order.total || 0).toLocaleString()}
      </div>

      ${
        order.promo_code
          ? `
      <div style="font-size:10px; text-align:center; color:#666;">
        Promo Applied: ${order.promo_code}
      </div>
      `
          : ""
      }

      <div class="barcode">
        <svg id="barcode"></svg>
      </div>

      <div class="footer">
        CLO • clo.com
      </div>
    </div>
    <script>
      JsBarcode("#barcode", "${formatOrderCode(order.id)}", {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false
      });
    </script>
  </body>
</html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500); // wait for images to load
    };

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
      .eq("order_code", selectedOrder.id);

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
    if (!order || !order.exchange_request) return;

    const updatedExchange = {
      ...order.exchange_request,
      status: decision,
      adminMessage: exchangeResponseDraft.trim(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminSession?.name || "Admin",
    };

    const { error } = await supabase
      .from("orders")
      .update({
        status: decision === "approved" ? "exchange_requested" : "delivered",
        exchange_request: updatedExchange,
      })
      .eq("order_code", orderId);

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
    <div className="space-y-6 text-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Order Management</h2>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 tracking-wider">
            {filteredOrders.length} of {orders.length} orders
          </div>

          {/* <button
            onClick={async () => {
              const confirmDelete = window.confirm("Are you sure you want to delete ALL orders?");
              if (!confirmDelete) return;

              const { error } = await supabase.from("orders").delete().neq("id", "");

              if (error) {
                console.error(error);
                toast.error("Failed to reset orders");
              } else {
                toast.success("All orders deleted");
                fetchOrders();
              }
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs uppercase tracking-wider hover:bg-red-200"
          >
            Reset Orders
          </button>*/}

        </div>
      </div>
      {adminSession && adminSession.branch !== "Head Office" ? (
        <p className="text-sm text-gray-600">
          Showing orders assigned to {adminSession.branch}.
        </p>
      ) : null}

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: orders.length },
          { label: "Pending", value: orders.filter(o => o.status === "pending").length },
          { label: "Processing", value: orders.filter(o => o.status === "processing").length },
          { label: "Shipped", value: orders.filter(o => o.status === "shipped").length },
          { label: "Delivered", value: orders.filter(o => o.status === "delivered").length },
        ].map((item) => (
          <div key={item.label} className="bg-zinc-900 p-4 rounded shadow-sm text-center border border-zinc-800">
            <p className="text-xs uppercase text-gray-400 tracking-wider">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider"
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
            className="px-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider"
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
            className="px-4 py-2 bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition-colors tracking-wider uppercase text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {filteredOrders.map((order) => (
                <tr
                  id={`order-${order.id}`}
                  key={`${formatOrderCode(order.id)}-${order.date}`}
                  className="hover:bg-zinc-800 cursor-pointer transition-all duration-300"
                  onClick={() => openOrderModal(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white tracking-wider">
                      #{formatOrderCode(order.id)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white tracking-wider">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-400 tracking-wider">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSourceIcon(order.source)}</span>
                      <span className="text-sm text-white capitalize tracking-wider">
                        {order.source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white tracking-wider">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.orderCode || order.id, e.target.value as Order['status']);
                        }}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm tracking-wider space-y-1">
                      <span className="font-medium capitalize">{order.paymentMethod}</span>

                      <div className="text-xs">
                        {order.paymentMethod === "esewa" ? (
                          <span className={`px-2 py-1 rounded-full ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus === "failed"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-600"
                          }`}>
                            {order.paymentStatus === "paid"
                              ? "Paid"
                              : order.paymentStatus === "failed"
                              ? "Failed"
                              : "Unpaid"}
                          </span>
                        ) : order.paymentMethod === "cod" ? (
                          <span className={`px-2 py-1 rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status === "delivered" ? "Payment Received" : "Pending"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white tracking-wider">
                    NPR {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openOrderModal(order)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Preview Order"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Print Order"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.orderCode || order.id, "shipped")}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
                      >
                        Ship
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.orderCode || order.id, "delivered")}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                      >
                        Deliver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
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
            className="bg-zinc-900 text-white rounded-lg shadow-xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-widest uppercase">
                  Order {formatOrderCode(selectedOrder.id)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-200"
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
                  <p className="text-sm text-gray-400 tracking-wider">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 tracking-wider uppercase">Order Details</h4>
                  <p className="text-sm tracking-wider">Date: {formatDate(selectedOrder.date)}</p>
                  <p className="text-sm tracking-wider">Source: {selectedOrder.source}</p>
                  <p className="text-sm tracking-wider">
                    Payment: {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium mb-2 tracking-wider uppercase">Shipping Address</h4>
                <p className="text-sm tracking-wider">{selectedOrder.shippingAddress}</p>
                {selectedOrder.trackingNumber && (
                  <p className="text-sm text-gray-400 tracking-wider mt-1">
                    Tracking: {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-4 tracking-wider uppercase">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={`${item.id || item.name}-${index}`} className="py-4 border-b border-zinc-800 flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center overflow-hidden rounded">
                        {item.image || item.images ? (
                          <img
                            src={
                              item.image ||
                              (Array.isArray(item.images) ? item.images[0] : item.images) ||
                              "/placeholder.png"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium tracking-wider">{item.name}</p>
                            <p className="text-sm text-gray-400 tracking-wider">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium tracking-wider">
                            NPR {Number(item.price || 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Admin Remark */}
                        <div className="mt-3">
                          <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                            Admin Remark
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
                            className="w-full rounded border border-zinc-700 bg-zinc-950 text-white px-3 py-2 text-sm tracking-wider focus:border-white focus:outline-none"
                            placeholder="Add notes for this item"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-zinc-800 space-y-2">

                  {/* Payment Method */}
                  <div className="flex justify-between text-sm tracking-wider">
                    <span>Payment Method</span>
                    <span className="uppercase font-medium">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  {/* Payment Status */}
                  <div className="flex justify-between text-sm tracking-wider">
                    <span>Payment Status</span>
                    <span className="uppercase font-medium">
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm tracking-wider">
                    <span>Subtotal</span>
                    <span>
                      {(() => {
                        const total = Number(selectedOrder.total || 0);
                        const discount = Number(selectedOrder.discount_amount || 0);
                        const shipping = Number(selectedOrder.shipping_cost || 0);

                        const subtotal =
                          selectedOrder.subtotal !== undefined && selectedOrder.subtotal !== null
                            ? Number(selectedOrder.subtotal)
                            : total + discount - shipping;

                        return `NPR ${subtotal.toLocaleString()}`;
                      })()}
                    </span>
                  </div>

                  {/* Discount */}
                  {selectedOrder.discount_amount ? (
                    <div className="flex justify-between text-sm tracking-wider text-green-600">
                      <span>
                        Discount {selectedOrder.promo_code ? `(${selectedOrder.promo_code})` : ""}
                      </span>
                      <span>
                        - NPR {Number(selectedOrder.discount_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {/* Shipping */}
                  {selectedOrder.shipping_cost !== undefined ? (
                    <div className="flex justify-between text-sm tracking-wider">
                      <span>Shipping</span>
                      <span>
                        NPR {Number(selectedOrder.shipping_cost || 0).toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800 font-semibold tracking-wider uppercase">
                    <span>Total</span>
                    <span>NPR {Number(selectedOrder.total || 0).toLocaleString()}</span>
                  </div>

                  {/* Promo indicator */}
                  {selectedOrder.promo_code ? (
                    <div className="text-xs text-gray-400 tracking-wider">
                      Promo Applied: {selectedOrder.promo_code}
                    </div>
                  ) : null}

                </div>
              </div>
              {selectedOrder.exchange_request ? (
                <div className="space-y-4 border-t border-zinc-800 pt-4">
                  <div>
                    <h4 className="font-medium mb-2 tracking-wider uppercase">Exchange Request</h4>
                    <p className="text-sm tracking-wider text-gray-300">
                      {selectedOrder.exchange_request.reason}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                      Status: {selectedOrder.exchange_request.status.replace("_", " ")}
                    </p>
                    {selectedOrder.exchange_request.reviewedBy ? (
                      <p className="mt-1 text-xs uppercase tracking-wider text-gray-400">
                        Reviewed by {selectedOrder.exchange_request.reviewedBy}
                      </p>
                    ) : null}
                    {selectedOrder.exchange_request.adminMessage ? (
                      <div className="mt-3 rounded border border-zinc-800 bg-zinc-800 p-3">
                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          Message to Customer
                        </p>
                        <p className="mt-2 text-sm text-gray-300">
                          {selectedOrder.exchange_request.adminMessage}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {selectedOrder.exchange_request.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {selectedOrder.exchange_request.images.map((image: string | undefined, index: number) => (
                        <img
                          key={`${selectedOrder.id}-exchange-${index}`}
                          src={image}
                          alt={`Exchange request ${index + 1}`}
                          className="h-28 w-full rounded object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  {selectedOrder.exchange_request.status === "pending" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                          Message to Customer
                        </label>
                        <textarea
                          value={exchangeResponseDraft}
                          onChange={(event) => setExchangeResponseDraft(event.target.value)}
                          rows={4}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 text-white px-3 py-2 text-sm tracking-wider focus:border-white focus:outline-none"
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
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="px-4 py-2 bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition-colors tracking-wider uppercase text-sm"
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
