import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
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
  const adminSession = useMemo(() => getAdminSession(), []);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
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
    const syncAnalytics = async () => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - (getDaysForTimeRange(timeRange) - 1));

      // Performance improvement: fetch only required fields
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("id, order_code, created_at, total, status, payment_status, branch, customer_email, items, payment_method");
      console.log("ORDERS RAW:", ordersData);
      console.log("ALL ORDERS AFTER FETCH:", ordersData);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }
      const orders = (ordersData || [])
        .filter((order) => new Date(order.created_at) >= cutoff)
        .filter((order) => {
          const method = String(order.payment_method || "").toLowerCase();
          const status = String(order.status || "").toLowerCase();
          const paymentStatus = String((order as any).payment_status || "").toLowerCase();

          console.log("ANALYTICS FILTER CHECK:", { method, status, paymentStatus });

          // ❌ ignore cancelled
          if (["cancelled", "canceled"].includes(status)) return false;

          const effectiveMethod = method || "cod";

          // ✅ eSewa / online → count if payment is paid
          if (effectiveMethod === "esewa" || effectiveMethod === "online") {
            return paymentStatus === "paid";
          }

          // ✅ COD → count if delivered, processing, or pending
          if (effectiveMethod === "cod") {
            return status === "delivered" || status === "processing" || status === "pending";
          }

          return false;
        });

      let realizedRevenue = 0;
      let pendingRevenueCalc = 0;

      orders.forEach((order) => {
        const value = parseFloat(order.total);
        if (isNaN(value)) return;

        const method = String(order.payment_method || "").toLowerCase();
        const status = String(order.status || "").toLowerCase();
        const paymentStatus = String((order as any).payment_status || "").toLowerCase();

        if (method === "esewa" || method === "online") {
          // paid online = realized revenue
          if (paymentStatus === "paid") {
            realizedRevenue += value;
          }
        } else {
          // COD → only delivered is realized
          if (status === "delivered") {
            realizedRevenue += value;
          }

          // 🔥 Pending revenue = ALL COD orders except delivered
          if (status !== "delivered") {
            pendingRevenueCalc += value;
          }
        }
      });

      console.log("REALIZED REVENUE:", realizedRevenue);
      console.log("PENDING REVENUE:", pendingRevenueCalc);
      const customers = new Set(
        orders.map((order) => String(order.customer_email || "").toLowerCase())
      ).size;

      const groupedSales = new Map<string, SalesData>();
      orders.forEach((order) => {
        const dateKey = new Date(order.created_at).toISOString().slice(0, 10);
        const existing = groupedSales.get(dateKey) ?? {
          date: dateKey,
          revenue: 0,
          orders: 0,
          customers: 0,
        };
        existing.revenue += Number(order.total || 0);
        existing.orders += 1;
        existing.customers += 1;
        groupedSales.set(dateKey, existing);
      });

      const nextSalesData = Array.from(groupedSales.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      const productPerformance = new Map<string, TopProduct>();
      orders.forEach((order) => {
        let itemsArray: any[] = [];

        try {
          if (Array.isArray(order.items)) {
            itemsArray = order.items;
          } else if (typeof order.items === "string") {
            itemsArray = JSON.parse(order.items);
          } else {
            itemsArray = [];
          }
        } catch (err) {
          console.error("ITEM PARSE ERROR:", order.items);
          itemsArray = [];
        }

        itemsArray.forEach((item: { id: string; name: any; price: number; quantity: number; }) => {
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
        let itemsArray: any[] = [];

        try {
          if (Array.isArray(order.items)) {
            itemsArray = order.items;
          } else if (typeof order.items === "string") {
            itemsArray = JSON.parse(order.items);
          } else {
            itemsArray = [];
          }
        } catch (err) {
          console.error("ITEM PARSE ERROR:", order.items);
          itemsArray = [];
        }

        itemsArray.forEach((item: { id: string; price: number; quantity: number; }) => {
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

      setTotalRevenue(realizedRevenue);
      setPendingRevenue(pendingRevenueCalc);
      setTotalOrders(orders.length);
      setTotalCustomers(customers);
      setAvgOrderValue(orders.length ? Math.round(realizedRevenue / orders.length) : 0);
      setSalesData(nextSalesData);
      setTopProducts(nextTopProducts);
      setCategoryData(nextCategoryData);
    };

    syncAnalytics();
    window.addEventListener("ordersUpdated", syncAnalytics);
    window.addEventListener("storage", syncAnalytics);

    // 🔥 Realtime subscription to orders table
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          syncAnalytics();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("ordersUpdated", syncAnalytics);
      window.removeEventListener("storage", syncAnalytics);
      supabase.removeChannel(channel);
    };
  }, [adminSession?.branch, timeRange]);

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
    return `NPR ${Number(value || 0).toLocaleString()}`;
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
    <div className="space-y-8 px-2 md:px-4 text-black dark:text-white">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Sales Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm tracking-wider uppercase border rounded-md transition-all duration-200 ${
                timeRange === range
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-black text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:border-gray-400'
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
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Revenue</p>
              <p className="text-2xl font-bold tracking-wider animate-pulse">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Pending Revenue</p>
              <p className="text-2xl font-bold tracking-wider animate-pulse">{formatCurrency(pendingRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Orders</p>
              <p className="text-2xl font-bold tracking-wider animate-pulse">{totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Customers</p>
              <p className="text-2xl font-bold tracking-wider animate-pulse">{totalCustomers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Avg Order Value</p>
              <p className="text-2xl font-bold tracking-wider animate-pulse">NPR {avgOrderValue.toLocaleString()}</p>
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
          className="bg-white dark:bg-black backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase flex items-center gap-2">Revenue Trend</h3>
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
          className="bg-white dark:bg-black backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase flex items-center gap-2">Sales by Category</h3>
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
              <div key={`${category.name}-${index}`}>
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
        className="bg-white dark:bg-black backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
      >
        <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase flex items-center gap-2">Daily Orders</h3>
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
        className="bg-white dark:bg-black rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold tracking-widest uppercase flex items-center gap-2">Top Performing Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
              {topProducts.map((product, index) => (
                  <tr key={`${product.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black dark:text-white tracking-wider">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-black dark:text-white capitalize tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white tracking-wider">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white tracking-wider">
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
