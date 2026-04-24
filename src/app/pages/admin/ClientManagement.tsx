import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag, Star, MessageSquare } from "lucide-react";
import { getAdminSession } from "../../utils/admin";
import { getCustomerProfileByEmail } from "../../utils/customerProfile";
import { supabase } from "../../../lib/supabase";
import { StoredOrder } from "@/app/utils/orders";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  status: 'new' | 'regular' | 'vip';
  notes: string;
  avatar?: string;
}

function getClientStatus(orderCount: number, totalSpent: number): Client["status"] {
  if (orderCount <= 1) {
    return "new";
  }

  if (orderCount >= 4 || totalSpent >= 120000) {
    return "vip";
  }

  return "regular";
}

function buildClientNotes(clientOrders: StoredOrder[]) {
  const latestOrder = clientOrders[0];
  if (!latestOrder) {
    return "";
  }

  const latestItems = latestOrder.items.map((item) => item.name).join(", ");
  return `Recent order items: ${latestItems}`;
}

function buildClientsFromOrders(orders: any[]) {
  const groupedOrders = new Map<string, StoredOrder[]>();

  orders.forEach((order) => {
const email = order.customerEmail;

if (!email) return;

const key = email.toLowerCase();
    const existingOrders = groupedOrders.get(key) ?? [];
    groupedOrders.set(key, [...existingOrders, order]);
  });

  return Array.from(groupedOrders.entries()).map(([email, clientOrders]) => {
    const sortedOrders = [...clientOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const firstOrder = sortedOrders[sortedOrders.length - 1];
    const latestOrder = sortedOrders[0];
    const totalSpent = sortedOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = sortedOrders.length;

    return {
  id: email,

  name:
    latestOrder.customerName ||
    (latestOrder.customerEmail
      ? latestOrder.customerEmail.split("@")[0]
      : "Unknown"),

  email:
    latestOrder.customerEmail ||
    (latestOrder as any)?.customer_email ||
    (latestOrder as any)?.customeremail ||
    "",

  phone:
    latestOrder.phone ||
    (latestOrder as any)?.phone_number ||
    "",

  address:
    latestOrder.shippingAddress ||
    (latestOrder as any)?.shipping_address ||
    (latestOrder as any)?.address ||
    "",

  totalSpent,
  orderCount,
  firstPurchaseDate: firstOrder.date,
  lastPurchaseDate: latestOrder.date,
  status: getClientStatus(orderCount, totalSpent),
  notes: buildClientNotes(sortedOrders),

  avatar: (() => {
    const emailForAvatar =
      latestOrder.customerEmail ||
      (latestOrder as any)?.customer_email ||
      (latestOrder as any)?.customeremail ||
      "";

    return emailForAvatar
      ? getCustomerProfileByEmail(emailForAvatar)?.profileImage || ""
      : "";
  })(),
} satisfies Client;
  });
}

function getClientInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientManagement() {
  const adminSession = useMemo(() => getAdminSession(), []);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
  const fetchClients = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      console.error("Client fetch error:", error);
      return;
    }

    const visibleOrders =
      adminSession && adminSession.branch !== "Head Office"
        ? (orders || []).filter((order: any) => order.branch === adminSession.branch)
        : (orders || []);

    const normalizedOrders = (visibleOrders || []).map((o: any) => ({
  ...o,

  customerName: o.customer_name || o.customerName || "",
  customerEmail: o.customer_email || o.customeremail || o.customerEmail || "",
  shippingAddress: o.shipping_address || o.shippingAddress || o.address || "",
  phone: o.phone || o.phone_number || "",

  date: o.created_at || o.date,
  total: Number(o.total || 0),
  items: Array.isArray(o.items) ? o.items : [],
}));

setClients(buildClientsFromOrders(normalizedOrders));
  };

  fetchClients();
}, [adminSession?.branch]);

  useEffect(() => {
    let filtered = clients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter]);

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "regular":
        return "bg-green-100 text-green-800";
      case "vip":
        return "bg-purple-100 text-purple-800";
    }
  };

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case "new":
        return "New";
      case "regular":
        return "Regular";
      case "vip":
        return "VIP";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return `NPR ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Client Management</h2>
        <div className="text-sm text-gray-600 tracking-wider">
          {filteredClients.length} of {clients.length} clients
        </div>
      </div>
      {adminSession && adminSession.branch !== "Head Office" ? (
        <p className="text-sm text-gray-600">
          Showing customers with orders assigned to {adminSession.branch}.
        </p>
      ) : null}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
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
            <option value="new">New</option>
            <option value="regular">Regular</option>
            <option value="vip">VIP</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors tracking-wider uppercase text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Star size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">New Clients</p>
              <p className="text-2xl font-bold tracking-wider">
                {clients.filter(c => c.status === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Regular Clients</p>
              <p className="text-2xl font-bold tracking-wider">
                {clients.filter(c => c.status === 'regular').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">VIP Clients</p>
              <p className="text-2xl font-bold tracking-wider">
                {clients.filter(c => c.status === 'vip').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageSquare size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Clients</p>
              <p className="text-2xl font-bold tracking-wider">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {client.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold tracking-wider text-white">
                    {getClientInitials(client.name)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold tracking-wider">{client.name}</h3>
                  <p className="text-sm text-gray-600 tracking-wider">{client.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 tracking-wider uppercase ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 tracking-wider uppercase">Total Spent</span>
                  <span className="font-medium tracking-wider">{formatCurrency(client.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 tracking-wider uppercase">Orders</span>
                  <span className="font-medium tracking-wider">{client.orderCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 tracking-wider uppercase">Last Order</span>
                  <span className="font-medium tracking-wider">{formatDate(client.lastPurchaseDate)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedClient(client);
                  setShowClientModal(true);
                }}
                className="mt-4 w-full bg-black px-4 py-2 text-sm uppercase tracking-wider text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Client Detail Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedClient.avatar ? (
                    <img
                      src={selectedClient.avatar}
                      alt={selectedClient.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-lg font-semibold tracking-wider text-white">
                      {getClientInitials(selectedClient.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold tracking-wider">{selectedClient.name}</h3>
                    <p className="text-gray-600 tracking-wider">{selectedClient.email}</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 tracking-wider uppercase ${getStatusColor(selectedClient.status)}`}>
                      {getStatusLabel(selectedClient.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="font-medium mb-3 tracking-wider uppercase">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="tracking-wider">{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <span className="tracking-wider">{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="tracking-wider">{selectedClient.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="font-medium mb-3 tracking-wider uppercase">Purchase History</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 tracking-wider uppercase">Total Spent</p>
                    <p className="text-xl font-bold tracking-wider">{formatCurrency(selectedClient.totalSpent)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 tracking-wider uppercase">Orders</p>
                    <p className="text-xl font-bold tracking-wider">{selectedClient.orderCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 tracking-wider uppercase">First Purchase</p>
                    <p className="text-sm font-medium tracking-wider">{formatDate(selectedClient.firstPurchaseDate)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 tracking-wider uppercase">Last Purchase</p>
                    <p className="text-sm font-medium tracking-wider">{formatDate(selectedClient.lastPurchaseDate)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="font-medium mb-3 tracking-wider uppercase">Notes</h4>
                  <p className="text-gray-700 tracking-wider bg-gray-50 p-3 rounded">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors tracking-wider uppercase text-sm">
                  Send Message
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm">
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
