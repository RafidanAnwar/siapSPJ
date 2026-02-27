import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("spj_modern.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS spj (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    no_spj TEXT UNIQUE,
    no_spt TEXT NOT NULL,
    no_sppd TEXT,
    no_spm TEXT,
    no_drpp TEXT,
    kode_mak TEXT,
    sumber_anggaran TEXT NOT NULL,
    jenis_kegiatan TEXT NOT NULL,
    metode_pembayaran TEXT NOT NULL,
    metode_bayar_transport TEXT,
    metode_bayar_hotel TEXT,
    tanggal_spt TEXT,
    tanggal_sppd TEXT,
    tanggal_berangkat TEXT NOT NULL,
    tanggal_pulang TEXT NOT NULL,
    lama_perjalanan INTEGER,
    tujuan TEXT,
    provinsi_tujuan TEXT,
    unit_organisasi TEXT,
    representasi REAL DEFAULT 0,
    bbm REAL DEFAULT 0,
    tol REAL DEFAULT 0,
    total_biaya REAL DEFAULT 0,
    file_spt TEXT,
    file_rincian TEXT,
    file_sppd TEXT,
    file_sptjm TEXT,
    file_kwitansi TEXT,
    file_laporan_perjadin TEXT,
    file_surat_penawaran TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transport_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spj_id INTEGER,
    jenis TEXT, -- 'Roda 4', 'Kereta', 'Pesawat'
    nomor_tiket TEXT,
    maskapai TEXT,
    tarif REAL DEFAULT 0,
    FOREIGN KEY(spj_id) REFERENCES spj(id)
  );

  CREATE TABLE IF NOT EXISTS penginapan_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spj_id INTEGER,
    nama_hotel TEXT,
    jumlah_hari INTEGER,
    tarif REAL DEFAULT 0,
    is_30_percent INTEGER DEFAULT 0, -- 0 for false, 1 for true
    FOREIGN KEY(spj_id) REFERENCES spj(id)
  );

  CREATE TABLE IF NOT EXISTS tim_kegiatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spj_id INTEGER,
    nama TEXT,
    jabatan TEXT,
    golongan TEXT,
    unit_kerja TEXT,
    FOREIGN KEY(spj_id) REFERENCES spj(id)
  );

  CREATE TABLE IF NOT EXISTS perusahaan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spj_id INTEGER,
    nama_perusahaan TEXT,
    FOREIGN KEY(spj_id) REFERENCES spj(id)
  );

  CREATE TABLE IF NOT EXISTS log_aktivitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    aktivitas TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  // Pre-compiled statements for optimal performance
  const selectAllSpjStmt = db.prepare("SELECT * FROM spj ORDER BY created_at DESC");
  const insertSpjStmt = db.prepare(`
    INSERT INTO spj (
      no_spj, no_spt, no_sppd, no_spm, no_drpp, kode_mak,
      sumber_anggaran, jenis_kegiatan, metode_pembayaran,
      metode_bayar_transport, metode_bayar_hotel,
      tanggal_berangkat, tanggal_pulang, lama_perjalanan,
      tujuan, provinsi_tujuan, unit_organisasi, representasi, bbm, tol, total_biaya,
      file_spt, file_rincian, file_sppd, file_sptjm, 
      file_kwitansi, file_laporan_perjadin, file_surat_penawaran
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTransportStmt = db.prepare("INSERT INTO transport_detail (spj_id, jenis, nomor_tiket, maskapai, tarif) VALUES (?, ?, ?, ?, ?)");
  const insertPenginapanStmt = db.prepare("INSERT INTO penginapan_detail (spj_id, nama_hotel, jumlah_hari, tarif, is_30_percent) VALUES (?, ?, ?, ?, ?)");
  const insertTimStmt = db.prepare("INSERT INTO tim_kegiatan (spj_id, nama, jabatan, golongan, unit_kerja) VALUES (?, ?, ?, ?, ?)");
  const insertPerusahaanStmt = db.prepare("INSERT INTO perusahaan (spj_id, nama_perusahaan) VALUES (?, ?)");
  const insertLogStmt = db.prepare("INSERT INTO log_aktivitas (user, aktivitas) VALUES (?, ?)");

  const statTotalDipaStmt = db.prepare("SELECT SUM(total_biaya) as total FROM spj WHERE sumber_anggaran = 'SPJ DIPA'");
  const statTotalPnbpStmt = db.prepare("SELECT SUM(total_biaya) as total FROM spj WHERE sumber_anggaran = 'SPJ PNBP'");
  const statCountPerjadinStmt = db.prepare("SELECT COUNT(*) as count FROM spj WHERE jenis_kegiatan = 'Perjalanan Dinas'");
  const statCountRapatStmt = db.prepare("SELECT COUNT(*) as count FROM spj WHERE jenis_kegiatan = 'Rapat'");
  const statKkpUsageStmt = db.prepare("SELECT SUM(total_biaya) as total FROM spj WHERE metode_pembayaran = 'KKP'");

  // API Routes
  app.get("/api/spj", (req, res) => {
    try {
      const rows = selectAllSpjStmt.all();
      res.json(rows);
    } catch (error) {
      console.error("GET /api/spj Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data SPJ" });
    }
  });

  app.post("/api/spj", (req, res) => {
    const {
      basicInfo,
      tim,
      perusahaan: perusahaanList,
      transportDetails,
      penginapanDetails,
      dokumen,
      total_biaya
    } = req.body;

    const insertSpj = db.prepare(`
      INSERT INTO spj (
        no_spj, no_spt, no_sppd, no_spm, no_drpp, kode_mak,
        sumber_anggaran, jenis_kegiatan, metode_pembayaran,
        metode_bayar_transport, metode_bayar_hotel,
        tanggal_berangkat, tanggal_pulang, lama_perjalanan,
        tujuan, provinsi_tujuan, unit_organisasi, representasi, bbm, tol, total_biaya,
        file_spt, file_rincian, file_sppd, file_sptjm, 
        file_kwitansi, file_laporan_perjadin, file_surat_penawaran
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = insertSpjStmt.run(
      `SPJ/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`,
      basicInfo.no_spt,
      basicInfo.no_sppd || null,
      basicInfo.no_spm || null,
      basicInfo.no_drpp || null,
      basicInfo.kode_mak || null,
      basicInfo.sumber_anggaran,
      basicInfo.jenis_kegiatan,
      basicInfo.metode_pembayaran,
      basicInfo.metode_bayar_transport || null,
      basicInfo.metode_bayar_hotel || null,
      basicInfo.tanggal_berangkat,
      basicInfo.tanggal_pulang,
      basicInfo.lama_perjalanan,
      basicInfo.tujuan,
      basicInfo.provinsi_tujuan || null,
      basicInfo.unit_organisasi || null,
      basicInfo.representasi || 0,
      req.body.komponen.bbm || 0,
      req.body.komponen.tol || 0,
      total_biaya,
      dokumen.file_spt || null,
      dokumen.file_rincian || null,
      dokumen.file_sppd || null,
      dokumen.file_sptjm || null,
      dokumen.file_kwitansi || null,
      dokumen.file_laporan_perjadin || null,
      dokumen.file_surat_penawaran || null
    );

    const spjId = info.lastInsertRowid;

    if (transportDetails && transportDetails.length > 0) {
      transportDetails.forEach((t: any) => insertTransportStmt.run(spjId, t.jenis, t.nomor_tiket, t.maskapai, t.tarif));
    }

    if (penginapanDetails && penginapanDetails.length > 0) {
      penginapanDetails.forEach((p: any) => insertPenginapanStmt.run(spjId, p.nama_hotel, p.jumlah_hari, p.tarif, p.is_30_percent ? 1 : 0));
    }

    if (tim && tim.length > 0) {
      tim.forEach((m: any) => insertTimStmt.run(spjId, m.nama, m.jabatan, m.golongan, m.unit_kerja));
    }

    if (perusahaanList && perusahaanList.length > 0) {
      perusahaanList.forEach((p: any) => insertPerusahaanStmt.run(spjId, p.nama_perusahaan));
    }

    insertLogStmt.run('System', `Created SPJ ID: ${spjId}`);

    res.json({ success: true, id: spjId });
  });

  app.get("/api/stats", (req, res) => {
    try {
      const stats = {
        totalDipa: statTotalDipaStmt.get().total || 0,
        totalPnbp: statTotalPnbpStmt.get().total || 0,
        countPerjadin: statCountPerjadinStmt.get().count || 0,
        countRapat: statCountRapatStmt.get().count || 0,
        kkpUsage: statKkpUsageStmt.get().total || 0,
      };
      // Send cache-control headers since this data updates relatively slowly for summary charts
      res.set('Cache-Control', 'public, max-age=10'); // Cache for 10 seconds locally
      res.json(stats);
    } catch (error) {
      console.error("GET /api/stats Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat analitik dashboard" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIAP-SPJ Server running on http://localhost:${PORT}`);
  });
}

startServer();
