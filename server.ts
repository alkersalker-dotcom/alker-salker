import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Interface for persistent store
interface DatabaseSchema {
  alkerData: any[];
  stokData: any[];
  rekapData: any[];
  lastUpdated: string;
  version: number;
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial fallback seeds
const INITIAL_DB: DatabaseSchema = {
  alkerData: [
    {
      id: 'alk-1',
      tanggal: '2026-10-21',
      unit: 'ASSURANCE',
      sto: 'BGR',
      teknisi: 'RONY SETYA PURBOWO',
      alatKerja: 'SPLICER',
      merkType: 'INNO IFS-15H / FUSION SPLICER',
      jumlah: 1,
      posisiAlker: 'Di BON',
      status: 'Layak',
      keterangan: 'Pengecekan berkala, elektroda baru diganti',
      foto: '',
      updatedAt: '21/10/2026 09:15',
    },
    {
      id: 'alk-2',
      tanggal: '2026-10-21',
      unit: 'ASSURANCE',
      sto: 'BGR',
      teknisi: 'IRPAN KURNIAWAN',
      alatKerja: 'OPM',
      merkType: 'JOINWIT JW3208 OPTICAL POWER METER',
      jumlah: 1,
      posisiAlker: 'Di BON',
      status: 'Layak',
      keterangan: 'Kalibrasi akurat -24 dBm',
      foto: '',
      updatedAt: '21/10/2026 09:30',
    },
    {
      id: 'alk-3',
      tanggal: '2026-10-20',
      unit: 'ASSURANCE',
      sto: 'CBO',
      teknisi: 'EDWIN RUM OHOIRA',
      alatKerja: 'CLEAVER',
      merkType: 'FUJIKURA CT-30 HIGH PRECISION',
      jumlah: 1,
      posisiAlker: 'GUDANG',
      status: 'Rusak',
      keterangan: 'Pisau blade tumpul perlu diputar step 12',
      foto: '',
      updatedAt: '20/10/2026 14:10',
    },
    {
      id: 'alk-4',
      tanggal: '2026-10-21',
      unit: 'PROVISIONING',
      sto: 'BGR',
      teknisi: 'ENCEP TATANG HERMAWAN',
      alatKerja: 'TANGGA 5,1',
      merkType: 'KRISBOW TELESKOPIK 5.1M',
      jumlah: 1,
      posisiAlker: 'Di BON',
      status: 'Layak',
      keterangan: 'Kondisi kuncian tangga kokoh',
      foto: '',
      updatedAt: '21/10/2026 08:45',
    },
    {
      id: 'alk-5',
      tanggal: '2026-10-21',
      unit: 'PROVISIONING',
      sto: 'BGR',
      teknisi: 'LUKMANUL HAKIM',
      alatKerja: 'SENTER',
      merkType: 'VFL 30MW VISUAL FAULT LOCATOR',
      jumlah: 1,
      posisiAlker: 'Di BON',
      status: 'Layak',
      keterangan: 'Laser merah tajam tembus 25km',
      foto: '',
      updatedAt: '21/10/2026 09:00',
    },
  ],
  stokData: [
    {
      id: 'stok-1',
      tanggal: '2026-10-21',
      alatKerja: 'SPLICER',
      merkType: 'INNO IFS-15H / FUSION SPLICER',
      status: 'Beli Baru',
      kondisiAlat: 'Baru',
      jumlah: 4,
      keterangan: 'Pengadaan baru Q4 - Batch 1',
      petugasInput: 'Super Admin Telkom Akses',
      updatedAt: '21/10/2026 10:00',
      createdAtTime: Date.now() - 3600000 * 2,
    },
    {
      id: 'stok-2',
      tanggal: '2026-10-21',
      alatKerja: 'OPM',
      merkType: 'JOINWIT JW3208 OPTICAL POWER METER',
      status: 'Stok',
      kondisiAlat: 'Layak',
      jumlah: 10,
      keterangan: 'Kondisi 50% masih siap pakai lapangan STO BGR',
      petugasInput: 'Super Admin Telkom Akses',
      updatedAt: '21/10/2026 09:30',
      createdAtTime: Date.now() - 3600000 * 3,
    },
    {
      id: 'stok-3',
      tanggal: '2026-10-20',
      alatKerja: 'CLEAVER',
      merkType: 'FUJIKURA CT-30 HIGH PRECISION',
      status: 'Stok',
      kondisiAlat: 'Rusak',
      jumlah: 2,
      keterangan: 'Menunggu perbaikan mata pisau blade',
      petugasInput: 'Super Admin Telkom Akses',
      updatedAt: '20/10/2026 15:45',
      createdAtTime: Date.now() - 3600000 * 24,
    },
    {
      id: 'stok-4',
      tanggal: '2026-10-20',
      alatKerja: 'SENTER',
      merkType: 'VFL 30MW VISUAL FAULT LOCATOR',
      status: 'Beli Baru',
      kondisiAlat: 'Baru',
      jumlah: 15,
      keterangan: 'Kelengkapan teknisi baru Provisioning',
      petugasInput: 'Super Admin Telkom Akses',
      updatedAt: '20/10/2026 11:20',
      createdAtTime: Date.now() - 3600000 * 28,
    },
  ],
  rekapData: [
    {
      id: 'rekap-1',
      alatKerja: 'SPLICER',
      merkType: 'INNO IFS-15H / FUSION SPLICER',
      stokGudang: 8,
      beliBaru: 4,
      baru: 4,
      layak: 7,
      rusak: 1,
      total: 12,
      keterangan: 'Alat sambung kabel fiber optic utama',
      updatedAt: '21/10/2026 14:00',
      createdAtTime: Date.now() - 3600000 * 24 * 10,
    },
    {
      id: 'rekap-2',
      alatKerja: 'DROPCORE STRIPPER',
      merkType: 'PROSKIT CP-FB463 FIBER STRIPPER',
      stokGudang: 25,
      beliBaru: 10,
      baru: 10,
      layak: 22,
      rusak: 3,
      total: 35,
      keterangan: 'Kupas kulit kabel dropcore dan coating FO',
      updatedAt: '21/10/2026 11:30',
      createdAtTime: Date.now() - 3600000 * 24 * 8,
    },
    {
      id: 'rekap-3',
      alatKerja: 'TOOLKIT FO (Streper)',
      merkType: 'PROSKIT FIBER OPTIC SET',
      stokGudang: 14,
      beliBaru: 6,
      baru: 6,
      layak: 12,
      rusak: 2,
      total: 20,
      keterangan: 'Perlengkapan komplit teknisi lapangan',
      updatedAt: '21/10/2026 10:15',
      createdAtTime: Date.now() - 3600000 * 24 * 7,
    },
    {
      id: 'rekap-4',
      alatKerja: 'CLEAVER',
      merkType: 'FUJIKURA CT-30 HIGH PRECISION',
      stokGudang: 10,
      beliBaru: 5,
      baru: 5,
      layak: 9,
      rusak: 1,
      total: 15,
      keterangan: 'Pemotong core presisi tinggi 90 derajat',
      updatedAt: '20/10/2026 16:20',
      createdAtTime: Date.now() - 3600000 * 24 * 6,
    },
    {
      id: 'rekap-5',
      alatKerja: 'OPM',
      merkType: 'JOINWIT JW3208 OPTICAL POWER METER',
      stokGudang: 18,
      beliBaru: 6,
      baru: 6,
      layak: 16,
      rusak: 2,
      total: 24,
      keterangan: 'Kalibrasi daya sinyal redaman dBm',
      updatedAt: '20/10/2026 15:10',
      createdAtTime: Date.now() - 3600000 * 24 * 5,
    },
    {
      id: 'rekap-6',
      alatKerja: 'SENTER',
      merkType: 'VFL 30MW VISUAL FAULT LOCATOR',
      stokGudang: 20,
      beliBaru: 8,
      baru: 8,
      layak: 18,
      rusak: 2,
      total: 28,
      keterangan: 'Deteksi kelurusan & tekukan kabel optik',
      updatedAt: '20/10/2026 14:00',
      createdAtTime: Date.now() - 3600000 * 24 * 4,
    },
    {
      id: 'rekap-7',
      alatKerja: 'LAN TESTER',
      merkType: 'NOYAFA NF-468 RJ45 RJ11',
      stokGudang: 15,
      beliBaru: 5,
      baru: 5,
      layak: 14,
      rusak: 1,
      total: 20,
      keterangan: 'Pengecekan kontinuitas pin kabel UTP',
      updatedAt: '19/10/2026 11:20',
      createdAtTime: Date.now() - 3600000 * 24 * 3,
    },
    {
      id: 'rekap-8',
      alatKerja: 'TANGGA 5,1',
      merkType: 'KRISBOW TELESKOPIK 5.1M',
      stokGudang: 12,
      beliBaru: 3,
      baru: 3,
      layak: 11,
      rusak: 1,
      total: 15,
      keterangan: 'Tangga tarik tiang ODP / tiang Telkom',
      updatedAt: '19/10/2026 09:30',
      createdAtTime: Date.now() - 3600000 * 24 * 2,
    },
    {
      id: 'rekap-9',
      alatKerja: 'BODY HARNES',
      merkType: 'PETZL NEWTON SAFETY FULL BODY',
      stokGudang: 22,
      beliBaru: 8,
      baru: 8,
      layak: 21,
      rusak: 1,
      total: 30,
      keterangan: 'Standar K3 safety panjat tiang',
      updatedAt: '18/10/2026 15:45',
      createdAtTime: Date.now() - 3600000 * 24 * 1,
    },
  ],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

// Database helper functions
function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        alkerData: parsed.alkerData || INITIAL_DB.alkerData,
        stokData: parsed.stokData || INITIAL_DB.stokData,
        rekapData: parsed.rekapData || INITIAL_DB.rekapData,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        version: parsed.version || 1,
      };
    }
  } catch (err) {
    console.error('Error reading DB, using default fallback:', err);
  }
  // Initialize file
  writeDb(INITIAL_DB);
  return INITIAL_DB;
}

