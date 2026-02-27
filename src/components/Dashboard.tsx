import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  CreditCard,
  Plane,
  Users,
  Wallet,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency } from "../lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDipa: 0,
    totalPnbp: 0,
    countPerjadin: 0,
    countRapat: 0,
    kkpUsage: 0
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", { signal: controller.signal });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setStats(data);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch stats:", error);
        }
      }
    };

    fetchStats();

    return () => {
      controller.abort();
    };
  }, []);

  const publicLink = `${window.location.origin}/?mode=public`;

  const [copied, setCopied] = useState(false);
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  }, [publicLink]);

  const chartData = [
    { name: "DIPA", value: stats.totalDipa },
    { name: "PNBP", value: stats.totalPnbp },
  ];

  const COLORS = ["#4f46e5", "#10b981"];

  const summaryCards = [
    { label: "Total SPJ DIPA", value: formatCurrency(stats.totalDipa), icon: Wallet, color: "bg-indigo-500", trend: "+12%" },
    { label: "Total SPJ PNBP", value: formatCurrency(stats.totalPnbp), icon: TrendingUp, color: "bg-emerald-500", trend: "+5%" },
    { label: "Perjalanan Dinas", value: stats.countPerjadin, icon: Plane, color: "bg-amber-500", trend: "Aktif" },
    { label: "Penggunaan KKP", value: formatCurrency(stats.kkpUsage), icon: CreditCard, color: "bg-rose-500", trend: "Real-time" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 p-1">
            <img
              src="/logo_kemnaker.png"
              alt="Logo Kemnaker"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan</h2>
            <p className="text-slate-500 text-sm">Kementerian Ketenagakerjaan RI - Balai K3 Samarinda</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Link Input Publik</p>
            <p className="text-sm font-mono text-slate-600 truncate max-w-[200px]">{publicLink}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all relative group/copy flex items-center gap-2"
            title="Salin Link"
          >
            {copied ? (
              <span className="text-xs font-bold px-1 text-emerald-600">Disalin!</span>
            ) : (
              <ExternalLink className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={card.color + " p-3 rounded-xl text-white shadow-lg shadow-slate-200"}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                {card.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Perbandingan Realisasi Anggaran
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Komposisi Sumber Anggaran
          </h3>
          <div className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">100%</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart3(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
