import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Printer,
} from 'lucide-react';
import { InventoryItem, Transaction } from '../types/inventory';
import { exportInventoryToExcel, exportTransactionsToExcel, formatIndoDate } from '../utils/formatters';

interface ReportsViewProps {
  items: InventoryItem[];
  transactions: Transaction[];
  onResetData: () => void;
  onRestoreData: (backup: { items: InventoryItem[]; transactions: Transaction[] }) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  items,
  transactions,
  onResetData,
  onRestoreData,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const trxMasuk = transactions.filter((t) => t.type === 'MASUK');
  const trxKeluar = transactions.filter((t) => t.type === 'KELUAR');

  // JSON Backup Export
  const handleExportBackup = () => {
    const backupData = {
      items,
      transactions,
      exportedAt: new Date().toISOString(),
      appName: 'Sistem Keluar Masuk Barang',
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Keluar_Masuk_Barang_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed.items) && Array.isArray(parsed.transactions)) {
            onRestoreData({ items: parsed.items, transactions: parsed.transactions });
            alert('Data backup berhasil dipulihkan!');
          } else {
            alert('Format berkas backup tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca berkas JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Pusat Laporan, Rekapitulasi & Ekspor Data
            </h2>
            <p className="text-xs text-slate-500">
              Unduh rekapitulasi inventaris dan riwayat arus barang dalam format Microsoft Excel (.xlsx)
            </p>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Laporan Stok */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Laporan Posisi Stok Gudang
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi seluruh item, nomor SKU, batas minimum stok, status ketersediaan, dan posisi rak.
            </p>
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono">
              Total: {items.length} SKU • {items.reduce((s, i) => s + i.stockCurrent, 0)} Unit Fisik
            </div>
          </div>

          <button
            onClick={() => exportInventoryToExcel(items)}
            type="button"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel Stok (.xlsx)</span>
          </button>
        </div>

        {/* Laporan Barang Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Laporan Barang Masuk (Inbound)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rincian pasokan dari supplier pusat, penerimaan alat, dan pengembalian material dari teknisi.
            </p>
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono">
              Total: {trxMasuk.length} Bukti Penerimaan (BPM)
            </div>
          </div>

          <button
            onClick={() => exportTransactionsToExcel(trxMasuk, 'Laporan_Barang_Masuk')}
            type="button"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel Barang Masuk</span>
          </button>
        </div>

        {/* Laporan Barang Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-300 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Laporan Barang Keluar (Outbound)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rincian serah terima Surat Jalan ke teknisi untuk pasang baru, perbaikan gangguan, dan proyek.
            </p>
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono">
              Total: {trxKeluar.length} Surat Jalan Pengeluaran
            </div>
          </div>

          <button
            onClick={() => exportTransactionsToExcel(trxKeluar, 'Laporan_Barang_Keluar')}
            type="button"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel Barang Keluar</span>
          </button>
        </div>
      </div>

      {/* Backup, Restore, and Reset Database */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center space-x-2.5">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-sm text-slate-900">
            Cadangan Data & Pengaturan Database (Backup / Restore)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Data tersimpan secara lokal dan aman di browser perangkat Anda. Anda dapat mengunduh salinan backup lengkap atau mengembalikan data kapan saja.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Download JSON Backup */}
          <button
            onClick={handleExportBackup}
            type="button"
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Unduh File Backup JSON</span>
          </button>

          {/* Upload JSON Backup */}
          <label className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition flex items-center justify-center space-x-2 cursor-pointer text-center">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Pulihkan dari File Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          {/* Reset to Demo Data */}
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data simulasi default?')) {
                onResetData();
              }
            }}
            type="button"
            className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset ke Data Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
