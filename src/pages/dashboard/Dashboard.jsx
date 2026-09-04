import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Utensils,
  Star,
  MessageSquare,
  ChevronRight,
  Flame,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useGetDashboardOverviewQuery } from "../../services/dashboardApi";
import Button from "../../components/ui/Button";

function formatRupee(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("weekly");
  const [activeChartMetric, setActiveChartMetric] = useState("revenue"); // 'revenue' | 'orders'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    refetch,
  } = useGetDashboardOverviewQuery({ timeframe });

  const overview = dashboardData?.data || {};
  const kpis = overview.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    todaySales: 0,
    todayOrders: 0,
    yesterdaySales: 0,
    salesGrowth: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  };

  const trends = overview.trends || [];
  const statusDistribution = overview.statusDistribution || {};
  const topProducts = overview.topProducts || [];
  const categorySales = overview.categorySales || [];
  const recentOrders = overview.recentOrders || [];
  const recentActivities = overview.recentActivities || [];

  // Trend Graph Calculations
  const chartPoints = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    const maxRevenue = Math.max(...trends.map((t) => t.revenue), 100);
    const maxOrders = Math.max(...trends.map((t) => t.orders), 10);

    return trends.map((t, idx) => {
      const x = trends.length > 1 ? (idx / (trends.length - 1)) * 520 + 40 : 300;
      const yRevenue = 200 - (t.revenue / maxRevenue) * 150;
      const yOrders = 200 - (t.orders / maxOrders) * 150;
      return {
        ...t,
        x,
        yRevenue,
        yOrders,
      };
    });
  }, [trends]);

  const svgPathRevenue = useMemo(() => {
    if (chartPoints.length < 2) return "";
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt.yRevenue}`;
      const prev = chartPoints[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.yRevenue} ${cx},${pt.yRevenue} ${pt.x},${pt.yRevenue}`;
    }, "");
  }, [chartPoints]);

  const svgAreaRevenue = useMemo(() => {
    if (chartPoints.length < 2) return "";
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${svgPathRevenue} L ${last.x},210 L ${first.x},210 Z`;
  }, [svgPathRevenue, chartPoints]);

  const svgPathOrders = useMemo(() => {
    if (chartPoints.length < 2) return "";
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt.yOrders}`;
      const prev = chartPoints[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.yOrders} ${cx},${pt.yOrders} ${pt.x},${pt.yOrders}`;
    }, "");
  }, [chartPoints]);

  const svgAreaOrders = useMemo(() => {
    if (chartPoints.length < 2) return "";
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${svgPathOrders} L ${last.x},210 L ${first.x},210 Z`;
  }, [svgPathOrders, chartPoints]);

  const avgOrderValue =
    kpis.totalOrders > 0 ? Math.round(kpis.totalRevenue / kpis.totalOrders) : 0;

  const totalStatusCount =
    (statusDistribution.preparing || 0) +
    (statusDistribution.out_for_delivery || 0) +
    (statusDistribution.delivered || 0) +
    (statusDistribution.cancelled || 0) || 1;

  const deliveredPercent = Math.round(
    ((statusDistribution.delivered || 0) / totalStatusCount) * 100
  );
  const pendingPercent = Math.round(
    (((statusDistribution.preparing || 0) + (statusDistribution.out_for_delivery || 0)) /
      totalStatusCount) *
      100
  );
  const cancelledPercent = Math.round(
    ((statusDistribution.cancelled || 0) / totalStatusCount) * 100
  );

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") {
      return (
        <span
          style={{
            background: "#dcfce7",
            color: "#15803d",
            padding: "3px 8px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CheckCircle2 size={12} /> Delivered
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "3px 8px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <AlertTriangle size={12} /> Cancelled
        </span>
      );
    }
    return (
      <span
        style={{
          background: "#fef3c7",
          color: "#b45309",
          padding: "3px 8px",
          borderRadius: "9999px",
          fontSize: "11px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Clock size={12} /> {status || "Preparing"}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "32px" }}>
      {/* 1. TOP HEADER & TIMEFRAME BAR */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: "#ffffff",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#111827" }}>
              Welcome back, {user?.name || "Admin"}! 
            </h1>
            <span
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                fontSize: "11px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#16a34a",
                  animation: "pulse 2s infinite",
                }}
              />
              Live Monitoring
            </span>
          </div>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "12.5px" }}>
            Here is your cafe's real-time financial performance, orders overview, and inventory ranking.
          </p>
        </div>

        {/* Timeframe selector & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          >
            {[
              { id: "daily", label: "Today" },
              { id: "weekly", label: "7 Days" },
              { id: "monthly", label: "30 Days" },
              { id: "yearly", label: "12 Months" },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "7px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: timeframe === tf.id ? "#ffffff" : "transparent",
                  color: timeframe === tf.id ? "#4f7d16" : "#6b7280",
                  boxShadow: timeframe === tf.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh analytics data"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC KPI CARDS GRID (7 CARDS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Total Revenue */}
        <article
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>Total Revenue</span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#f0fdf4",
                color: "#16a34a",
                display: "grid",
                placeItems: "center",
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
              ₹{formatRupee(kpis.totalRevenue)}
            </strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#6b7280" }}>
            Avg. ₹{formatRupee(avgOrderValue)} per order
          </div>
        </article>

        {/* Today's Sales */}
        <article
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>Today's Sales</span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Flame size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
              ₹{formatRupee(kpis.todaySales)}
            </strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#2563eb", fontWeight: 700 }}>
            {kpis.todayOrders} order(s) placed today
          </div>
        </article>

        {/* Total Orders */}
        <article
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>Total Orders</span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#faf5ff",
                color: "#9333ea",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
              {kpis.totalOrders}
            </strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#6b7280" }}>
            Delivered: {kpis.deliveredOrders} | Cancelled: {kpis.cancelledOrders}
          </div>
        </article>

        {/* Pending Kitchen Orders */}
        <article
          onClick={() => navigate("/orders")}
          style={{
            background: kpis.pendingOrders > 0 ? "#fffbeb" : "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: kpis.pendingOrders > 0 ? "1px solid #fde68a" : "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: kpis.pendingOrders > 0 ? "#92400e" : "#6b7280",
              }}
            >
              Pending / Kitchen
            </span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#fef3c7",
                color: "#d97706",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: kpis.pendingOrders > 0 ? "#b45309" : "#111827",
              }}
            >
              {kpis.pendingOrders}
            </strong>
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "11.5px",
              color: "#d97706",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            Manage live queue <ChevronRight size={13} />
          </div>
        </article>

        {/* Total Customers */}
        <article
          onClick={() => navigate("/customers")}
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>Customers</span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#f0fdfa",
                color: "#0d9488",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
              {kpis.totalCustomers}
            </strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#0d9488", fontWeight: 700 }}>
            Registered accounts
          </div>
        </article>

        {/* Total Active Menu Products */}
        <article
          onClick={() => navigate("/products")}
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>Menu Dishes</span>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#fdf2f8",
                color: "#db2777",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Package size={18} />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <strong style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
              {kpis.totalProducts}
            </strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#db2777", fontWeight: 700 }}>
            Active on catalog
          </div>
        </article>
      </div>

      {/* 3. INTERACTIVE CHARTS SECTION (2 COLUMNS) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* REVENUE & ORDERS TRENDS GRAPH */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                Revenue & Orders Trends
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#6b7280" }}>
                Interactive performance metrics across {timeframe} interval
              </p>
            </div>

            {/* Metric Switcher */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setActiveChartMetric("revenue")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: activeChartMetric === "revenue" ? "#4f7d16" : "#e5e7eb",
                  background: activeChartMetric === "revenue" ? "#f4f8ec" : "#ffffff",
                  color: activeChartMetric === "revenue" ? "#4f7d16" : "#6b7280",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric("orders")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: activeChartMetric === "orders" ? "#2563eb" : "#e5e7eb",
                  background: activeChartMetric === "orders" ? "#eff6ff" : "#ffffff",
                  color: activeChartMetric === "orders" ? "#2563eb" : "#6b7280",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Orders Count
              </button>
            </div>
          </div>

          {/* SVG Interactive Chart Canvas */}
          <div style={{ position: "relative", width: "100%", height: "230px" }}>
            <svg
              viewBox="0 0 600 230"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f7d16" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4f7d16" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="50" x2="560" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="100" x2="560" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="150" x2="560" y2="150" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="200" x2="560" y2="200" stroke="#e5e7eb" strokeWidth="1.5" />

              {/* Area & Line */}
              {activeChartMetric === "revenue" ? (
                <>
                  <path d={svgAreaRevenue} fill="url(#revenueGrad)" />
                  <path
                    d={svgPathRevenue}
                    fill="none"
                    stroke="#4f7d16"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path d={svgAreaOrders} fill="url(#ordersGrad)" />
                  <path
                    d={svgPathOrders}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Interactive Points */}
              {chartPoints.map((pt, i) => {
                const cy = activeChartMetric === "revenue" ? pt.yRevenue : pt.yOrders;
                const isHovered = hoveredPoint?.label === pt.label;
                const color = activeChartMetric === "revenue" ? "#4f7d16" : "#2563eb";

                return (
                  <g key={i}>
                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* X-axis Label */}
                    <text
                      x={pt.x}
                      y="222"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#9ca3af"
                      fontWeight="600"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoveredPoint.x / 600) * 100}%`,
                  top: "10px",
                  transform: "translateX(-50%)",
                  background: "#111827",
                  color: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                  pointerEvents: "none",
                  zIndex: 20,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ fontWeight: 800 }}>{hoveredPoint.label}</div>
                <div style={{ color: "#4ade80", marginTop: "2px" }}>
                  Revenue: ₹{formatRupee(hoveredPoint.revenue)}
                </div>
                <div style={{ color: "#93c5fd" }}>Orders: {hoveredPoint.orders}</div>
              </div>
            )}
          </div>
        </div>

        {/* ORDER STATUS DISTRIBUTION */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
              Order Fulfillment
            </h2>
            <p style={{ margin: "2px 0 16px", fontSize: "11.5px", color: "#6b7280" }}>
              Status distribution across all {kpis.totalOrders} cafe orders
            </p>

            {/* Progress breakdown bar */}
            <div
              style={{
                height: "12px",
                width: "100%",
                borderRadius: "9999px",
                overflow: "hidden",
                display: "flex",
                background: "#f3f4f6",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: `${deliveredPercent}%`,
                  background: "#16a34a",
                  transition: "width 0.5s ease",
                }}
                title={`Delivered: ${deliveredPercent}%`}
              />
              <div
                style={{
                  width: `${pendingPercent}%`,
                  background: "#f59e0b",
                  transition: "width 0.5s ease",
                }}
                title={`Pending: ${pendingPercent}%`}
              />
              <div
                style={{
                  width: `${cancelledPercent}%`,
                  background: "#ef4444",
                  transition: "width 0.5s ease",
                }}
                title={`Cancelled: ${cancelledPercent}%`}
              />
            </div>

            {/* Metrics List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "#374151" }}>Delivered Successfully</span>
                </div>
                <strong style={{ color: "#111827" }}>
                  {statusDistribution.delivered || 0} ({deliveredPercent}%)
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "#374151" }}>In Kitchen / Out</span>
                </div>
                <strong style={{ color: "#111827" }}>
                  {(statusDistribution.preparing || 0) +
                    (statusDistribution.out_for_delivery || 0)}{" "}
                  ({pendingPercent}%)
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "#374151" }}>Cancelled</span>
                </div>
                <strong style={{ color: "#111827" }}>
                  {statusDistribution.cancelled || 0} ({cancelledPercent}%)
                </strong>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "12px",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11.5px",
              color: "#64748b",
            }}
          >
            <Sparkles size={16} color="#4f7d16" />
            <span>
              <strong>{deliveredPercent}%</strong> overall delivery completion rate
            </span>
          </div>
        </div>
      </div>

      {/* 4. TOP SELLING PRODUCTS & CATEGORY SALES SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
        {/* TOP SELLING PRODUCTS */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                Top Selling Dishes
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#6b7280" }}>
                Highest volume dishes ranked by total customer orders
              </p>
            </div>
            <Link
              to="/products"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#4f7d16",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              All products <ArrowRight size={13} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>
              No product sales data yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topProducts.map((p) => (
                <div
                  key={p.id || p.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  {/* Rank Badge */}
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: p.rank === 1 ? "#fef3c7" : "#f3f4f6",
                      color: p.rank === 1 ? "#b45309" : "#4b5563",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    #{p.rank}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      background: "#e5e7eb",
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "13px",
                        color: "#1f2937",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      {p.category} • ₹{formatRupee(p.price)}
                    </div>
                  </div>

                  {/* Sales Metrics */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "13px", color: "#111827" }}>
                      {p.totalSold} sold
                    </div>
                    <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>
                      ₹{formatRupee(p.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY SALES DISTRIBUTION */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                Category Contribution
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#6b7280" }}>
                Sales share across cafe categories
              </p>
            </div>
            <Link
              to="/categories"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#4f7d16",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              Categories <ArrowRight size={13} />
            </Link>
          </div>

          {categorySales.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>
              No category sales data yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {categorySales.map((cat, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#1f2937" }}>{cat.name}</span>
                    <span style={{ fontWeight: 800, color: "#4f7d16" }}>
                      ₹{formatRupee(cat.revenue)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      borderRadius: "9999px",
                      background: "#f3f4f6",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: "100%",
                        background:
                          i === 0
                            ? "#4f7d16"
                            : i === 1
                            ? "#2563eb"
                            : i === 2
                            ? "#f59e0b"
                            : "#9333ea",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. RECENT ORDERS & LIVE CUSTOMER ACTIVITY */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        {/* RECENT ORDERS TABLE */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                Recent Cafe Orders
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#6b7280" }}>
                Latest transactions placed by customers
              </p>
            </div>
            <Link
              to="/orders"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#4f7d16",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              View all orders <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#6b7280" }}>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Order #</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "8px 10px", fontWeight: 700 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                      No orders placed yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => navigate("/orders")}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fbfdf8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px", fontWeight: 800, color: "#1f2937" }}>
                        {ord.orderNumber}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: 600, color: "#374151" }}>{ord.customerName}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>{ord.customerEmail}</div>
                      </td>
                      <td style={{ padding: "10px", fontWeight: 800, color: "#111827" }}>
                        ₹{formatRupee(ord.totalAmount)}
                      </td>
                      <td style={{ padding: "10px" }}>{getStatusBadge(ord.status)}</td>
                      <td style={{ padding: "10px", color: "#6b7280", fontSize: "11px" }}>
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LIVE CUSTOMER ACTIVITY FEED */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                Customer Activity Feed
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#6b7280" }}>
                Real-time events and customer engagements
              </p>
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>
              No recent activity
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentActivities.map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background:
                        act.type === "order"
                          ? "#f0fdf4"
                          : act.type === "review"
                          ? "#fef3c7"
                          : "#eff6ff",
                      color:
                        act.type === "order"
                          ? "#16a34a"
                          : act.type === "review"
                          ? "#d97706"
                          : "#2563eb",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {act.type === "order" ? (
                      <ShoppingBag size={14} />
                    ) : act.type === "review" ? (
                      <Star size={14} />
                    ) : (
                      <MessageSquare size={14} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "12px", color: "#1f2937" }}>
                      {act.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "1px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {act.description}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px" }}>
                      {new Date(act.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
