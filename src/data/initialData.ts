import { AlkerItem, InventoryItem, Technician, Transaction, StokPembelianItem } from '../types/inventory';
import * as XLSX from 'xlsx';

export const MASTER_TEKNISI: Technician[] = [
  // ASSURANCE
  { id: 'tek-1', name: 'RONY SETYA PURBOWO', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-2', name: 'IRPAN KURNIAWAN', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-3', name: 'EDWIN RUM OHOIRA', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-4', name: 'LEONARDO CORNELIUS', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-5', name: 'IHDAM AL MUTADI BILAH', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-6', name: 'ZIDANE MOCHAMAD HAFIZ', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-7', name: 'ASEP SAEPUL', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-8', name: 'ABDUL ROZAK', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-9', name: 'ACHMAD YUSUP', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-10', name: 'M ZENKURSANI', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-11', name: 'JEMMY FRATAMA', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-12', name: 'MUKHLISTIAWAN', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-13', name: 'TARMIJI', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-14', name: 'MARDIANSYAH', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-15', name: 'AGUS SAPRUDIN', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-16', name: 'WAWAN HERAWAN', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-17', name: 'ALPINO', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-18', name: 'VEGY NOVIANA PERMADI', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-19', name: 'ADING', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-20', name: 'DAVID M', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-21', name: 'APRYAN VISNU WARDHANI', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-22', name: 'KI AGUS HAVIZ RIMANTO', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-23', name: 'WAHYU ACHWAL', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-24', name: 'ASEP HUDAEPAH', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-25', name: 'MOCHAMMAD SODIQ', unit: 'ASSURANCE', sto: 'CBO' },
  { id: 'tek-26', name: 'REVI FADILLAH', unit: 'ASSURANCE', sto: 'BGR' },
  { id: 'tek-27', name: 'DEO RIVALDO', unit: 'ASSURANCE', sto: 'CBO' },

  // PROVISIONING
  { id: 'tek-28', name: 'ENCEP TATANG HERMAWAN', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-29', name: 'LUKMANUL HAKIM', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-30', name: 'MUHAMMAD RISWAN', unit: 'PROVISIONING', sto: 'CBO' },
  { id: 'tek-31', name: 'AHMAD GOJALI', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-32', name: 'AEP SAEPUDIN', unit: 'PROVISIONING', sto: 'CBO' },
  { id: 'tek-33', name: 'SAMMAJID', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-34', name: 'DEDI DORES', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-35', name: 'AJI TRIYANA', unit: 'PROVISIONING', sto: 'CBO' },
  { id: 'tek-36', name: 'MULYONO', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-37', name: 'NASROH WIJAYA', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-38', name: 'UCI SANUSI', unit: 'PROVISIONING', sto: 'CBO' },
  { id: 'tek-39', name: 'ASEP ROSADI', unit: 'PROVISIONING', sto: 'BGR' },
  { id: 'tek-40', name: 'SUWANDI', unit: 'PROVISIONING', sto: 'CBO' },
];

export const DAFTAR_ALAT_KERJA = [
  'SPLICER',
  'DROPCORE STRIPPER',
  'TOOLKIT FO (Streper)',
  'CLEAVER',
  'TEST PHONE',
  'LAN TESTER',
  'OPM',
  'SENTER',
  'TANGGA 5,1',
  'TANGGA 4,4',
  'TOOKIT SET LENGKAP',
  'BODY HARNES',
  'SARUNG TANGAN',
  'HELM',
  'CRIMPING TOOL',
  'TONE CHECKER',
  'POWER BANK',
  'KABEL VALIN',
  'ONE CLICK',
  'TAS PUNGGUNG',
  'JAS HUJAN',
  'OTDR MINI',
  'LAINNYA',
] as const;

export const ITEM_CATEGORIES = [
  'Alat Kerja (Tools & Ukur)',
  'Kabel & Dropcore Optik',
  'Perangkat Aktif (ONT / Modem)',
  'Aksesoris & Pasif FO',
  'Safety K3 & APD',
  'Material Instalasi',
] as const;

export const STO_LOCATIONS = ['BGR', 'CBO', 'DPS', 'SUK', 'DEP', 'JKT-SEL', 'GUDANG UTAMA'] as const;

export const TRANSACTION_PURPOSES_OUT = [
  'Pemasangan Baru (PSB - Provisioning)',
  'Perbaikan Gangguan (Assurance / Tiket)',
  'Peminjaman Alat Kerja (Alker) Teknisi',
  'Pergantian Perangkat Rusak Pelanggan',
  'Mutasi Antar Gudang / STO',
  'Maintenance Rutin OSP',
  'Keperluan Proyek / Relokasi',
] as const;

export const TRANSACTION_PURPOSES_IN = [
  'Penerimaan Pasokan / Supplier Pusat',
  'Pengembalian Alat Kerja (Alker) Teknisi',
  'Retur Perangkat Rusak dari Lapangan',
  'Kelebihan Material Proyek (Sisa PSB)',
  'Hasil Bongkaran / Dismantle',
  'Pengadaan Baru Lokal',
] as const;

import { createToolEvidenceSvg } from '../utils/photoEvidence';

export const INITIAL_ALKER_DATA: AlkerItem[] = [
  {
    id: 'alker-1',
    alatKerja: 'SPLICER',
    merkType: 'Fujikura 70S+',
    posisiAlker: 'Teknisi',
    teknisi: 'ASEP SAEPUL',
    unit: 'ASSURANCE',
    sto: 'CBO',
    status: 'Layak',
    keterangan: 'Kondisi elektroda normal dan baterai awet',
    foto: createToolEvidenceSvg('SPLICER FO', 'Fujikura 70S+', 'ASEP SAEPUL', '20/10/2026 08:30'),
    updatedAt: '20/10/2026 08:30',
    createdAtTime: 1760949000000,
  },
  {
    id: 'alker-2',
    alatKerja: 'OPM',
    merkType: 'Tribrer APM-50',
    posisiAlker: 'Teknisi',
    teknisi: 'ASEP SAEPUL',
    unit: 'ASSURANCE',
    sto: 'CBO',
    status: 'Layak',
    keterangan: 'Sudah dikalibrasi 1310/1490/1550nm',
    foto: createToolEvidenceSvg('OPM APM-50', 'Tribrer Optical', 'ASEP SAEPUL', '20/10/2026 08:35'),
    updatedAt: '20/10/2026 08:35',
    createdAtTime: 1760949300000,
  },
  {
    id: 'alker-3',
    alatKerja: 'TANGGA 5,1',
    merkType: 'Krisbow Heavy Duty',
    posisiAlker: 'WH',
    teknisi: 'ASEP SAEPUL',
    unit: 'ASSURANCE',
    sto: 'CBO',
    status: 'Layak',
    keterangan: 'Disimpan di rak tangga warehouse STO CBO',
    foto: createToolEvidenceSvg('TANGGA 5.1M', 'Krisbow Teleskopik', 'ASEP SAEPUL', '19/10/2026 14:15'),
    updatedAt: '19/10/2026 14:15',
    createdAtTime: 1760883300000,
  },
  {
    id: 'alker-4',
    alatKerja: 'CLEAVER',
    merkType: 'Sumitomo FC-6S',
    posisiAlker: 'Teknisi',
    teknisi: 'RONY SETYA PURBOWO',
    unit: 'ASSURANCE',
    sto: 'BGR',
    status: 'Layak',
    keterangan: 'Mata pisau tajam, step 3',
    foto: createToolEvidenceSvg('CLEAVER FC-6S', 'Sumitomo Electric', 'RONY SETYA PURBOWO', '19/10/2026 10:00'),
    updatedAt: '19/10/2026 10:00',
    createdAtTime: 1760868000000,
  },
  {
    id: 'alker-5',
    alatKerja: 'LAN TESTER',
    merkType: 'RJ45/RJ11 Pro',
    posisiAlker: 'Service',
    teknisi: 'LUKMANUL HAKIM',
    unit: 'PROVISIONING',
    sto: 'BGR',
    status: 'Rusak',
    keterangan: 'Lampu LED pin 3 dan 5 mati, sedang diperbaiki',
    foto: createToolEvidenceSvg('LAN TESTER', 'RJ45 Cable Master', 'LUKMANUL HAKIM', '18/10/2026 16:20'),
    updatedAt: '18/10/2026 16:20',
    createdAtTime: 1760804400000,
  },
];

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    code: 'ALK-001',
    name: 'Splicer Fiber Optic Core Alignment',
    category: 'Alat Kerja (Tools & Ukur)',
    brandModel: 'Fujikura 70S+',
    unit: 'Unit',
    stockCurrent: 4,
    minStock: 2,
    location: 'Lemari Khusus Alker - Rak A1',
    condition: 'Bagus',
    notes: 'Lengkap dengan elektroda cadangan dan box tahan banting.',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-18T10:15:00Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export function exportAlkerToExcel(data: AlkerItem[], userTitle: string) {
  const wsData = [
    [userTitle],
    ['Tanggal Unduh:', new Date().toLocaleDateString('id-ID'), 'Status:', 'Laporan Resmi'],
    [],
    [
      'NO',
      'ALAT KERJA',
      'MERK / TYPE',
      'POSISI ALKER',
      'TEKNISI',
      'UNIT',
      'STO',
      'STATUS',
      'KETERANGAN',
      'TIMESTAMP',
    ],
  ];

  data.forEach((row, idx) => {
    wsData.push([
      (idx + 1).toString(),
      row.alatKerja || '-',
      row.merkType || '-',
      row.posisiAlker || '-',
      row.teknisi || '-',
      row.unit || '-',
      row.sto || '-',
      row.status || '-',
      row.keterangan || '-',
      row.updatedAt || '-',
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 26 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 32 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Alat Kerja');
  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Laporan_Cek_Alker_${todayStr}.xlsx`);
}

export const INITIAL_STOK_PEMBELIAN_DATA: StokPembelianItem[] = [
  {
    id: 'sp-1',
    alatKerja: 'SPLICER',
    merkType: 'Fujikura 70S+',
    status: 'Stok',
    kondisiAlat: 'Baru',
    jumlah: 4,
    tanggal: '20/10/2026',
    keterangan: 'Stok gudang pusat, kalibrasi berkala aktif',
    updatedAt: '20/10/2026 09:30',
    createdAtTime: Date.now() - 3600000 * 24 * 5,
  },
  {
    id: 'sp-2',
    alatKerja: 'SPLICER',
    merkType: 'Ilsintech Swift KF4A',
    status: 'Beli Baru',
    kondisiAlat: 'Baru',
    jumlah: 2,
    tanggal: '19/10/2026',
    keterangan: 'Pengadaan Q4 Tim Assurance BGR (PO-2026-092)',
    updatedAt: '19/10/2026 14:15',
    createdAtTime: Date.now() - 3600000 * 24 * 4,
  },
  {
    id: 'sp-3',
    alatKerja: 'OPM',
    merkType: 'Tribrer APM-50',
    status: 'Stok',
    kondisiAlat: 'Baru',
    jumlah: 8,
    tanggal: '18/10/2026',
    keterangan: 'Stok siap distribusi ke teknisi lapangan',
    updatedAt: '18/10/2026 11:00',
    createdAtTime: Date.now() - 3600000 * 24 * 3,
  },
  {
    id: 'sp-4',
    alatKerja: 'OPM',
    merkType: 'Grandway FHP12',
    status: 'Stok',
    kondisiAlat: 'Rusak',
    jumlah: 3,
    tanggal: '17/10/2026',
    keterangan: 'Sensor deteksi optic tidak membaca, menunggu jadwal servis',
    updatedAt: '17/10/2026 16:40',
    createdAtTime: Date.now() - 3600000 * 24 * 2,
  },
  {
    id: 'sp-5',
    alatKerja: 'CLEAVER',
    merkType: 'Fujikura CT-50 High Precision',
    status: 'Stok',
    kondisiAlat: 'Baru',
    jumlah: 6,
    tanggal: '18/10/2026',
    keterangan: 'Mata pisau tajam baru putaran posisi 1',
    updatedAt: '18/10/2026 10:20',
    createdAtTime: Date.now() - 3600000 * 24 * 2,
  },
  {
    id: 'sp-6',
    alatKerja: 'DROPCORE STRIPPER',
    merkType: 'Proskit 8PK-325',
    status: 'Beli Baru',
    kondisiAlat: 'Baru',
    jumlah: 15,
    tanggal: '19/10/2026',
    keterangan: 'Pengadaan baru untuk teknisi Provisioning',
    updatedAt: '19/10/2026 15:50',
    createdAtTime: Date.now() - 3600000 * 24 * 1,
  },
  {
    id: 'sp-7',
    alatKerja: 'TANGGA 5,1',
    merkType: 'Krisbow Heavy Duty Telescopic',
    status: 'Beli Baru',
    kondisiAlat: 'Baru',
    jumlah: 5,
    tanggal: '20/10/2026',
    keterangan: 'Penerimaan gudang STO CBO baru dari vendor',
    updatedAt: '20/10/2026 08:45',
    createdAtTime: Date.now() - 3600000 * 10,
  },
  {
    id: 'sp-8',
    alatKerja: 'LAN TESTER',
    merkType: 'Noyafa NF-8209 Pro',
    status: 'Stok',
    kondisiAlat: 'Rusak',
    jumlah: 2,
    tanggal: '15/10/2026',
    keterangan: 'Layar LCD bergaris, port RJ45 longgar',
    updatedAt: '15/10/2026 13:10',
    createdAtTime: Date.now() - 3600000 * 24 * 6,
  },
  {
    id: 'sp-9',
    alatKerja: 'SENTER',
    merkType: 'Visual Fault Locator 10mW Red Laser',
    status: 'Stok',
    kondisiAlat: 'Baru',
    jumlah: 12,
    tanggal: '16/10/2026',
    keterangan: 'Stok lengkap baterai siap pakai',
    updatedAt: '16/10/2026 10:05',
    createdAtTime: Date.now() - 3600000 * 24 * 5,
  },
];

export function exportStokPembelianToExcel(data: StokPembelianItem[]) {
  const wsData = [
    ['LAPORAN DATA STOK DAN PEMBELIAN ALAT KERJA'],
    ['Tanggal Unduh:', new Date().toLocaleDateString('id-ID'), 'Status:', 'Laporan Resmi'],
    [],
    [
      'NO',
      'ALAT KERJA',
      'MERK / TYPE',
      'STATUS',
      'KONDISI ALAT KERJA',
      'JUMLAH (UNIT)',
      'TANGGAL',
      'KETERANGAN',
      'UPDATE TERAKHIR',
    ],
  ];

  data.forEach((row, idx) => {
    wsData.push([
      (idx + 1).toString(),
      row.alatKerja || '-',
      row.merkType || '-',
      row.status || '-',
      row.kondisiAlat || '-',
      row.jumlah.toString(),
      row.tanggal || '-',
      row.keterangan || '-',
      row.updatedAt || '-',
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 26 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 36 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok & Pembelian Alker');
  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Laporan_Stok_Pembelian_Alker_${todayStr}.xlsx`);
}
