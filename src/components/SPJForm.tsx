import React, { useState, useEffect, useMemo, useCallback } from "react";
import FileUpload from "./ui/FileUpload";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Users,
  Building2,
  CreditCard,
  Info,
  Plane
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, formatCurrency } from "../lib/utils";

const spjSchema = z.object({
  basicInfo: z.object({
    no_spt: z.string().min(1, "Nomor SPT wajib diisi"),
    no_sppd: z.string().optional(),
    no_spm: z.string().optional(),
    no_drpp: z.string().optional(),
    kode_mak: z.string().optional(),
    sumber_anggaran: z.enum(["SPJ DIPA", "SPJ PNBP"]),
    jenis_kegiatan: z.string().min(1, "Jenis kegiatan wajib dipilih"),
    metode_pembayaran: z.enum(["Tunai", "Transfer", "KKP"]),
    metode_bayar_transport: z.enum(["Tunai", "Transfer", "KKP"]).optional(),
    metode_bayar_hotel: z.enum(["Tunai", "Transfer", "KKP"]).optional(),
    tanggal_berangkat: z.string().min(1, "Tanggal berangkat wajib diisi"),
    tanggal_pulang: z.string().min(1, "Tanggal pulang wajib diisi"),
    lama_perjalanan: z.number().min(1),
    tujuan: z.string().min(1, "Tujuan wajib diisi"),
    provinsi_tujuan: z.string().optional(),
    unit_organisasi: z.string().optional(),
    representasi: z.number().optional(),
  }),
  tim: z.array(z.object({
    nama: z.string().min(1, "Nama wajib diisi"),
    jabatan: z.string().optional(),
    golongan: z.string().optional(),
    unit_kerja: z.string().optional(),
  })).max(6),
  perusahaan: z.array(z.object({
    nama_perusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  })).max(10),
  transportDetails: z.array(z.object({
    jenis: z.string(),
    nomor_tiket: z.string().optional(),
    maskapai: z.string().optional(),
    tarif: z.number(),
  })),
  penginapanDetails: z.array(z.object({
    nama_hotel: z.string(),
    jumlah_hari: z.number(),
    tarif: z.number(),
    is_30_percent: z.boolean(),
  })),
  komponen: z.object({
    uang_harian: z.number(),
    penginapan: z.number(),
    transport_pp: z.number(),
    transport_lokal: z.number(),
    biaya_pendaftaran: z.number(),
    konsumsi: z.number(),
    honorarium: z.number(),
    bbm: z.number(),
    tol: z.number(),
  }),
  dokumen: z.object({
    file_spt: z.string().optional(),
    file_rincian: z.string().optional(),
    file_sppd: z.string().optional(),
    file_sptjm: z.string().optional(),
    file_kwitansi: z.string().optional(),
    file_laporan_perjadin: z.string().optional(),
    file_surat_penawaran: z.string().optional(),
  })
});

type SpjFormValues = z.infer<typeof spjSchema>;

