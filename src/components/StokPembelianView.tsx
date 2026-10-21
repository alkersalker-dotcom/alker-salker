import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  FileSpreadsheet,
  ShoppingBag,
  FolderOpen,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  Eye,
  Camera,
  X,
} from 'lucide-react';
import { StokPembelianItem, UserSession } from '../types/inventory';
import { exportStokPembelianToExcel } from '../data/initialData';
import { createToolEvidenceSvg } from '../utils/photoEvidence';

interface StokPembelianViewProps {
  currentUser: UserSession;
  data: StokPembelianItem[];
  onOpenAddModal: () => void;
  onEditItem: (item: StokPembelianItem) => void;
  onDeleteItem: (id: string) => void;
  onShowRestrictedModal: () => void;
}

export const StokPembelianView: React.FC<StokPembelianViewProps> = ({
  currentUser,
  data,
  onOpenAddModal,
  onEditItem,
  onDeleteItem,
  onShowRestrictedModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [kondisiFilter, setKondisiFilter] = useState<string>('');
  const [activePhotoItem, setActivePhotoItem] = useState<StokPembelianItem | null>(null);

  // Statistics calculation
  const totalItems = data.length;
  const totalStokQty = data
    .filter((d) => d.status === 'Stok')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  const totalBeliQty = data
    .filter((d) => d.status === 'Beli Baru')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  const totalBaruQty = data
    .filter((d) => d.kondisiAlat === 'Baru')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  const totalRusakQty = data
    .filter((d) => d.kondisiAlat === 'Rusak')
    .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

  // Filtered rows
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (item.alatKerja && item.alatKerja.toLowerCase().includes(term)) ||
      (item.merkType && item.merkType.toLowerCase().includes(term)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(term));

    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    const matchesKondisi = kondisiFilter === '' || item.kondisiAlat === kondisiFilter;

    return matchesSearch && matchesStatus && matchesKondisi;
  });

  const handleExport = () => {
    if (data.length === 0) {
      alert('Belum ada data untuk diekspor!');
      return;
    }
    exportStokPembelianToExcel(data);
  };

  const handleEditClick = (item: StokPembelianItem) => {
    if (!currentUser.isAdmin) {
      onShowRestrictedModal();
      return;
    }
    onEditItem(item);
  };

  const handleDeleteClick = (item: StokPembelianItem) => {
    if (!currentUser.isAdmin) {
      onShowRestrictedModal();
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus data stok "${item.alatKerja} (${item.merkType})"?`)) {
      onDeleteItem(item.id);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Banner Ringkasan Tab */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 bg-gradient-to-tr from-teal-600 to-emerald-600 text-white rounded-lg text-xs shadow-xs">
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Data Stok & Pengadaan Pembelian Alat Kerja</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                Logistik Central
              </span>
            </p>
            <p className="text-[10px] text-slate-500">
              Manajemen persediaan stok gudang, penerimaan pengadaan alker baru, dan pemantauan kondisi alat.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1 text-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Input Data Baru</span>
        </button>
      </div>

      {/* KPI Cards Ringkasan Stok & Pembelian */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* 1. TOTAL MACAM ALAT */}
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                TOTAL MACAM ALKER
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight mt-0.5">
                {totalItems} <span className="text-[10px] font-normal text-slate-500">SKU</span>
              </h3>
            </div>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
            <span className="text-indigo-500">🏷️</span>
            <span>Katalog alat kerja</span>
          </p>
        </div>

        {/* 2. TOTAL STOK GUDANG */}
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                STOK GUDANG TERSEDIA
              </p>
              <h3 className="text-lg sm:text-xl font-black text-indigo-600 leading-tight mt-0.5">
                {totalStokQty} <span className="text-[10px] font-normal text-slate-500">Unit</span>
              </h3>
            </div>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
            <span className="text-indigo-500">📦</span>
            <span>Siap didistribusikan</span>
          </p>
        </div>

        {/* 3. TOTAL BELI BARU */}
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                PENGADAAN BELI BARU
              </p>
              <h3 className="text-lg sm:text-xl font-black text-emerald-600 leading-tight mt-0.5">
                {totalBeliQty} <span className="text-[10px] font-normal text-slate-500">Unit</span>
              </h3>
            </div>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
            <span className="text-emerald-500">✨</span>
            <span>Pengadaan alat baru</span>
          </p>
        </div>

        {/* 4. KONDISI ALAT KERJA */}
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                KONDISI ALAT KERJA
              </p>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-base sm:text-lg font-black text-emerald-600 leading-tight">
                  {totalBaruQty} <span className="text-[9px] font-bold text-slate-500">Baru</span>
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-base sm:text-lg font-black text-rose-600 leading-tight">
                  {totalRusakQty} <span className="text-[9px] font-bold text-slate-500">Rusak</span>
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
            <span className="text-emerald-500">✓</span>
            <span>Pemantauan fisik</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Cari Alat Kerja, Merk/Type, atau Keterangan PO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-400 focus:border-teal-500 outline-none transition placeholder:text-[11px]"
          />
        </div>

        {/* Filter Dropdowns and Export */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Filter Status: Stok | Beli Baru */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-teal-400 outline-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Stok">Stok</option>
            <option value="Beli Baru">Beli Baru</option>
          </select>

          {/* Filter Kondisi: Baru | Rusak */}
          <select
            value={kondisiFilter}
            onChange={(e) => setKondisiFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-teal-400 outline-none cursor-pointer"
          >
            <option value="">Semua Kondisi</option>
            <option value="Baru">Kondisi Baru</option>
            <option value="Rusak">Kondisi Rusak</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* DATABASE TABLE STOK & PEMBELIAN ALAT KERJA DENGAN HEADER SANGAT INDAH & ELEGAN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Header Kolom Sesuai Permintaan dengan Tampilan Mewah & Berwarna Indah */}
            <thead className="bg-gradient-to-r from-[#114b43] via-[#1e3a8a] via-[#312e81] to-[#4c1d95] text-white border-b-2 border-teal-400/50 uppercase tracking-wider shadow-sm">
              <tr className="text-[9.5px] sm:text-[10px] font-black divide-x divide-white/10">
                <th className="px-2.5 py-2.5 text-center whitespace-nowrap text-amber-200">
                  <span className="inline-flex items-center gap-1">
                    <span>📷</span>
                    <span>FOTO</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-white">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-emerald-300">🔧</span>
                    <span>ALAT KERJA</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-teal-100">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-cyan-300">🏷️</span>
                    <span>MERK / TYPE</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-indigo-200">
                  <span className="inline-flex items-center gap-1">
                    <span>📦</span>
                    <span>STATUS</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-emerald-200">
                  <span className="inline-flex items-center gap-1">
                    <span>⚡</span>
                    <span>KONDISI ALAT KERJA</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-amber-300 text-center">
                  <span className="inline-flex items-center gap-1">
                    <span>🔢</span>
                    <span>JUMLAH</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap text-sky-200">
                  <span className="inline-flex items-center gap-1">
                    <span>📅</span>
                    <span>TANGGAL</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 text-indigo-100">
                  <span className="inline-flex items-center gap-1">
                    <span>📝</span>
                    <span>KETERANGAN</span>
                  </span>
                </th>
                <th className="px-2.5 py-2.5 text-center whitespace-nowrap text-pink-200">
                  <span className="inline-flex items-center gap-1">
                    <span>⚙️</span>
                    <span>AKSI</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10.5px] sm:text-[11px]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-sm font-bold text-slate-700">
                      Belum ada data stok atau pembelian alat kerja
                    </p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                      Klik tombol "Input Data Baru" untuk mencatat persediaan alker atau pengadaan pembelian alker baru.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Input Stok / Beli Sekarang</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const effectiveFoto =
                    item.foto ||
                    createToolEvidenceSvg(
                      item.alatKerja,
                      item.merkType,
                      `LOGISTIK - ${item.status}`,
                      item.updatedAt
                    );

                  return (
                    <tr key={item.id} className="hover:bg-teal-50/40 transition group">
                      {/* FOTO EVIDEN */}
                      <td className="px-2.5 py-1.5 whitespace-nowrap text-center">
                        <div className="relative group/photo inline-block">
                          <img
                            src={effectiveFoto}
                            onClick={() =>
                              setActivePhotoItem({ ...item, foto: effectiveFoto })
                            }
                            className="w-9 h-9 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition border border-slate-200 shadow-2xs"
                            alt="Foto Eviden"
                          />
                          <div
                            onClick={() =>
                              setActivePhotoItem({ ...item, foto: effectiveFoto })
                            }
                            className="absolute inset-0 bg-black/45 rounded-lg flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition cursor-pointer text-white"
                            title="Buka Foto Penuh"
                          >
                            <Eye className="w-3 h-3 drop-shadow" />
                          </div>
                        </div>
                      </td>

                      {/* ALAT KERJA */}
                      <td className="px-2.5 py-1.5 font-black text-slate-900 whitespace-nowrap text-[11px]">
                        {item.alatKerja}
                      </td>

                      {/* MERK / TYPE */}
                      <td className="px-2.5 py-1.5 text-slate-600 whitespace-nowrap text-[10.5px]">
                        {item.merkType}
                      </td>

                      {/* STATUS (DROPDOWN / STOK, BELI BARU) */}
                      <td className="px-2.5 py-1.5 whitespace-nowrap">
                        {item.status === 'Stok' ? (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9.5px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>Stok</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Beli Baru</span>
                          </span>
                        )}
                      </td>

                      {/* KONDISI ALAT KERJA (DROPDOWN / BARU / RUSAK) */}
                      <td className="px-2.5 py-1.5 whitespace-nowrap">
                        {item.kondisiAlat === 'Baru' ? (
                          <span className="px-2.5 py-0.5 text-[9.5px] font-black rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Baru</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[9.5px] font-black rounded-full bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Rusak</span>
                          </span>
                        )}
                      </td>

                      {/* JUMLAH */}
                      <td className="px-2.5 py-1.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-black text-slate-800 bg-slate-100 border border-slate-200 text-xs tabular-nums">
                          {item.jumlah}{' '}
                          <span className="text-[9px] font-semibold text-slate-500 ml-1">
                            Unit
                          </span>
                        </span>
                      </td>

                      {/* TANGGAL */}
                      <td className="px-2.5 py-1.5 text-[10px] text-slate-600 font-mono whitespace-nowrap">
                        {item.tanggal}
                      </td>

                      {/* KETERANGAN */}
                      <td
                        className="px-2.5 py-1.5 text-[10.5px] text-slate-600 max-w-xs truncate"
                        title={item.keterangan || ''}
                      >
                        {item.keterangan || '-'}
                      </td>

                      {/* AKSI (EDIT & HAPUS KHUSUS ADMIN) */}
                      <td className="px-2.5 py-1.5 text-center space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title={currentUser.isAdmin ? 'Edit Data' : 'Edit (Khusus Admin)'}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title={currentUser.isAdmin ? 'Hapus Data' : 'Hapus (Khusus Admin)'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Foto Preview Modal */}
      {activePhotoItem && (
        <div
          onClick={() => setActivePhotoItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-300" />
                <h3 className="font-extrabold text-xs sm:text-sm">Dokumentasi Alat Kerja</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoItem(null)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[200px]">
              {activePhotoItem.foto ? (
                <img
                  src={activePhotoItem.foto}
                  alt={activePhotoItem.alatKerja}
                  className="max-h-[300px] max-w-full rounded-lg object-contain shadow-md"
                />
              ) : (
                <div className="text-slate-400 text-xs text-center">Belum ada eviden foto</div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">{activePhotoItem.alatKerja}</h4>
                  <p className="text-slate-500 font-mono text-[10.5px]">{activePhotoItem.merkType}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activePhotoItem.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      activePhotoItem.kondisiAlat === 'Baru'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border border-rose-300'
                    }`}
                  >
                    {activePhotoItem.kondisiAlat}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 text-[10px]">
                <div>
                  <span className="text-slate-400">Jumlah Unit:</span>
                  <p className="font-bold text-slate-800">{activePhotoItem.jumlah} Unit</p>
                </div>
                <div>
                  <span className="text-slate-400">Tanggal Pencatatan:</span>
                  <p className="font-bold text-slate-800">{activePhotoItem.tanggal}</p>
                </div>
              </div>

              {activePhotoItem.keterangan && (
                <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700">Keterangan: </span>
                  {activePhotoItem.keterangan}
                </p>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActivePhotoItem(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-semibold text-[10.5px] hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
