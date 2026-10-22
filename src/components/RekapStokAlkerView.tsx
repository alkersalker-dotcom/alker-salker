import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  FileSpreadsheet,
  FolderOpen,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ClipboardList,
  Filter,
  BarChart3,
  Info,
  ShoppingBag,
} from 'lucide-react';
import { RekapStokAlkerItem, UserSession, AlkerItem, StokPembelianItem } from '../types/inventory';
import { exportRekapStokAlkerToExcel, DAFTAR_ALAT_KERJA } from '../data/initialData';
import { RekapPivotDetailModal, PivotColumnType } from './RekapPivotDetailModal';

interface RekapStokAlkerViewProps {
  currentUser: UserSession;
  data: RekapStokAlkerItem[];
  alkerData?: AlkerItem[];
  stokData?: StokPembelianItem[];
  onOpenAddModal: () => void;
  onEditItem: (item: RekapStokAlkerItem) => void;
  onDeleteItem: (id: string) => void;
  onShowRestrictedModal: () => void;
}

export const RekapStokAlkerView: React.FC<RekapStokAlkerViewProps> = ({
  currentUser,
  data,
  alkerData = [],
  stokData = [],
  onOpenAddModal,
  onEditItem,
  onDeleteItem,
  onShowRestrictedModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [alatKerjaFilter, setAlatKerjaFilter] = useState<string>('');

  // Pivot Table Drill-Down Modal State
  const [isPivotModalOpen, setIsPivotModalOpen] = useState<boolean>(false);
  const [pivotColumnType, setPivotColumnType] = useState<PivotColumnType>('TOTAL');
  const [pivotTargetItem, setPivotTargetItem] = useState<RekapStokAlkerItem | null>(null);

  // Statistics calculation
  const totalMacamAlker = data.length;
  const totalStokGudang = data.reduce((acc, curr) => acc + (curr.stokGudang || 0), 0);
  const totalBeliBaru = data.reduce((acc, curr) => acc + (curr.beliBaru || 0), 0);
  const totalBaru = data.reduce((acc, curr) => acc + (curr.baru || 0), 0);
  const totalLayak = data.reduce((acc, curr) => acc + (curr.layak || 0), 0);
  const totalRusak = data.reduce((acc, curr) => acc + (curr.rusak || 0), 0);
  const grandTotal = data.reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Filtered rows
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (item.alatKerja && item.alatKerja.toLowerCase().includes(term)) ||
      (item.merkType && item.merkType.toLowerCase().includes(term)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(term));

    const matchesAlat = alatKerjaFilter === '' || item.alatKerja === alatKerjaFilter;

    return matchesSearch && matchesAlat;
  });

  const handleExport = () => {
    if (data.length === 0) {
      alert('Belum ada data rekap untuk diekspor!');
      return;
    }
    exportRekapStokAlkerToExcel(data);
  };

  const handleEditClick = (item: RekapStokAlkerItem) => {
    if (!currentUser.isAdmin) {
      onShowRestrictedModal();
      return;
    }
    onEditItem(item);
  };

  const handleDeleteClick = (item: RekapStokAlkerItem) => {
    if (!currentUser.isAdmin) {
      onShowRestrictedModal();
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus data rekap "${item.alatKerja} (${item.merkType})"?`)) {
      onDeleteItem(item.id);
    }
  };

  // Open Pivot Drill-Down for a specific cell or total
  const handleOpenPivot = (column: PivotColumnType, item: RekapStokAlkerItem | null) => {
    setPivotColumnType(column);
    setPivotTargetItem(item);
    setIsPivotModalOpen(true);
  };

  return (
    <div className="space-y-3.5">
      {/* 1. STATISTIK RINGKASAN REKAP STOK ALKER (Desain Kompak & Manis) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {/* TOTAL MACAM ALKER */}
        <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200 flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate">
              JENIS ALKER
            </p>
            <h4 className="text-base font-black text-slate-900 leading-none mt-0.5">
              {totalMacamAlker}{' '}
              <span className="text-[10px] font-normal text-slate-500">Item</span>
            </h4>
          </div>
        </div>

        {/* STOK GUDANG */}
        <div
          onClick={() => handleOpenPivot('STOK_GUDANG', null)}
          className="bg-white p-2.5 rounded-2xl shadow-xs border border-blue-200/80 flex items-center space-x-2.5 hover:shadow-md hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down seluruh STOK GUDANG"
        >
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>STOK GUDANG</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-blue-700 leading-none mt-0.5">
              {totalStokGudang}{' '}
              <span className="text-[10px] font-normal text-blue-500">Unit</span>
            </h4>
          </div>
        </div>

        {/* BELI BARU */}
        <div
          onClick={() => handleOpenPivot('BELI_BARU', null)}
          className="bg-white p-2.5 rounded-2xl shadow-xs border border-teal-200/80 flex items-center space-x-2.5 hover:shadow-md hover:border-teal-400 hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down seluruh BELI BARU"
        >
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>BELI BARU</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-teal-700 leading-none mt-0.5">
              {totalBeliBaru}{' '}
              <span className="text-[10px] font-normal text-teal-500">Unit</span>
            </h4>
          </div>
        </div>

        {/* BARU */}
        <div
          onClick={() => handleOpenPivot('BARU', null)}
          className="bg-white p-2.5 rounded-2xl shadow-xs border border-emerald-200/80 flex items-center space-x-2.5 hover:shadow-md hover:border-emerald-400 hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down seluruh KONDISI BARU"
        >
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>BARU</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-emerald-700 leading-none mt-0.5">
              {totalBaru}{' '}
              <span className="text-[10px] font-normal text-emerald-500">Unit</span>
            </h4>
          </div>
        </div>

        {/* LAYAK */}
        <div
          onClick={() => handleOpenPivot('LAYAK', null)}
          className="bg-white p-2.5 rounded-2xl shadow-xs border border-sky-200/80 flex items-center space-x-2.5 hover:shadow-md hover:border-sky-400 hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down seluruh KONDISI LAYAK (50%)"
        >
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>LAYAK (50%)</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-sky-700 leading-none mt-0.5">
              {totalLayak}{' '}
              <span className="text-[10px] font-normal text-sky-500">Unit</span>
            </h4>
          </div>
        </div>

        {/* RUSAK */}
        <div
          onClick={() => handleOpenPivot('RUSAK', null)}
          className="bg-white p-2.5 rounded-2xl shadow-xs border border-rose-200/80 flex items-center space-x-2.5 hover:shadow-md hover:border-rose-400 hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down seluruh KONDISI RUSAK"
        >
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0 group-hover:bg-rose-600 group-hover:text-white transition">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>RUSAK</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-rose-700 leading-none mt-0.5">
              {totalRusak}{' '}
              <span className="text-[10px] font-normal text-rose-500">Unit</span>
            </h4>
          </div>
        </div>

        {/* GRAND TOTAL */}
        <div
          onClick={() => handleOpenPivot('TOTAL', null)}
          className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-2.5 rounded-2xl shadow-xs text-white flex items-center space-x-2.5 col-span-2 sm:col-span-1 hover:shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer group"
          title="Klik untuk membuka Pivot Drill-Down SELURUH TOTAL UNIT"
        >
          <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-amber-100 font-bold uppercase tracking-wider truncate flex items-center gap-1">
              <span>TOTAL UNIT</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </p>
            <h4 className="text-base font-black text-white leading-none mt-0.5">
              {grandTotal}{' '}
              <span className="text-[10px] font-normal text-amber-200">Unit</span>
            </h4>
          </div>
        </div>
      </div>

      {/* PIVOT TABLE GUIDE BANNER */}
      <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-teal-50 border border-amber-200/90 rounded-2xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] rounded-lg shadow-xs flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span>FITUR PIVOT AKTIF</span>
          </span>
          <p className="text-[11px] text-slate-700 font-medium">
            <span className="font-bold text-indigo-900">Klik setiap angka</span> pada kolom{' '}
            <span className="font-bold text-blue-700">Stok Gudang</span>,{' '}
            <span className="font-bold text-teal-700">Beli Baru</span>,{' '}
            <span className="font-bold text-emerald-700">Baru</span>,{' '}
            <span className="font-bold text-sky-700">Layak</span>,{' '}
            <span className="font-bold text-rose-700">Rusak</span>, atau{' '}
            <span className="font-bold text-amber-700">Total</span> untuk memunculkan rincian lengkap data per unit (Drill-Down Detail).
          </p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 hidden md:inline">
          💡 Seperti Pivot Table Excel
        </span>
      </div>

      {/* 2. FILTER & AKSI BAR */}
      <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-grow max-w-lg">
          {/* Search Box */}
          <div className="relative flex-grow">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Alat Kerja, Merk / Type, atau Keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none text-slate-800 placeholder:text-slate-400 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Dropdown: ALAT KERJA */}
          <div className="relative">
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <Filter className="w-3 h-3 text-indigo-500" />
              <select
                value={alatKerjaFilter}
                onChange={(e) => setAlatKerjaFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer pr-4 text-[11px]"
              >
                <option value="">Semua Alat Kerja</option>
                {DAFTAR_ALAT_KERJA.map((alk) => (
                  <option key={alk} value={alk}>
                    {alk}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons: Export Excel & Add Rekap */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            title="Download Rekap Stok dalam format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black rounded-xl text-xs shadow-sm shadow-indigo-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Rekap Alker</span>
          </button>
        </div>
      </div>

      {/* 3. TABEL DATA REKAP STOK ALKER DENGAN INTERAKSI PIVOT DRILL-DOWN */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            {/* Header Kolom dengan Gradasi Multi-Warna yang Indah & Elegan */}
            <thead>
              <tr className="bg-gradient-to-r from-[#201967] via-[#2d258b] to-[#4033b0] text-white uppercase tracking-wider text-[10px] font-black border-b border-indigo-400/30">
                <th className="px-3 py-2.5 text-center w-10">NO</th>
                <th className="px-3 py-2.5">ALAT KERJA</th>
                <th className="px-3 py-2.5">
                  <div className="flex items-center space-x-1">
                    <span>MERK TYPE</span>
                    <span className="text-[8.5px] bg-white/20 text-amber-200 px-1 py-0.2 rounded font-normal normal-case">
                      (Kapital)
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center bg-blue-900/40 text-blue-200">
                  <span className="inline-flex items-center gap-1">
                    <span>STOK GUDANG</span>
                    <span className="text-[8px] bg-blue-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center bg-teal-900/40 text-teal-200">
                  <span className="inline-flex items-center gap-1">
                    <span>BELI BARU</span>
                    <span className="text-[8px] bg-teal-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center bg-emerald-900/40 text-emerald-200">
                  <span className="inline-flex items-center gap-1">
                    <span>BARU</span>
                    <span className="text-[8px] bg-emerald-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center bg-sky-900/40 text-sky-200">
                  <span className="inline-flex items-center gap-1">
                    <span>LAYAK</span>
                    <span className="text-[8px] bg-sky-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center bg-rose-900/40 text-rose-200">
                  <span className="inline-flex items-center gap-1">
                    <span>RUSAK</span>
                    <span className="text-[8px] bg-rose-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center bg-amber-950/50 text-amber-300">
                  <span className="inline-flex items-center gap-1">
                    <span>TOTAL</span>
                    <span className="text-[8px] bg-amber-500/40 px-1 py-0.2 rounded font-mono">PIVOT</span>
                  </span>
                </th>
                <th className="px-3 py-2.5">KETERANGAN</th>
                <th className="px-3 py-2.5 text-center w-24">AKSI</th>
              </tr>
            </thead>

            {/* Body Tabel */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-xs">Belum ada data rekap stok alker</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Klik tombol "+ Input Rekap Alker" untuk menambahkan data baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* NO */}
                      <td className="px-3 py-2 text-center font-bold text-slate-400 text-[10px]">
                        {idx + 1}
                      </td>

                      {/* ALAT KERJA */}
                      <td className="px-3 py-2 font-black text-slate-900 tracking-tight">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span>{item.alatKerja}</span>
                        </div>
                      </td>

                      {/* MERK TYPE (OTOMATIS HURUF BESAR) */}
                      <td className="px-3 py-2 font-mono font-bold text-slate-800 uppercase tracking-wide">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {item.merkType}
                        </span>
                      </td>

                      {/* STOK GUDANG (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-blue-50/30">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('STOK_GUDANG', item)}
                          className="px-2.5 py-0.5 rounded-lg font-mono font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-600 hover:text-white border border-blue-200/80 shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1"
                          title={`Klik untuk melihat rincian data pivot STOK GUDANG (${item.alatKerja})`}
                        >
                          <span>{item.stokGudang}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* BELI BARU (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-teal-50/30">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('BELI_BARU', item)}
                          className="px-2.5 py-0.5 rounded-lg font-mono font-bold text-teal-700 bg-teal-100/70 hover:bg-teal-600 hover:text-white border border-teal-200/80 shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1"
                          title={`Klik untuk melihat rincian data pivot BELI BARU (${item.alatKerja})`}
                        >
                          <span>{item.beliBaru}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* BARU (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-emerald-50/20">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('BARU', item)}
                          className="px-2.5 py-0.5 rounded-lg font-mono font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-600 hover:text-white border border-emerald-300 shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1"
                          title={`Klik untuk melihat rincian data pivot KONDISI BARU (${item.alatKerja})`}
                        >
                          <span>{item.baru}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* LAYAK (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-sky-50/20">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('LAYAK', item)}
                          className="px-2.5 py-0.5 rounded-lg font-mono font-bold text-sky-800 bg-sky-100/70 hover:bg-sky-600 hover:text-white border border-sky-300 shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1"
                          title={`Klik untuk melihat rincian data pivot KONDISI LAYAK (50%) (${item.alatKerja})`}
                        >
                          <span>{item.layak}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* RUSAK (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-rose-50/20">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('RUSAK', item)}
                          className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-[10.5px] border shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1 ${
                            item.rusak > 0
                              ? 'bg-rose-100/80 text-rose-800 border-rose-300 hover:bg-rose-600 hover:text-white'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-600 hover:text-white'
                          }`}
                          title={`Klik untuk melihat rincian data pivot KONDISI RUSAK (${item.alatKerja})`}
                        >
                          <span>{item.rusak}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* TOTAL (PIVOT DRILL-DOWN BUTTON) */}
                      <td className="px-3 py-2 text-center bg-amber-50/50">
                        <button
                          type="button"
                          onClick={() => handleOpenPivot('TOTAL', item)}
                          className="px-3 py-0.5 rounded-full font-mono font-black text-[11px] bg-amber-200 text-amber-950 border border-amber-400 hover:bg-amber-500 hover:text-white shadow-2xs hover:scale-110 active:scale-95 transition cursor-pointer group/btn inline-flex items-center space-x-1"
                          title={`Klik untuk melihat rincian data pivot TOTAL KESELURUHAN (${item.alatKerja})`}
                        >
                          <span>{item.total}</span>
                          <span className="text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity">🔍</span>
                        </button>
                      </td>

                      {/* KETERANGAN */}
                      <td className="px-3 py-2 text-[10.5px] text-slate-600 max-w-[200px] truncate" title={item.keterangan}>
                        {item.keterangan || '-'}
                      </td>

                      {/* AKSI */}
                      <td className="px-3 py-2 text-center space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition cursor-pointer"
                          title={currentUser.isAdmin ? 'Edit Data Rekap' : 'Edit (Khusus Admin)'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                          title={currentUser.isAdmin ? 'Hapus Data Rekap' : 'Hapus (Khusus Admin)'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Total Keseluruhan (Grand Total) dengan Fitur Pivot Drill-down Keseluruhan */}
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-100 via-indigo-50/50 to-purple-50 font-black text-slate-800 border-t-2 border-indigo-200 text-[10.5px]">
                  <td colSpan={3} className="px-3 py-2.5 text-right tracking-wider uppercase text-indigo-900">
                    TOTAL KESELURUHAN ({filteredData.length} Jenis Alker):
                  </td>

                  {/* GRAND TOTAL: STOK GUDANG */}
                  <td className="px-3 py-2 text-center bg-blue-100/30">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('STOK_GUDANG', null)}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-black text-blue-800 bg-blue-200/70 hover:bg-blue-600 hover:text-white border border-blue-300 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down seluruh data STOK GUDANG"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.stokGudang || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  {/* GRAND TOTAL: BELI BARU */}
                  <td className="px-3 py-2 text-center bg-teal-100/30">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('BELI_BARU', null)}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-black text-teal-800 bg-teal-200/70 hover:bg-teal-600 hover:text-white border border-teal-300 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down seluruh data BELI BARU"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.beliBaru || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  {/* GRAND TOTAL: BARU */}
                  <td className="px-3 py-2 text-center bg-emerald-100/30">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('BARU', null)}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-black text-emerald-800 bg-emerald-200/70 hover:bg-emerald-600 hover:text-white border border-emerald-300 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down seluruh data KONDISI BARU"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.baru || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  {/* GRAND TOTAL: LAYAK */}
                  <td className="px-3 py-2 text-center bg-sky-100/30">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('LAYAK', null)}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-black text-sky-800 bg-sky-200/70 hover:bg-sky-600 hover:text-white border border-sky-300 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down seluruh data KONDISI LAYAK"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.layak || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  {/* GRAND TOTAL: RUSAK */}
                  <td className="px-3 py-2 text-center bg-rose-100/30">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('RUSAK', null)}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-black text-rose-800 bg-rose-200/70 hover:bg-rose-600 hover:text-white border border-rose-300 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down seluruh data KONDISI RUSAK"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.rusak || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  {/* GRAND TOTAL: TOTAL */}
                  <td className="px-3 py-2 text-center bg-amber-200/60">
                    <button
                      type="button"
                      onClick={() => handleOpenPivot('TOTAL', null)}
                      className="px-3 py-0.5 rounded-full font-mono font-black text-xs text-amber-950 bg-amber-300 hover:bg-amber-600 hover:text-white border border-amber-400 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1"
                      title="Klik untuk Pivot Drill-Down TOTAL KESELURUHAN ALKER"
                    >
                      <span>{filteredData.reduce((acc, r) => acc + (r.total || 0), 0)}</span>
                      <span className="text-[8px]">🔍</span>
                    </button>
                  </td>

                  <td colSpan={2} className="px-3 py-2.5 text-right text-[10px] text-slate-500 font-semibold">
                    Unit Terdata (Klik Angka untuk Pivot Detail)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* PIVOT TABLE DRILL-DOWN MODAL */}
      <RekapPivotDetailModal
        isOpen={isPivotModalOpen}
        onClose={() => setIsPivotModalOpen(false)}
        columnType={pivotColumnType}
        rekapItem={pivotTargetItem}
        alkerData={alkerData}
        stokData={stokData}
        allRekapData={data}
      />
    </div>
  );
};
