import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Star } from "lucide-react";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  units: number;
  category: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const mockSalesData: SalesData[] = [
  { date: "2024-01-01", revenue: 125000, orders: 45, customers: 38 },
  { date: "2024-01-02", revenue: 98000, orders: 32, customers: 28 },
  { date: "2024-01-03", revenue: 156000, orders: 58, customers: 52 },
  { date: "2024-01-04", revenue: 134000, orders: 41, customers: 36 },
  { date: "2024-01-05", revenue: 187000, orders: 67, customers: 61 },
  { date: "2024-01-06", revenue: 142000, orders: 49, customers: 44 },
  { date: "2024-01-07", revenue: 168000, orders: 62, customers: 55 },
  { date: "2024-01-08", revenue: 195000, orders: 71, customers: 65 },
  { date: "2024-01-09", revenue: 178000, orders: 64, customers: 58 },
  { date: "2024-01-10", revenue: 203000, orders: 73, customers: 67 },
  { date: "2024-01-11", revenue: 189000, orders: 68, customers: 62 },
  { date: "2024-01-12", revenue: 221000, orders: 79, customers: 72 },
  { date: "2024-01-13", revenue: 198000, orders: 71, customers: 65 },
  { date: "2024-01-14", revenue: 234000, orders: 84, customers: 76 },
];

const mockTopProducts: TopProduct[] = [
  { id: "1", name: "Classic Black Jacket", revenue: 159000, units: 53, category: "women" },
  { id: "9", name: "Runway Collection Piece", revenue: 398000, units: 19, category: "women" },
  { id: "12", name: "Statement Outerwear", revenue: 358000, units: 31, category: "men" },
  { id: "5", name: "Premium Denim Jacket", revenue: 232000, units: 29, category: "men" },
  { id: "10", name: "Beige Overcoat", revenue: 265000, units: 22, category: "women" },
];

const mockCategoryData: CategoryData[] = [
  { name: "Women", value: 45, color: "#000000" },
  { name: "Men", value: 35, color: "#666666" },
  { name: "Accessories", value: 20, color: "#999999" },
];

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  useEffect(() => {
    // Calculate metrics from mock data
    const revenue = mockSalesData.reduce((sum, day) => sum + day.revenue, 0);
    const orders = mockSalesData.reduce((sum, day) => sum + day.orders, 0);
    const customers = mockSalesData.reduce((sum, day) => sum + day.customers, 0);

    setTotalRevenue(revenue);
    setTotalOrders(orders);
    setTotalCustomers(customers);
    setAvgOrderValue(Math.round(revenue / orders));
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return `NPR ${(value / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Sales Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm tracking-wider uppercase border ${
                timeRange === range
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              } transition-colors`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Revenue</p>
              <p className="text-2xl font-bold tracking-wider">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Orders</p>
              <p className="text-2xl font-bold tracking-wider">{totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Customers</p>
              <p className="text-2xl font-bold tracking-wider">{totalCustomers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Avg Order Value</p>
              <p className="text-2xl font-bold tracking-wider">NPR {avgOrderValue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
                fill="#000000"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {mockCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {mockCategoryData.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm tracking-wider uppercase">{category.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase">Daily Orders</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip
              formatter={(value: number) => [value, 'Orders']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Bar dataKey="orders" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold tracking-widest uppercase">Top Performing Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTopProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 tracking-wider">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tracking-wider">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tracking-wider">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}