import React, { useState } from 'react';
import {
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Image,
} from 'lucide-react';
import { InventoryItem, Transaction, TransactionType } from '../types/inventory';
import { formatIndoDate, exportTransactionsToExcel } from '../utils/formatters';

interface TransactionListProps {
  filterType?: TransactionType;
  transactions: Transaction[];
  items: InventoryItem[];
  onOpenNewTransaction: (type: TransactionType) => void;
  onViewSuratJalan: (trx: Transaction) => void;
  onCancelTransaction: (trxId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  filterType,
  transactions,
  items,
  onOpenNewTransaction,
  onViewSuratJalan,
  onCancelTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedSto, setSelectedSto] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter((trx) => {
    if (filterType && trx.type !== filterType) return false;

    const matchesSearch =
      trx.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.recipientOrSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.stoLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.items.some(
        (it) =>
          it.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          it.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (it.serialNumber && it.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesUnit = selectedUnit === '' || trx.unitOrDepartment === selectedUnit;
    const matchesSto = selectedSto === '' || trx.stoLocation === selectedSto;

    return matchesSearch && matchesUnit && matchesSto;
  });

  const isMasukView = filterType === 'MASUK';
  const isKeluarView = filterType === 'KELUAR';

  const handleExport = () => {
    const title = isMasukView
      ? 'Rekap_Barang_Masuk'
      : isKeluarView
      ? 'Rekap_Barang_Keluar'
      : 'Rekap_Semua_Transaksi';
    exportTransactionsToExcel(filtered, title);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                isMasukView
                  ? 'bg-emerald-600'
                  : isKeluarView
                  ? 'bg-indigo-600'
                  : 'bg-slate-800'
              }`}
            >
              {isMasukView ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {isMasukView
                  ? 'Catatan Riwayat Barang Masuk (Inbound)'
                  : isKeluarView
                  ? 'Catatan Riwayat Barang Keluar (Outbound)'
                  : 'Semua Riwayat Transaksi'}
              </h2>
              <p className="text-xs text-slate-500">
                Total tercatat: <span className="font-bold text-slate-800">{filtered.length} transaksi</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            onClick={() => onOpenNewTransaction(filterType || 'KELUAR')}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center space-x-1.5 cursor-pointer ${
              isMasukView
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat {isMasukView ? 'Barang Masuk' : 'Barang Keluar'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Bukti, Teknisi, Kode SKU, Serial Number (SN)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filter Unit */}
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Unit</option>
          <option value="ASSURANCE">ASSURANCE</option>
          <option value="PROVISIONING">PROVISIONING</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="LOGISTIK PUSAT">LOGISTIK PUSAT</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {/* Filter STO */}
        <select
          value={selectedSto}
          onChange={(e) => setSelectedSto(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua STO</option>
          <option value="BGR">BGR (Bogor)</option>
          <option value="CBO">CBO (Cibinong)</option>
          <option value="DPS">DPS (Depok Timur)</option>
          <option value="SUK">SUK (Sukasari)</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Bukti & Tanggal</th>
                <th className="py-3 px-4">{isMasukView ? 'Pengirim / Sumber' : 'Penerima / Teknisi'}</th>
                <th className="py-3 px-4">Unit & STO</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4">Rincian Barang</th>
                <th className="py-3 px-4 text-center">Foto / TTD</th>
                <th className="py-3 px-4 text-center">Petugas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada transaksi yang cocok</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba ganti filter pencarian atau buat transaksi baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => {
                  const isMasuk = trx.type === 'MASUK';
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition">
                      {/* No Bukti & Tanggal */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`p-1 rounded-md text-[10px] font-black uppercase ${
                              isMasuk ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {isMasuk ? 'IN' : 'OUT'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {trx.transactionNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatIndoDate(trx.date)}</span>
                        </p>
                      </td>

                      {/* Penerima / Sumber */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 uppercase">
                          {trx.recipientOrSource}
                        </p>
                      </td>

                      {/* Unit & STO */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase border border-slate-200">
                          {trx.unitOrDepartment}
                        </span>
                        <span className="ml-1.5 font-mono font-bold text-slate-600">
                          STO {trx.stoLocation}
                        </span>
                      </td>

                      {/* Keperluan */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={trx.purpose}>
                        {trx.purpose}
                      </td>

                      {/* Rincian Barang */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-md">
                          {trx.items.map((it, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-[11px]">
                              <span className="font-mono text-slate-500 font-semibold">[{it.itemCode}]</span>
                              <span className="font-bold text-slate-800">{it.itemName}</span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold">
                                {it.qty} {it.unit}
                              </span>
                              {it.serialNumber && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  SN: {it.serialNumber}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Foto / TTD */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          {trx.photoEvidence ? (
                            <button
                              onClick={() => setSelectedPhoto(trx.photoEvidence!)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Lihat Foto Bukti"
                            >
                              <Image className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}

                          {trx.signature && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold"
                              title="Tanda Tangan Digital Tersimpan"
                            >
                              TTD OK
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Petugas */}
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {trx.officerName}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onViewSuratJalan(trx)}
                            className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition"
                            title="Pratinjau & Cetak Surat Jalan"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onCancelTransaction(trx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Batalkan & Rollback Stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image viewer modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Bukti Lampiran"
              className="rounded-xl max-h-[85vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
