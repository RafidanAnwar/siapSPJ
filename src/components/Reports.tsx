import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  FileSpreadsheet,
  FileText as FilePdf,
  Calendar,
  Filter,
  ArrowRight
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Reports() {
  const [spjData, setSpjData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchReports = async () => {
      try {
        const res = await fetch("/api/spj", { signal: controller.signal });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setSpjData(data);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch reports data:", error);
        }
      }
    };

    fetchReports();

    return () => {
      controller.abort();
    };
  }, []);

  const reportTypes = [
    { title: "Rekap Sumber Anggaran", desc: "Laporan gabungan DIPA vs PNBP", icon: PieChartIcon, color: "bg-indigo-500" },
    { title: "Rekap Jenis Kegiatan", desc: "Laporan per kategori kegiatan", icon: BarChart3, color: "bg-emerald-500" },
    { title: "Rekap Penggunaan KKP", desc: "Khusus transaksi Kartu Kredit Pemerintah", icon: Download, color: "bg-rose-500" },
    { title: "Rekap Perusahaan Diuji", desc: "Daftar perusahaan yang telah diverifikasi", icon: FileSpreadsheet, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pusat Laporan</h2>
        <p className="text-slate-500">Ekspor data pertanggungjawaban untuk keperluan audit dan arsip.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Filter className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Filter Laporan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Selesai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-200 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className={cn(report.color, "p-4 rounded-2xl text-white shadow-lg shadow-slate-200")}>
                <report.icon className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <FilePdf className="w-5 h-5" />
                </button>
                <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">{report.title}</h4>
            <p className="text-slate-500 text-sm mb-6">{report.desc}</p>
            <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
              Buka Detail Laporan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
