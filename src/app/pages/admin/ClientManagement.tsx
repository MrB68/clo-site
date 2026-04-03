import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag, Star, MessageSquare } from "lucide-react";

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

const mockClients: Client[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+977 9801234567",
    address: "123 Main St, Kathmandu, Nepal",
    totalSpent: 89264,
    orderCount: 3,
    firstPurchaseDate: "2023-08-15",
    lastPurchaseDate: "2024-01-15",
    status: "vip",
    notes: "Loyal customer, prefers minimalist style",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzUwNDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+977 9812345678",
    address: "456 Oak Ave, Pokhara, Nepal",
    totalSpent: 54311,
    orderCount: 2,
    firstPurchaseDate: "2023-11-20",
    lastPurchaseDate: "2024-01-14",
    status: "regular",
    notes: "Interested in streetwear",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1MDQ2NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.davis@email.com",
    phone: "+977 9823456789",
    address: "789 Pine Rd, Lalitpur, Nepal",
    totalSpent: 237147,
    orderCount: 5,
    firstPurchaseDate: "2023-06-10",
    lastPurchaseDate: "2024-01-13",
    status: "vip",
    notes: "High-value customer, fashion enthusiast",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXx8fHwxNzc1MDQ2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@email.com",
    phone: "+977 9834567890",
    address: "321 Elm St, Bhaktapur, Nepal",
    totalSpent: 398000,
    orderCount: 1,
    firstPurchaseDate: "2024-01-12",
    lastPurchaseDate: "2024-01-12",
    status: "new",
    notes: "First purchase, potential VIP",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcG9ydHJhaXQlMjBidXNpbmVzc3xlbnwxfHx8fDE3NzUwNDY2NjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    phone: "+977 9845678901",
    address: "654 Cedar Ln, Kathmandu, Nepal",
    totalSpent: 121381,
    orderCount: 4,
    firstPurchaseDate: "2023-09-05",
    lastPurchaseDate: "2024-01-11",
    status: "regular",
    notes: "Prefers accessories and basics",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc3NTA0NjY2MXww&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={client.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcG9ydHJhaXQlMjBidXNpbmVzc3xlbnwxfHx8fDE3NzUwNDY2NjF8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                  alt={client.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
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
                className="w-full mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm"
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
                  <img
                    src={selectedClient.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcG9ydHJhaXQlMjBidXNpbmVzc3xlbnwxfHx8fDE3NzUwNDY2NjF8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                    alt={selectedClient.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
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