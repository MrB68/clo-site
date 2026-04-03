import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Package, Clock, CheckCircle, Truck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

export function Orders() {
  const { user } = useAuth();

  // Mock orders data - in a real app, this would come from an API
  const mockOrders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 33117,
      items: [
        {
          id: "3",
          name: "Urban Streetwear Set",
          price: 33117,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1642400997435-f4b7c0f68ce9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmYXNoaW9uJTIwc3RyZWV0d2VhciUyMG1vZGVsfGVufDF8fHx8MTc3NTA0NjY1N3ww&ixlib=rb-4.1.0&q=80&w=1080"
        }
      ]
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "shipped",
      total: 21147,
      items: [
        {
          id: "11",
          name: "Black Knit Sweater",
          price: 21147,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1624910996561-daeb5bd84fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHN3ZWF0ZXIlMjBmYXNoaW9uJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6 tracking-wider">
            Please sign in to view your orders.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "processing":
        return <Package size={16} className="text-blue-500" />;
      case "shipped":
        return <Truck size={16} className="text-purple-500" />;
      case "delivered":
        return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Order Placed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm tracking-wider uppercase">Back to Profile</span>
          </Link>
          <h1 className="text-2xl tracking-widest uppercase">My Orders</h1>
          <div></div> {/* Spacer for flex layout */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mockOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 tracking-widest uppercase">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6 tracking-wider">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {mockOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold tracking-wider uppercase">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 tracking-wider">
                        Placed on {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium tracking-wider uppercase">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 mb-4 last:mb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium tracking-wider">{item.name}</h4>
                        <p className="text-sm text-gray-600 tracking-wider">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tracking-wider">
                          NPR {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="text-sm text-blue-600 hover:text-blue-800 tracking-wider uppercase">
                        View Details
                      </button>
                      <button className="text-sm text-blue-600 hover:text-blue-800 tracking-wider uppercase">
                        Track Order
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 tracking-wider uppercase">
                        Total
                      </p>
                      <p className="font-semibold tracking-wider">
                        NPR {order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}