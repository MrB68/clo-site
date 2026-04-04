import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
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
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useProducts } from "../../contexts/ProductsContext";
import { getStoredOrders } from "../../utils/orders";
import { getAdminSession } from "../../utils/admin";

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

function getDaysForTimeRange(timeRange: "7d" | "30d" | "90d") {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

export function SalesAnalytics() {
  const { products } = useProducts();
  const adminSession = getAdminSession();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [adminTheme, setAdminTheme] = useState<"light" | "dark">(() => {
    const savedAdminTheme = localStorage.getItem("adminTheme");
    return savedAdminTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const syncAnalytics = () => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - (getDaysForTimeRange(timeRange) - 1));

      const orders = getStoredOrders()
        .filter((order) => new Date(order.date) >= cutoff)
        .filter((order) => order.status === "delivered")
        .filter((order) =>
          adminSession && adminSession.branch !== "Head Office"
            ? order.branch === adminSession.branch
            : true
        );

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      const customers = new Set(orders.map((order) => order.customerEmail.toLowerCase())).size;

      const groupedSales = new Map<string, SalesData>();
      orders.forEach((order) => {
        const dateKey = new Date(order.date).toISOString().slice(0, 10);
        const existing = groupedSales.get(dateKey) ?? {
          date: dateKey,
          revenue: 0,
          orders: 0,
          customers: 0,
        };
        existing.revenue += order.total;
        existing.orders += 1;
        existing.customers += 1;
        groupedSales.set(dateKey, existing);
      });

      const nextSalesData = Array.from(groupedSales.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      const productPerformance = new Map<string, TopProduct>();
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const product = products.find((entry) => entry.id === item.id);
          const existing = productPerformance.get(item.id) ?? {
            id: item.id,
            name: item.name,
            revenue: 0,
            units: 0,
            category: product?.category ?? "unknown",
          };
          existing.revenue += item.price * item.quantity;
          existing.units += item.quantity;
          productPerformance.set(item.id, existing);
        });
      });

      const nextTopProducts = Array.from(productPerformance.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const categoryTotals = new Map<string, number>();
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const category = products.find((entry) => entry.id === item.id)?.category ?? "unknown";
          categoryTotals.set(
            category,
            (categoryTotals.get(category) ?? 0) + item.price * item.quantity
          );
        });
      });

      const totalCategoryRevenue = Array.from(categoryTotals.values()).reduce(
        (sum, value) => sum + value,
        0
      );
      const fallbackColors = ["#000000", "#666666", "#999999", "#b3b3b3", "#d1d5db"];
      const nextCategoryData = Array.from(categoryTotals.entries())
        .map(([name, value], index) => ({
          name,
          value:
            totalCategoryRevenue > 0
              ? Math.round((value / totalCategoryRevenue) * 100)
              : 0,
          color: fallbackColors[index % fallbackColors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setTotalRevenue(revenue);
      setTotalOrders(orders.length);
      setTotalCustomers(customers);
      setAvgOrderValue(orders.length ? Math.round(revenue / orders.length) : 0);
      setSalesData(nextSalesData);
      setTopProducts(nextTopProducts);
      setCategoryData(nextCategoryData);
    };

    syncAnalytics();
    window.addEventListener("ordersUpdated", syncAnalytics);
    window.addEventListener("storage", syncAnalytics);

    return () => {
      window.removeEventListener("ordersUpdated", syncAnalytics);
      window.removeEventListener("storage", syncAnalytics);
    };
  }, [adminSession, products, timeRange]);

  useEffect(() => {
    const syncAdminTheme = () => {
      const savedAdminTheme = localStorage.getItem("adminTheme");
      setAdminTheme(savedAdminTheme === "dark" ? "dark" : "light");
    };

    syncAdminTheme();
    window.addEventListener("adminThemeUpdated", syncAdminTheme);
    window.addEventListener("storage", syncAdminTheme);

    return () => {
      window.removeEventListener("adminThemeUpdated", syncAdminTheme);
      window.removeEventListener("storage", syncAdminTheme);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return `NPR ${(value / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartColors =
    adminTheme === "dark"
      ? {
          axis: "#cfcfcf",
          grid: "#2f2f2f",
          tooltipBg: "#0a0a0a",
          tooltipBorder: "#333333",
          areaStroke: "#ffffff",
          areaFill: "#ffffff",
          barFill: "#f5f5f5",
          pieColors: ["#f5f5f5", "#bfbfbf", "#737373"],
        }
      : {
          axis: "#4b5563",
          grid: "#e5e7eb",
          tooltipBg: "#ffffff",
          tooltipBorder: "#d1d5db",
          areaStroke: "#000000",
          areaFill: "#000000",
          barFill: "#000000",
          pieColors: ["#000000", "#666666", "#999999"],
        };
// The component renders a sales analytics dashboard with a time range selector, KPI cards for total revenue, orders, customers, and average order value, as well as charts for revenue trends and category breakdowns. It also includes a table of top-performing products. The layout is responsive and uses Tailwind CSS for styling, along with Framer Motion for subtle animations.
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
            <AreaChart data={salesData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                fontSize={12}
                tick={{ fill: chartColors.axis }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                fontSize={12}
                tick={{ fill: chartColors.axis }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={{ stroke: chartColors.grid }}
              />
              <Tooltip
                formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  borderColor: chartColors.tooltipBorder,
                  color: chartColors.axis,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.areaStroke}
                fill={chartColors.areaFill}
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
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors.pieColors[index] ?? entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Share']}
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  borderColor: chartColors.tooltipBorder,
                  color: chartColors.axis,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartColors.pieColors[index] ?? category.color }}
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
          <BarChart data={salesData}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
              tick={{ fill: chartColors.axis }}
              axisLine={{ stroke: chartColors.grid }}
              tickLine={{ stroke: chartColors.grid }}
            />
            <YAxis
              fontSize={12}
              tick={{ fill: chartColors.axis }}
              axisLine={{ stroke: chartColors.grid }}
              tickLine={{ stroke: chartColors.grid }}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Orders']}
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                borderColor: chartColors.tooltipBorder,
                color: chartColors.axis,
              }}
            />
            <Bar dataKey="orders" fill={chartColors.barFill} />
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
              {topProducts.map((product) => (
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
