import express from "express";
import { createServer as createViteServer } from "vite";
import { sql } from "@vercel/postgres";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS spj (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS transport_detail (
        id SERIAL PRIMARY KEY,
        spj_id INTEGER,
        jenis TEXT,
        nomor_tiket TEXT,
        maskapai TEXT,
        tarif REAL DEFAULT 0,
        FOREIGN KEY(spj_id) REFERENCES spj(id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS penginapan_detail (
        id SERIAL PRIMARY KEY,
        spj_id INTEGER,
        nama_hotel TEXT,
        jumlah_hari INTEGER,
        tarif REAL DEFAULT 0,
        is_30_percent INTEGER DEFAULT 0,
        FOREIGN KEY(spj_id) REFERENCES spj(id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tim_kegiatan (
        id SERIAL PRIMARY KEY,
        spj_id INTEGER,
        nama TEXT,
        jabatan TEXT,
        golongan TEXT,
        unit_kerja TEXT,
        FOREIGN KEY(spj_id) REFERENCES spj(id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS perusahaan (
        id SERIAL PRIMARY KEY,
        spj_id INTEGER,
        nama_perusahaan TEXT,
        FOREIGN KEY(spj_id) REFERENCES spj(id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS log_aktivitas (
        id SERIAL PRIMARY KEY,
        user_name TEXT,
        aktivitas TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Postgres Database initialized.");
  } catch (err) {
    console.error("Failed to initialize Postgres tables:", err);
  }
}
initDb();

const app = express();
app.use(express.json());

// API Routes
app.get("/api/spj", async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM spj ORDER BY created_at DESC`;
    res.json(rows);
  } catch (error) {
    console.error("GET /api/spj Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data SPJ" });
  }
});

app.post("/api/spj", async (req, res) => {
  const {
    basicInfo,
    tim,
    perusahaan: perusahaanList,
    transportDetails,
    penginapanDetails,
    dokumen,
    total_biaya
  } = req.body;

  try {
    const spjResult = await sql`
      INSERT INTO spj (
        no_spj, no_spt, no_sppd, no_spm, no_drpp, kode_mak,
        sumber_anggaran, jenis_kegiatan, metode_pembayaran,
        metode_bayar_transport, metode_bayar_hotel,
        tanggal_berangkat, tanggal_pulang, lama_perjalanan,
        tujuan, provinsi_tujuan, unit_organisasi, representasi, bbm, tol, total_biaya,
        file_spt, file_rincian, file_sppd, file_sptjm, 
        file_kwitansi, file_laporan_perjadin, file_surat_penawaran
      ) VALUES (
        ${`SPJ/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`},
        ${basicInfo.no_spt},
        ${basicInfo.no_sppd || null},
        ${basicInfo.no_spm || null},
        ${basicInfo.no_drpp || null},
        ${basicInfo.kode_mak || null},
        ${basicInfo.sumber_anggaran},
        ${basicInfo.jenis_kegiatan},
        ${basicInfo.metode_pembayaran},
        ${basicInfo.metode_bayar_transport || null},
        ${basicInfo.metode_bayar_hotel || null},
        ${basicInfo.tanggal_berangkat},
        ${basicInfo.tanggal_pulang},
        ${basicInfo.lama_perjalanan},
        ${basicInfo.tujuan},
        ${basicInfo.provinsi_tujuan || null},
        ${basicInfo.unit_organisasi || null},
        ${basicInfo.representasi || 0},
        ${req.body.komponen?.bbm || 0},
        ${req.body.komponen?.tol || 0},
        ${total_biaya},
        ${dokumen?.file_spt || null},
        ${dokumen?.file_rincian || null},
        ${dokumen?.file_sppd || null},
        ${dokumen?.file_sptjm || null},
        ${dokumen?.file_kwitansi || null},
        ${dokumen?.file_laporan_perjadin || null},
        ${dokumen?.file_surat_penawaran || null}
      ) RETURNING id
    `;

    const spjId = spjResult.rows[0].id;

    if (transportDetails && transportDetails.length > 0) {
      for (const t of transportDetails) {
        await sql`INSERT INTO transport_detail (spj_id, jenis, nomor_tiket, maskapai, tarif) VALUES (${spjId}, ${t.jenis}, ${t.nomor_tiket}, ${t.maskapai}, ${t.tarif})`;
      }
    }

    if (penginapanDetails && penginapanDetails.length > 0) {
      for (const p of penginapanDetails) {
        await sql`INSERT INTO penginapan_detail (spj_id, nama_hotel, jumlah_hari, tarif, is_30_percent) VALUES (${spjId}, ${p.nama_hotel}, ${p.jumlah_hari}, ${p.tarif}, ${p.is_30_percent ? 1 : 0})`;
      }
    }

    if (tim && tim.length > 0) {
      for (const m of tim) {
        await sql`INSERT INTO tim_kegiatan (spj_id, nama, jabatan, golongan, unit_kerja) VALUES (${spjId}, ${m.nama}, ${m.jabatan}, ${m.golongan}, ${m.unit_kerja})`;
      }
    }

    if (perusahaanList && perusahaanList.length > 0) {
      for (const p of perusahaanList) {
        await sql`INSERT INTO perusahaan (spj_id, nama_perusahaan) VALUES (${spjId}, ${p.nama_perusahaan})`;
      }
    }

    await sql`INSERT INTO log_aktivitas (user_name, aktivitas) VALUES ('System', ${`Created SPJ ID: ${spjId}`})`;

    res.json({ success: true, id: spjId });
  } catch (err) {
    console.error("POST /api/spj Error:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan data SPJ" });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [dipa, pnbp, perjadin, rapat, kkp] = await Promise.all([
      sql`SELECT SUM(total_biaya) as total FROM spj WHERE sumber_anggaran = 'SPJ DIPA'`,
      sql`SELECT SUM(total_biaya) as total FROM spj WHERE sumber_anggaran = 'SPJ PNBP'`,
      sql`SELECT COUNT(*) as count FROM spj WHERE jenis_kegiatan = 'Perjalanan Dinas'`,
      sql`SELECT COUNT(*) as count FROM spj WHERE jenis_kegiatan = 'Rapat'`,
      sql`SELECT SUM(total_biaya) as total FROM spj WHERE metode_pembayaran = 'KKP'`
    ]);

    const stats = {
      totalDipa: dipa.rows[0].total || 0,
      totalPnbp: pnbp.rows[0].total || 0,
      countPerjadin: parseInt(perjadin.rows[0].count, 10) || 0,
      countRapat: parseInt(rapat.rows[0].count, 10) || 0,
      kkpUsage: kkp.rows[0].total || 0,
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

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`SIAP-SPJ Server running on http://localhost:${PORT}`);
  });
}

export default app;