export default function SPJForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<SpjFormValues>({
    resolver: zodResolver(spjSchema),
    defaultValues: {
      basicInfo: {
        sumber_anggaran: "SPJ DIPA",
        jenis_kegiatan: "Perjalanan Dinas",
        metode_pembayaran: "Transfer",
        lama_perjalanan: 1,
        no_spt: "",
        tujuan: "",
        tanggal_berangkat: "",
        tanggal_pulang: "",
        provinsi_tujuan: "",
        unit_organisasi: "Balai K3 Samarinda",
        representasi: 0,
      },
      tim: [{ nama: "", jabatan: "", golongan: "", unit_kerja: "" }],
      perusahaan: [],
      transportDetails: [],
      penginapanDetails: [],
      komponen: {
        uang_harian: 0,
        penginapan: 0,
        transport_pp: 0,
        transport_lokal: 0,
        biaya_pendaftaran: 0,
        konsumsi: 0,
        honorarium: 0,
        bbm: 0,
        tol: 0,
      },
      dokumen: {
        file_spt: "",
        file_rincian: "",
        file_sppd: "",
        file_sptjm: "",
        file_kwitansi: "",
        file_laporan_perjadin: "",
        file_surat_penawaran: "",
      }
    }
  });

  const { fields: timFields, append: appendTim, remove: removeTim } = useFieldArray({
    control,
    name: "tim"
  });

  const { fields: perusahaanFields, append: appendPerusahaan, remove: removePerusahaan } = useFieldArray({
    control,
    name: "perusahaan"
  });

  const [dokumenFiles, setDokumenFiles] = useState<Record<string, File | null>>({
    file_spt: null,
    file_rincian: null,
    file_sppd: null,
    file_sptjm: null,
    file_kwitansi: null,
    file_laporan_perjadin: null,
    file_surat_penawaran: null,
  });

  const { fields: transportFields, append: appendTransport, remove: removeTransport } = useFieldArray({
    control,
    name: "transportDetails"
  });

  const { fields: penginapanFields, append: appendPenginapan, remove: removePenginapan } = useFieldArray({
    control,
    name: "penginapanDetails"
  });

  const watchSumberAnggaran = watch("basicInfo.sumber_anggaran");
  const watchJenisKegiatan = watch("basicInfo.jenis_kegiatan");
  const watchMetodeBayar = watch("basicInfo.metode_pembayaran");
  const watchKomponen = watch("komponen");
  const watchDokumen = watch("dokumen");
  const watchTransport = watch("transportDetails");
  const watchPenginapan = watch("penginapanDetails");
  const watchRepresentasi = watch("basicInfo.representasi") || 0;

  const totalTransport = useMemo(() => (watchTransport || []).reduce((acc, curr) => acc + (Number(curr.tarif) || 0), 0), [watchTransport]);
  const totalPenginapan = useMemo(() => (watchPenginapan || []).reduce((acc, curr) => acc + (Number(curr.tarif) || 0), 0), [watchPenginapan]);
  const totalKomponen = useMemo(() => Object.values(watchKomponen).reduce((acc, curr) => acc + (Number(curr) || 0), 0), [watchKomponen]);

  const totalBiaya = useMemo(() => totalTransport + totalPenginapan + totalKomponen + Number(watchRepresentasi), [totalTransport, totalPenginapan, totalKomponen, watchRepresentasi]);

  const onSubmit = useCallback(async (data: SpjFormValues) => {
    setIsSubmitting(true);
    try {
      // Create an object to send that mimics the old structure, 
      // where we map the 'File' name as the link value just for backward compatibility with API.
      // In a real scenario with Storage, we'd use FormData here.
      const simulatedDokumenLinks = Object.keys(dokumenFiles).reduce((acc, key) => {
        if (dokumenFiles[key]) {
          acc[key] = dokumenFiles[key]?.name;
        }
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        ...data,
        total_biaya: totalBiaya,
        dokumen: simulatedDokumenLinks
      };

      const response = await fetch("/api/spj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(`Gagal menyimpan data: ${errorData.message || 'Terjadi kesalahan pada server'}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  }, [totalBiaya, onSuccess]);

  const docChecklist = [
    { id: "file_spt", label: "SPT (Surat Perintah Tugas)", required: true },
    { id: "file_rincian", label: "Rincian Pembayaran", required: true },
    { id: "file_sppd", label: "SPPD", required: true },
    { id: "file_sptjm", label: "SPTJM", required: watchSumberAnggaran === "SPJ PNBP" },
    { id: "file_kwitansi", label: "Kwitansi Transport & Hotel", required: watchMetodeBayar !== "KKP" },
    { id: "file_laporan_perjadin", label: "Laporan Perjadin", required: true },
    { id: "file_surat_penawaran", label: "Surat Penawaran", required: false },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Input SPJ Baru</h2>
          <p className="text-slate-500">Lengkapi formulir pertanggungjawaban di bawah ini.</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Estimasi SPJ</p>
          <p className="text-2xl font-black text-indigo-700">{formatCurrency(totalBiaya)}</p>
        </div>
      </div>

      {/* 1. Informasi Dasar */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Informasi Dasar SPJ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Sumber Anggaran</label>
            <select
              {...register("basicInfo.sumber_anggaran")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SPJ DIPA">SPJ DIPA</option>
              <option value="SPJ PNBP">SPJ PNBP</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Kegiatan</label>
            <select
              {...register("basicInfo.jenis_kegiatan")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Perjalanan Dinas">Perjalanan Dinas</option>
              <option value="Pengujian">Pengujian</option>
              <option value="Pelatihan">Pelatihan</option>
              <option value="Diklat">Diklat</option>
              <option value="Rapat">Rapat</option>
              <option value="Kegiatan Dalam Kantor">Kegiatan Dalam Kantor</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Metode Bayar Umum</label>
            <select
              {...register("basicInfo.metode_pembayaran")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="KKP">KKP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Metode Bayar Transport</label>
            <select
              {...register("basicInfo.metode_bayar_transport")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="KKP">KKP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Metode Bayar Hotel</label>
            <select
              {...register("basicInfo.metode_bayar_hotel")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="KKP">KKP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Unit Organisasi</label>
            <input type="text" {...register("basicInfo.unit_organisasi")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Provinsi Tujuan</label>
            <input type="text" {...register("basicInfo.provinsi_tujuan")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Representasi</label>
            <input type="number" {...register("basicInfo.representasi", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tgl Berangkat</label>
            <input type="date" {...register("basicInfo.tanggal_berangkat")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tgl Pulang</label>
            <input type="date" {...register("basicInfo.tanggal_pulang")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Lama (Hari)</label>
            <input type="number" {...register("basicInfo.lama_perjalanan", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tujuan</label>
            <input type="text" {...register("basicInfo.tujuan")} placeholder="Kota/Provinsi" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nomor SPT <span className="text-red-500">*</span></label>
            <input type="text" {...register("basicInfo.no_spt")} placeholder="Wajib diisi" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            {errors.basicInfo?.no_spt && <p className="text-red-500 text-xs mt-1">{errors.basicInfo.no_spt.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nomor SPPD</label>
            <input type="text" {...register("basicInfo.no_sppd")} placeholder="Opsional" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nomor SPM (Opsional)</label>
            <input type="text" {...register("basicInfo.no_spm")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nomor DRPP (Opsional)</label>
            <input type="text" {...register("basicInfo.no_drpp")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kode MAK (Opsional)</label>
            <input type="text" {...register("basicInfo.kode_mak")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>
      </section>

      {/* 2. Data Tim */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Data Tim Pelaksana (Max 6)</h3>
          </div>
          <button
            type="button"
            onClick={() => timFields.length < 6 && appendTim({ nama: "" })}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
        </div>

        <div className="space-y-4">
          {timFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Lengkap</label>
                <input {...register(`tim.${index}.nama`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Jabatan</label>
                <input {...register(`tim.${index}.jabatan`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Gol/Pangkat</label>
                <input {...register(`tim.${index}.golongan`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Unit Kerja</label>
                  <input {...register(`tim.${index}.unit_kerja`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                </div>
                {index > 0 && (
                  <button onClick={() => removeTim(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Rincian Transport & Penginapan */}
      {(watchJenisKegiatan === "Perjalanan Dinas" || watchJenisKegiatan === "Pengujian") && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
          {/* Transport Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rincian Transportasi</h3>
              </div>
              <button
                type="button"
                onClick={() => appendTransport({ jenis: "Pesawat", tarif: 0 })}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" /> Tambah Transport
              </button>
            </div>

            <div className="space-y-4">
              {transportFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Jenis</label>
                    <select {...register(`transportDetails.${index}.jenis`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm">
                      <option value="Roda 4">Roda 4 (Darat)</option>
                      <option value="Kereta">Kereta Api</option>
                      <option value="Pesawat">Tiket Pesawat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Maskapai/Kendaraan</label>
                    <input {...register(`transportDetails.${index}.maskapai`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">No Tiket</label>
                    <input {...register(`transportDetails.${index}.nomor_tiket`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tarif</label>
                      <input type="number" {...register(`transportDetails.${index}.tarif`, { valueAsNumber: true })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <button onClick={() => removeTransport(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Penginapan Details */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rincian Penginapan</h3>
              </div>
              <button
                type="button"
                onClick={() => appendPenginapan({ nama_hotel: "", jumlah_hari: 1, tarif: 0, is_30_percent: false })}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" /> Tambah Penginapan
              </button>
            </div>

            <div className="space-y-4">
              {penginapanFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Hotel</label>
                    <input {...register(`penginapanDetails.${index}.nama_hotel`)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Jumlah Hari</label>
                    <input type="number" {...register(`penginapanDetails.${index}.jumlah_hari`, { valueAsNumber: true })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tarif</label>
                    <input type="number" {...register(`penginapanDetails.${index}.tarif`, { valueAsNumber: true })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 flex items-center gap-2 h-10">
                      <input type="checkbox" {...register(`penginapanDetails.${index}.is_30_percent`)} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                      <label className="text-xs font-bold text-slate-500 uppercase">Opsi 30%</label>
                    </div>
                    <button onClick={() => removePenginapan(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Komponen Biaya */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Rincian Komponen Biaya</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(watchJenisKegiatan === "Perjalanan Dinas" || watchJenisKegiatan === "Pengujian") && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Uang Harian</label>
                <input type="number" {...register("komponen.uang_harian", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Penginapan (Hotel/30%)</label>
                <input type="number" {...register("komponen.penginapan", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Transport PP</label>
                <input type="number" {...register("komponen.transport_pp", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Transport Lokal</label>
                <input type="number" {...register("komponen.transport_lokal", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">BBM</label>
                <input type="number" {...register("komponen.bbm", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tol</label>
                <input type="number" {...register("komponen.tol", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </>
          )}

          {(watchJenisKegiatan === "Pelatihan" || watchJenisKegiatan === "Diklat") && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Biaya Pendaftaran</label>
                <input type="number" {...register("komponen.biaya_pendaftaran", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Konsumsi</label>
                <input type="number" {...register("komponen.konsumsi", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </>
          )}

          {watchJenisKegiatan === "Kegiatan Dalam Kantor" && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Honorarium</label>
                <input type="number" {...register("komponen.honorarium", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Konsumsi</label>
                <input type="number" {...register("komponen.konsumsi", { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. Perusahaan yang Diuji */}
      {(watchJenisKegiatan === "Perjalanan Dinas" || watchJenisKegiatan === "Pengujian") && (
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Data Perusahaan yang Diuji (Max 10)</h3>
            </div>
            <button
              type="button"
              onClick={() => perusahaanFields.length < 10 && appendPerusahaan({ nama_perusahaan: "" })}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" /> Tambah Perusahaan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perusahaanFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  {...register(`perusahaan.${index}.nama_perusahaan`)}
                  placeholder={`Nama Perusahaan ${index + 1}`}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <button onClick={() => removePerusahaan(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Verifikasi & Upload Dokumen */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verifikasi & Upload Dokumen Pendukung</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Checklist Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Status Kelengkapan</h4>
            <div className="space-y-3">
              {docChecklist.map((doc) => {
                const isUploaded = !!dokumenFiles[doc.id];
                if (doc.id === "file_sptjm" && watchSumberAnggaran !== "SPJ PNBP") return null;
                if (doc.id === "file_kwitansi" && watchMetodeBayar === "KKP") return null;

                return (
                  <div key={doc.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    isUploaded ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    <div className="flex items-center gap-3">
                      {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="text-sm font-semibold">{doc.label} {doc.required && <span className="text-red-400">*</span>}</span>
                    </div>
                    {isUploaded && <span className="text-xs font-bold uppercase tracking-tighter">Terlampir</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Input Link/File Dokumen</h4>
            <div className="space-y-4">
              {docChecklist.map((doc) => {
                if (doc.id === "file_sptjm" && watchSumberAnggaran !== "SPJ PNBP") return null;
                if (doc.id === "file_kwitansi" && watchMetodeBayar === "KKP") return null;

                return (
                  <div key={doc.id}>
                    <label className="block text-xs font-bold text-slate-600 mb-1">{doc.label}</label>
                    <div className="relative">
                      <FileUpload
                        label=""
                        accept=".pdf,.jpg,.png,.doc,.docx"
                        onFileChange={(file) => {
                          setDokumenFiles(prev => ({ ...prev, [doc.id]: file }));
                          // Also clear the react-hook-form value if it exists 
                          // or you can set it if you want the form to validate presence
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : <><Save className="w-6 h-6" /> Simpan Pertanggungjawaban</>}
        </button>
      </div>
    </form>
  );
}