function writeDb(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB file:', err);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Allow larger payload for photo evidence
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Basic CORS support
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // ================= API ROUTES =================

  // Health and Sync status check
  app.get('/api/health', (req: Request, res: Response) => {
    const db = readDb();
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      lastUpdated: db.lastUpdated,
      counts: {
        alker: db.alkerData.length,
        stok: db.stokData.length,
        rekap: db.rekapData.length,
      },
    });
  });

  // Get full centralized database
  app.get('/api/data', (req: Request, res: Response) => {
    const db = readDb();
    res.json({
      success: true,
      alkerData: db.alkerData,
      stokData: db.stokData,
      rekapData: db.rekapData,
      lastUpdated: db.lastUpdated,
      version: db.version,
    });
  });

  // Full database sync / bulk update
  app.post('/api/sync', (req: Request, res: Response) => {
    const { alkerData, stokData, rekapData } = req.body;
    const db = readDb();

    if (Array.isArray(alkerData)) db.alkerData = alkerData;
    if (Array.isArray(stokData)) db.stokData = stokData;
    if (Array.isArray(rekapData)) db.rekapData = rekapData;

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;

    writeDb(db);
    res.json({
      success: true,
      lastUpdated: db.lastUpdated,
      version: db.version,
      alkerData: db.alkerData,
      stokData: db.stokData,
      rekapData: db.rekapData,
    });
  });

  // Save / Update Alker Item
  app.post('/api/alker', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      res.status(400).json({ success: false, message: 'Item ID diperlukan' });
      return;
    }

    const db = readDb();
    const idx = db.alkerData.findIndex((i: any) => i.id === item.id);
    if (idx >= 0) {
      db.alkerData[idx] = item;
    } else {
      db.alkerData.unshift(item);
    }

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, item, lastUpdated: db.lastUpdated });
  });

  // Delete Alker Item
  app.delete('/api/alker/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.alkerData = db.alkerData.filter((i: any) => i.id !== id);
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, id, lastUpdated: db.lastUpdated });
  });

  // Save / Update Stok Item
  app.post('/api/stok', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      res.status(400).json({ success: false, message: 'Item ID diperlukan' });
      return;
    }

    const db = readDb();
    const idx = db.stokData.findIndex((i: any) => i.id === item.id);
    if (idx >= 0) {
      db.stokData[idx] = item;
    } else {
      db.stokData.unshift(item);
    }

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, item, lastUpdated: db.lastUpdated });
  });

  // Delete Stok Item
  app.delete('/api/stok/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.stokData = db.stokData.filter((i: any) => i.id !== id);
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, id, lastUpdated: db.lastUpdated });
  });

  // Save / Update Rekap Item
  app.post('/api/rekap', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      res.status(400).json({ success: false, message: 'Item ID diperlukan' });
      return;
    }

    const db = readDb();
    const idx = db.rekapData.findIndex((i: any) => i.id === item.id);
    if (idx >= 0) {
      db.rekapData[idx] = item;
    } else {
      db.rekapData.unshift(item);
    }

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, item, lastUpdated: db.lastUpdated });
  });

  // Delete Rekap Item
  app.delete('/api/rekap/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.rekapData = db.rekapData.filter((i: any) => i.id !== id);
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    writeDb(db);

    res.json({ success: true, id, lastUpdated: db.lastUpdated });
  });

  // ================= FRONTEND VITE INTEGRATION =================
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Telkom Akses Alker Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
