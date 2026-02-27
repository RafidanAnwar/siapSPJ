import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText as FilePdf,
  ExternalLink,
  ChevronRight,
  Calendar,
  MapPin,
  Tag
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SPJList() {
  const [spjData, setSpjData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSumber, setFilterSumber] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch("/api/spj", { signal: controller.signal });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setSpjData(data);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch SPJ data:", error);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredData = useMemo(() => {
    return spjData.filter(item => {
      const matchesSearch = item.no_spj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tujuan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_spt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSumber = filterSumber === "Semua" || item.sumber_anggaran === filterSumber;
      const matchesJenis = filterJenis === "Semua" || item.jenis_kegiatan === filterJenis;
      return matchesSearch && matchesSumber && matchesJenis;
    });
  }, [spjData, searchTerm, filterSumber, filterJenis]);

  const exportToExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data SPJ");
    XLSX.writeFile(wb, `Rekap_SPJ_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredData]);

  const exportToPdf = useCallback(() => {
    const doc = new jsPDF();
    doc.text("Rekapitulasi Pertanggungjawaban SIAP-SPJ", 14, 15);

    const tableData = filteredData.map(item => [
      item.no_spj,
      item.sumber_anggaran,
      item.jenis_kegiatan,
      item.tujuan,
      formatCurrency(item.total_biaya)
    ]);

    (doc as any).autoTable({
      head: [['No SPJ', 'Sumber', 'Jenis', 'Tujuan', 'Total']],
      body: tableData,
      startY: 25,
    });

    doc.save(`Laporan_SPJ_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Data Pertanggungjawaban</h2>
          <p className="text-slate-500">Kelola dan pantau seluruh berkas SPJ yang telah diinput.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold hover:bg-emerald-100 transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" /> Excel
          </button>
          <button
            onClick={exportToPdf}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 transition-all"
          >
            <FilePdf className="w-5 h-5" /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari No SPJ, Tujuan, atau No SPT..."
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            value={filterSumber}
            onChange={(e) => setFilterSumber(e.target.value)}
          >
            <option value="Semua">Semua Sumber</option>
            <option value="SPJ DIPA">SPJ DIPA</option>
            <option value="SPJ PNBP">SPJ PNBP</option>
          </select>
          <select
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="Semua">Semua Jenis</option>
            <option value="Perjalanan Dinas">Perjalanan Dinas</option>
            <option value="Pengujian">Pengujian</option>
            <option value="Rapat">Rapat</option>
            <option value="Diklat">Diklat</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-widest px-4">Informasi SPJ</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-widest px-4">Kegiatan</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-widest px-4">Tujuan & Waktu</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-widest px-4 text-right">Total Biaya</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-widest px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.no_spj}</span>
                      <span className="text-xs text-slate-500">SPT: {item.no_spt}</span>
                      <div className="flex gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          item.sumber_anggaran === "SPJ DIPA" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.sumber_anggaran}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{item.jenis_kegiatan}</span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-1">Metode: {item.metode_pembayaran}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {item.tujuan}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      {item.tanggal_berangkat} - {item.tanggal_pulang}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-slate-900">{formatCurrency(item.total_biaya)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-indigo-600">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search className="w-12 h-12 opacity-20" />
                      <p className="font-medium">Tidak ada data yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
