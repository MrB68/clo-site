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
      const days = getDaysForTimeRange(timeRange);

      const { data, error } = await supabase.rpc("get_sales_analytics_full", {
        days,
      });

      if (error) {
        console.error("Analytics RPC error:", error);
        return;
      }

      if (!data) return;

      const fallbackColors = ["#000000", "#666666", "#999999", "#b3b3b3", "#d1d5db"];

      // KPIs
      setTotalRevenue(data.total_revenue || 0);
      setPendingRevenue(data.pending_revenue || 0);
      setTotalOrders(data.total_orders || 0);
      setTotalCustomers(data.total_customers || 0);
      setAvgOrderValue(data.avg_order_value || 0);

      // Sales chart
      setSalesData(data.sales_data || []);

      // Top products (stable merge, preserve existing category if already set)
      setTopProducts(prev => {
        const next = (data.top_products || []).map((p: any) => {
          const matchedProduct = products.find(prod => prod.id === p.id);
          // 🔥 preserve existing category if already resolved
          const existing = prev.find(prevP => prevP.id === p.id);
          return {
            ...p,
            category:
              p.category ||
              matchedProduct?.category ||
              existing?.category ||
              "uncategorized",
          };
        });
        return next;
      });

      // Category
      const totalCategoryRevenue = (data.category || []).reduce(
        (sum: number, c: any) => sum + (c.revenue || 0),
        0
      );

      const nextCategoryData = (data.category || []).map((c: any, i: number) => ({
        name: c.category || "unknown",
        value: totalCategoryRevenue
          ? Math.round(((c.revenue || 0) / totalCategoryRevenue) * 100)
          : 0,
        raw: Math.round(c.revenue || 0),
        color: fallbackColors[i % fallbackColors.length],
      }));

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
  }, [adminSession?.branch, timeRange, products]);

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
    <div className="space-y-8 px-2 md:px-4 text-black dark:text-gray-100 bg-white dark:bg-[#0a0a0a] min-h-screen">
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
                  : 'bg-white dark:bg-[#111111] text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:border-gray-400'
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
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Revenue</p>
              <p className="text-2xl font-bold tracking-wider">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Pending Revenue</p>
              <p className="text-2xl font-bold tracking-wider">{formatCurrency(pendingRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Orders</p>
              <p className="text-2xl font-bold tracking-wider">{totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Total Customers</p>
              <p className="text-2xl font-bold tracking-wider">{totalCustomers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 tracking-wider uppercase">Avg Order Value</p>
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
          className="bg-white dark:bg-[#111111] backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase flex items-center gap-2">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData} key={salesData.length}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />

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
                  transition: "all 0.2s ease",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          className="bg-white dark:bg-[#111111] backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
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
                formatter={(value: number, _: any, props: any) => [
                  `${value}% (${props.payload.raw?.toLocaleString() || 0})`,
                  'Share'
                ]}
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  borderColor: chartColors.tooltipBorder,
                  color: chartColors.axis,
                  transition: "all 0.2s ease",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4 text-gray-700 dark:text-gray-300">
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
        transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-[#111111] backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800"
      >
        <h3 className="text-lg font-semibold mb-4 tracking-widest uppercase flex items-center gap-2">Daily Orders</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData} key={salesData.length}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
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
                transition: "all 0.2s ease",
              }}
            />
            <Bar
              dataKey="orders"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-[#111111] rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold tracking-widest uppercase flex items-center gap-2">Top Performing Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0f0f0f]">
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
            <tbody className="bg-white dark:bg-[#111111] divide-y divide-gray-200 dark:divide-gray-800">
              {topProducts.map((product, index) => (
                <tr key={`${product.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black dark:text-gray-100 tracking-wider">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-black dark:text-gray-100 capitalize tracking-wider">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100 tracking-wider">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100 tracking-wider">
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
