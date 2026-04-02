"use client";
/**
 * Main Dashboard – KPI cards + overview charts for all three segments.
 */
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, ShoppingBag, RotateCcw, MousePointerClick, Eye, ShoppingCart, ThumbsUp, ThumbsDown } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { dashboardApi, salesApi, engagementApi, commentsApi } from "@/lib/api";

const COLORS = ["#4f6ef7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Type definitions for API responses
interface SalesTrendItem {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

interface SentimentItem {
  sentiment: string;
  count: number;
  percentage: number;
}

interface EngagementTrendItem {
  date: string;
  views: number;
  clicks: number;
  engagement_rate: string | number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentItem[]>([]);
  const [engagementTrend, setEngagementTrend] = useState<EngagementTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      salesApi.trends(30),
      commentsApi.sentimentSummary(),
      engagementApi.trends(14),
    ]).then(([s, st, sent, et]) => {
      setSummary(s.data || {});
      setSalesTrend(Array.isArray(st.data) ? st.data.slice(-14) : []);
      setSentiment(Array.isArray(sent.data) ? sent.data : []);
      setEngagementTrend(Array.isArray(et.data) ? et.data.slice(-14) : []);
      setLoading(false);
    }).catch((err) => {
      console.error("Dashboard data fetch error:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance across all marketplaces"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Revenue"
          value={`$${summary.total_revenue?.toLocaleString()}`}
          icon={DollarSign}
          iconColor="bg-brand-500"
          trend={{ value: 12.4, label: "vs last month" }}
        />
        <KpiCard
          title="Total Orders"
          value={summary.total_orders}
          icon={ShoppingBag}
          iconColor="bg-emerald-500"
          trend={{ value: 8.1, label: "vs last month" }}
        />
        <KpiCard
          title="Returns"
          value={summary.total_returns}
          icon={RotateCcw}
          iconColor="bg-amber-500"
        />
        <KpiCard
          title="Avg CTR"
          value={`${summary.avg_ctr}%`}
          icon={MousePointerClick}
          iconColor="bg-purple-500"
          trend={{ value: 2.3, label: "vs last month" }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Page Visits"
          value={summary.total_page_visits?.toLocaleString()}
          icon={Eye}
          iconColor="bg-cyan-500"
        />
        <KpiCard
          title="Cart Adds"
          value={summary.total_cart_adds?.toLocaleString()}
          icon={ShoppingCart}
          iconColor="bg-indigo-500"
        />
        <KpiCard
          title="Positive Reviews"
          value={summary.positive_comments}
          icon={ThumbsUp}
          iconColor="bg-emerald-500"
        />
        <KpiCard
          title="Negative Reviews"
          value={summary.negative_comments}
          icon={ThumbsDown}
          iconColor="bg-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Revenue – Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#4f6ef7" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Pie */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Sentiment Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentiment}
                dataKey="count"
                nameKey="sentiment"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sentiment.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.sentiment === "positive"
                        ? "#10b981"
                        : entry.sentiment === "negative"
                        ? "#ef4444"
                        : "#f59e0b"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Trend */}
      <div className="card mt-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Engagement – Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="visits" name="Page Visits" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cart_adds" name="Cart Adds" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
