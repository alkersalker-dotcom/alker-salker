import React, { useState } from 'react';
import {
  Wrench,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  FileSpreadsheet,
  PlusCircle,
  FolderOpen,
  Edit3,
  Trash2,
  Download,
  LogOut,
  X,
  Smartphone,
  Apple,
  Camera,
  Eye,
  Sparkles,
  ShieldAlert,
  Lock,
  ShoppingBag,
  ClipboardList,
  RefreshCw,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { AlkerItem, UserSession, StokPembelianItem, RekapStokAlkerItem } from '../types/inventory';
import { exportAlkerToExcel } from '../data/initialData';
import { createToolEvidenceSvg } from '../utils/photoEvidence';
import { StokPembelianView } from './StokPembelianView';
import { StokPembelianModal } from './StokPembelianModal';
import { RekapStokAlkerView } from './RekapStokAlkerView';
import { RekapStokAlkerModal } from './RekapStokAlkerModal';

interface AlkerDashboardProps {
  currentUser: UserSession;
  alkerData: AlkerItem[];
  stokData: StokPembelianItem[];
  rekapData: RekapStokAlkerItem[];
  onOpenAddModal: () => void;
  onEditItem: (item: AlkerItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemFoto: (id: string, fotoBase64: string) => void;
  onSaveStokItem: (item: StokPembelianItem) => void;
  onDeleteStokItem: (id: string) => void;
  onSaveRekapItem: (item: RekapStokAlkerItem) => void;
  onDeleteRekapItem: (id: string) => void;
  onLogout: () => void;
  syncStatus?: 'connected' | 'syncing' | 'offline';
  lastSyncedTime?: string;
  onManualSync?: () => void;
}

export const AlkerDashboard: React.FC<AlkerDashboardProps> = ({
  currentUser,
  alkerData,
  stokData,
  rekapData,
  onOpenAddModal,
  onEditItem,
  onDeleteItem,
  onUpdateItemFoto,
  onSaveStokItem,
  onDeleteStokItem,
  onSaveRekapItem,
  onDeleteRekapItem,
  onLogout,
  syncStatus = 'connected',
  lastSyncedTime,
  onManualSync,
}) => {
  // Main Tab: 'MONITORING' | 'STOK_PEMBELIAN' | 'REKAP_STOK'
  const [activeMainTab, setActiveMainTab] = useState<'MONITORING' | 'STOK_PEMBELIAN' | 'REKAP_STOK'>('MONITORING');

  // Stok Modal State
  const [isStokModalOpen, setIsStokModalOpen] = useState<boolean>(false);
  const [stokItemToEdit, setStokItemToEdit] = useState<StokPembelianItem | null>(null);

  // Rekap Stok Modal State
  const [isRekapModalOpen, setIsRekapModalOpen] = useState<boolean>(false);
  const [rekapItemToEdit, setRekapItemToEdit] = useState<RekapStokAlkerItem | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [posisiFilter, setPosisiFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewScope, setViewScope] = useState<'PERSONAL' | 'ALL'>(
    currentUser.isAdmin ? 'ALL' : 'PERSONAL'
  );

  // Photo viewer lightbox state
  const [activePhotoItem, setActivePhotoItem] = useState<AlkerItem | null>(null);

  // PWA install guide modal
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);

  // Restricted Access Modal for Edit & Delete (Admin Only)
  const [showRestrictedModal, setShowRestrictedModal] = useState<boolean>(false);
  const [attemptedAction, setAttemptedAction] = useState<'Edit' | 'Hapus'>('Edit');

  // Scope data: By default for technicians, show items checked out / di-bon under their name
  const scopedData =
    viewScope === 'PERSONAL' && !currentUser.isAdmin
      ? alkerData.filter(
          (d) => d.teknisi && d.teknisi.toUpperCase() === currentUser.name.toUpperCase()
        )
      : alkerData;

  // Stats calculation based on active scope
  const totalCount = scopedData.length;
  const layakCount = scopedData.filter((d) => d.status === 'Layak').length;
  const rusakCount = scopedData.filter((d) => d.status === 'Rusak').length;
  const tidakAdaCount = scopedData.filter((d) => d.status === 'Tidak Ada').length;

  // Filtered rows for table
  const filteredData = scopedData.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (item.alatKerja && item.alatKerja.toLowerCase().includes(term)) ||
      (item.teknisi && item.teknisi.toLowerCase().includes(term)) ||
      (item.sto && item.sto.toLowerCase().includes(term)) ||
      (item.merkType && item.merkType.toLowerCase().includes(term)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(term));

    const matchesPosisi = posisiFilter === '' || item.posisiAlker === posisiFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;

    return matchesSearch && matchesPosisi && matchesStatus;
  });

  const handleExport = () => {
    if (scopedData.length === 0) {
      alert('Belum ada data untuk diekspor!');
      return;
    }
    const title = currentUser.isAdmin
      ? 'LAPORAN SELURUH DATABASE ALAT KERJA TEKNISI'
      : `LAPORAN CEK ALAT KERJA - ${currentUser.name}`;
    exportAlkerToExcel(scopedData, title);
  };

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateItemFoto(itemId, base64);
        if (activePhotoItem && activePhotoItem.id === itemId) {
          setActivePhotoItem({ ...activePhotoItem, foto: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (item: AlkerItem) => {
    if (!currentUser.isAdmin) {
      setAttemptedAction('Edit');
      setShowRestrictedModal(true);
      return;
    }
    onEditItem(item);
  };

  const handleDeleteClick = (item: AlkerItem) => {
    if (!currentUser.isAdmin) {
      setAttemptedAction('Hapus');
      setShowRestrictedModal(true);
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus data "${item.alatKerja}" ini?`)) {
      onDeleteItem(item.id);
    }
  };

  const handleOpenAddStok = () => {
    setStokItemToEdit(null);
    setIsStokModalOpen(true);
  };

  const handleOpenEditStok = (item: StokPembelianItem) => {
    if (!currentUser.isAdmin) {
      setAttemptedAction('Edit');
      setShowRestrictedModal(true);
      return;
    }
    setStokItemToEdit(item);
    setIsStokModalOpen(true);
  };

  const handleOpenAddRekap = () => {
    setRekapItemToEdit(null);
    setIsRekapModalOpen(true);
  };

  const handleOpenEditRekap = (item: RekapStokAlkerItem) => {
    if (!currentUser.isAdmin) {
      setAttemptedAction('Edit');
      setShowRestrictedModal(true);
      return;
    }
    setRekapItemToEdit(item);
    setIsRekapModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* 2. Top Header Navigation Bar ("Posisi Judul dibuatkan Semanis Mungkin, Nama yang login terlihat jelas") */}
      <header className="bg-gradient-to-r from-[#221c68] via-[#312a91] to-[#3f34bd] text-white shadow-xl sticky top-0 z-30 border-b border-indigo-400/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap md:flex-nowrap">
            
            {/* Logo & Judul "Cek Alat Kerja" dibuat semanis mungkin dengan font pas */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md border border-indigo-300/40 flex items-center justify-center">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white drop-shadow-sm">
                    Cek Alat Kerja
                  </h1>
                </div>
                <p className="text-[9px] sm:text-[9.5px] text-indigo-200 font-medium tracking-wide">
                  Sistem Monitoring Alat Kerja
                </p>
              </div>
            </div>

            {/* Menu Tab & Cloud Sync Status */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-indigo-950/80 p-0.5 rounded-xl border border-indigo-400/20 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setActiveMainTab('MONITORING')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    activeMainTab === 'MONITORING'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Monitoring Alker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMainTab('STOK_PEMBELIAN')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    activeMainTab === 'STOK_PEMBELIAN'
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-xs font-black'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Stok & Pembelian</span>
                </button>

                {/* 3. REKAP STOK ALKER TAB BARU */}
                <button
                  type="button"
                  onClick={() => setActiveMainTab('REKAP_STOK')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    activeMainTab === 'REKAP_STOK'
                      ? 'bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Rekap Stok Alker</span>
                </button>
              </div>

              {/* Multi-Device Cloud Sync Indicator & Force Sync Button */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={onManualSync}
                  title={`Status Penyimpanan: ${
                    syncStatus === 'connected'
                      ? 'Tersambung ke Database Terpusat (Data sama di semua perangkat HP/Laptop). Klik untuk sinkronkan sekarang.'
                      : syncStatus === 'syncing'
                      ? 'Sedang menyinkronkan data antar-perangkat...'
                      : 'Mode Offline (Data tersimpan di perangkat ini). Klik untuk menghubungkan ulang.'
                  }${lastSyncedTime ? ` | Terakhir: ${lastSyncedTime}` : ''}`}
                  className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] font-semibold border transition shadow-inner cursor-pointer ${
                    syncStatus === 'connected'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:bg-amber-900/80'
                      : 'bg-slate-900/80 text-slate-300 border-slate-600/50 hover:bg-slate-800'
                  }`}
                >
                  {syncStatus === 'connected' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <Cloud className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="hidden sm:inline">Multi-Device Aktif</span>
                      <span className="sm:hidden">Sync OK</span>
                    </>
                  ) : syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                      <span className="hidden sm:inline">Menyinkronkan...</span>
                      <span className="sm:hidden">Sync...</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="hidden sm:inline">Offline (Lokal)</span>
                      <span className="sm:hidden">Offline</span>
                    </>
                  )}
                  {onManualSync && (
                    <RefreshCw
                      className={`w-2.5 h-2.5 ml-0.5 opacity-70 hover:opacity-100 ${
                        syncStatus === 'syncing' ? 'animate-spin' : ''
                      }`}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* User Info Prominen & Tombol Logout */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-auto md:ml-0">

              {/* KARTU NAMA USER YANG LOGIN (DIBUAT SANGAT JELAS & PROMINEN DENGAN UKURAN MANIS) */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-900/90 to-purple-950/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border-2 border-indigo-400/40 text-xs shadow-md">
                {/* Avatar Inisial */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[11px] sm:text-xs shrink-0 shadow-sm ${
                    currentUser.isAdmin
                      ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                      : 'bg-gradient-to-tr from-indigo-400 to-emerald-400 text-slate-950 ring-2 ring-emerald-300'
                  }`}
                >
                  {currentUser.isAdmin ? 'A' : currentUser.name.charAt(0)}
                </div>

                {/* Nama & Unit Teknisi Jelas */}
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <p className="font-black text-white text-[11px] sm:text-xs tracking-wide uppercase leading-tight max-w-[130px] sm:max-w-none truncate">
                      {currentUser.name}
                    </p>
                    {currentUser.isAdmin && (
                      <span className="bg-amber-400 text-slate-900 font-black text-[8px] px-1 py-0.2 rounded uppercase tracking-wider">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/60 px-1 py-0.2 rounded uppercase border border-emerald-500/30">
                      {currentUser.unit}
                    </span>
                    {currentUser.sto && (
                      <span className="text-[9px] text-indigo-200 font-mono">
                        • STO {currentUser.sto}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tombol Logout */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-0.5 p-1 text-rose-300 hover:text-white hover:bg-rose-500/30 rounded-lg transition cursor-pointer"
                  title="Keluar / Ganti Akun Teknisi"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tambah Data Button (Dinamis Sesuai Tab Aktif) */}
              <button
                type="button"
                onClick={() => {
                  if (activeMainTab === 'MONITORING') {
                    onOpenAddModal();
                  } else if (activeMainTab === 'STOK_PEMBELIAN') {
                    handleOpenAddStok();
                  } else {
                    handleOpenAddRekap();
                  }
                }}
                className={`text-white font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-md transition flex items-center space-x-1 text-xs border cursor-pointer ${
                  activeMainTab === 'MONITORING'
                    ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 border-emerald-300/40'
                    : activeMainTab === 'STOK_PEMBELIAN'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 border-teal-300/40'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-amber-300/40'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>
                  {activeMainTab === 'MONITORING'
                    ? 'Tambah Data'
                    : activeMainTab === 'STOK_PEMBELIAN'
                    ? 'Input Data Stok & Beli'
                    : 'Input Rekap Alker'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3">
        {activeMainTab === 'MONITORING' ? (
          <>
            {/* Banner Info Bon Teknisi */}
            {!currentUser.isAdmin && (
          <div className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 border border-indigo-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-indigo-600 text-white rounded-md text-[10px] shadow-2xs">
                📌
              </span>
              <div>
                <p className="text-[11px] font-bold text-slate-800">
                  Daftar Alat Kerja yang Sedang di-Bon oleh <span className="text-indigo-700 uppercase">{currentUser.name}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Tercatat {totalCount} item alker fisik dengan eviden foto aktif.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setViewScope(viewScope === 'PERSONAL' ? 'ALL' : 'PERSONAL')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition cursor-pointer"
              >
                {viewScope === 'PERSONAL' ? 'Lihat Semua Teknisi' : 'Hanya Bon Saya'}
              </button>
            </div>
          </div>
        )}

        {/* 1. UKURAN STATISTIK DIKECILKAN AGAR TIDAK MEMAKAN TEMPAT & TERLIHAT KEREN (Gambar 1) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. TOTAL ITEM ALKER */}
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  TOTAL ITEM ALKER
                </p>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight mt-0.5">
                  {totalCount}
                </h3>
              </div>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Boxes className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
              <span className="text-indigo-500">👤</span>
              <span>
                {viewScope === 'ALL' || currentUser.isAdmin
                  ? 'Seluruh Database Teknisi'
                  : 'Data Personal Teknisi'}
              </span>
            </p>
          </div>

          {/* 2. STATUS LAYAK */}
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  STATUS LAYAK
                </p>
                <h3 className="text-lg sm:text-xl font-black text-emerald-600 leading-tight mt-0.5">
                  {layakCount}
                </h3>
              </div>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
              <span className="text-emerald-500">✓</span>
              <span>Siap digunakan</span>
            </p>
          </div>

          {/* 3. STATUS RUSAK */}
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  STATUS RUSAK
                </p>
                <h3 className="text-lg sm:text-xl font-black text-amber-600 leading-tight mt-0.5">
                  {rusakCount}
                </h3>
              </div>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
              <span className="text-amber-500">🔑</span>
              <span>Butuh perbaikan</span>
            </p>
          </div>

          {/* 4. TIDAK ADA / HILANG */}
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  TIDAK ADA / HILANG
                </p>
                <h3 className="text-lg sm:text-xl font-black text-rose-600 leading-tight mt-0.5">
                  {tidakAdaCount}
                </h3>
              </div>
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center space-x-1 font-medium">
              <span className="text-rose-500">ⓘ</span>
              <span>Konfirmasi teknisi</span>
            </p>
          </div>
        </div>

        {/* Filter and Search Bar dengan Ukuran Font Manis */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan Alat, Teknisi, atau STO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition placeholder:text-[11px]"
            />
          </div>

          {/* Filter Dropdowns and Export */}
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={posisiFilter}
              onChange={(e) => setPosisiFilter(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none cursor-pointer"
            >
              <option value="">Semua Posisi</option>
              <option value="Teknisi">Teknisi</option>
              <option value="WH">WH (Warehouse)</option>
              <option value="Service">Service</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Layak">Layak</option>
              <option value="Rusak">Rusak</option>
              <option value="Tidak Ada">Tidak Ada</option>
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

        {/* DATABASE TABLE: KOLOM HEADER DENGAN WARNA INDAH & ELEGAN, SERTA FONT MANIS DIPERKECIL */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {/* Kolom Header (Judul) Berwarna Indah & Elegan (Gradasi Multi-Warna Mewah dengan Pembatas Halus) */}
              <thead className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] via-[#4338ca] to-[#3b0764] text-white border-b-2 border-indigo-400/50 uppercase tracking-wider shadow-sm">
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
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-indigo-100">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-sky-300">🏷️</span>
                      <span>MERK / TYPE</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-cyan-200">
                    <span className="inline-flex items-center gap-1">
                      <span>📍</span>
                      <span>POSISI ALKER</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-amber-300">
                    <span className="inline-flex items-center gap-1">
                      <span>👤</span>
                      <span>TEKNISI</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-emerald-300">
                    <span className="inline-flex items-center gap-1">
                      <span>🏢</span>
                      <span>UNIT</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-sky-200">
                    <span className="inline-flex items-center gap-1">
                      <span>🌐</span>
                      <span>STO</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-emerald-300">
                    <span className="inline-flex items-center gap-1">
                      <span>⚡</span>
                      <span>STATUS</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 text-indigo-100">
                    <span className="inline-flex items-center gap-1">
                      <span>📝</span>
                      <span>KETERANGAN</span>
                    </span>
                  </th>
                  <th className="px-2.5 py-2.5 whitespace-nowrap text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <span>⏱️</span>
                      <span>TIMESTAMP</span>
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
                    <td colSpan={11} className="py-12 text-center">
                      <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-sm font-bold text-slate-700">
                        Belum ada data alat kerja untuk Anda
                      </p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                        Alat yang Anda bon akan muncul di sini lengkap dengan eviden foto. Klik tombol "Tambah Data" di atas untuk menambahkan alker baru.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Data Alker Sekarang</span>
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
                        item.teknisi,
                        item.updatedAt
                      );

                    return (
                      <tr key={item.id} className="hover:bg-indigo-50/40 transition group">
                        {/* FOTO EVIDEN (SELALU TERSEDIA DENGAN THUMBNAIL BERSIH & JELAS) */}
                        <td className="px-2.5 py-1.5 whitespace-nowrap text-center">
                          <div className="relative group/photo inline-block">
                            <img
                              src={effectiveFoto}
                              onClick={() =>
                                setActivePhotoItem({ ...item, foto: effectiveFoto })
                              }
                              className="w-9 h-9 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-indigo-500 transition border border-slate-200 shadow-2xs"
                              alt="Foto Eviden"
                            />
                            <div
                              onClick={() =>
                                setActivePhotoItem({ ...item, foto: effectiveFoto })
                              }
                              className="absolute inset-0 bg-black/45 rounded-lg flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition cursor-pointer text-white"
                              title="Buka Foto Eviden Penuh"
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

                        {/* POSISI ALKER */}
                        <td className="px-2.5 py-1.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-bold text-[9.5px] text-slate-700">
                            {item.posisiAlker}
                          </span>
                        </td>

                        {/* TEKNISI */}
                        <td className="px-2.5 py-1.5 font-black text-indigo-700 uppercase whitespace-nowrap text-[11px]">
                          {item.teknisi}
                        </td>

                        {/* UNIT */}
                        <td className="px-2.5 py-1.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9.5px] font-black uppercase border border-indigo-200">
                            {item.unit}
                          </span>
                        </td>

                        {/* STO */}
                        <td className="px-2.5 py-1.5 font-mono text-[10.5px] font-black text-slate-700 uppercase whitespace-nowrap">
                          {item.sto}
                        </td>

                        {/* STATUS */}
                        <td className="px-2.5 py-1.5 whitespace-nowrap">
                          {item.status === 'Layak' ? (
                            <span className="px-2 py-0.5 text-[9.5px] font-black rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                              Layak
                            </span>
                          ) : item.status === 'Rusak' ? (
                            <span className="px-2 py-0.5 text-[9.5px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                              Rusak
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9.5px] font-black rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                              Tidak Ada
                            </span>
                          )}
                        </td>

                        {/* KETERANGAN */}
                        <td
                          className="px-2.5 py-1.5 text-[10.5px] text-slate-600 max-w-xs truncate"
                          title={item.keterangan || ''}
                        >
                          {item.keterangan || '-'}
                        </td>

                        {/* TIMESTAMP */}
                        <td className="px-2.5 py-1.5 text-[9.5px] text-slate-500 font-mono whitespace-nowrap">
                          {item.updatedAt}
                        </td>

                        {/* AKSI */}
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
          </>
        ) : activeMainTab === 'STOK_PEMBELIAN' ? (
          <StokPembelianView
            currentUser={currentUser}
            data={stokData}
            onOpenAddModal={handleOpenAddStok}
            onEditItem={handleOpenEditStok}
            onDeleteItem={onDeleteStokItem}
            onShowRestrictedModal={() => {
              setAttemptedAction('Edit');
              setShowRestrictedModal(true);
            }}
          />
        ) : (
          <RekapStokAlkerView
            currentUser={currentUser}
            data={rekapData}
            alkerData={alkerData}
            stokData={stokData}
            onOpenAddModal={handleOpenAddRekap}
            onEditItem={handleOpenEditRekap}
            onDeleteItem={onDeleteRekapItem}
            onShowRestrictedModal={() => {
              setAttemptedAction('Edit');
              setShowRestrictedModal(true);
            }}
          />
        )}
      </main>

      {/* MODAL EVIDEN FOTO DENGAN HEADER BERWARNA-WARNI INDAH & FONT MANIS */}
      {activePhotoItem && (
        <div
          onClick={() => setActivePhotoItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header Berwarna-warni Indah */}
            <div className="px-4 py-3 bg-gradient-to-r from-violet-600 via-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center space-x-2 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-300">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-wide text-white">
                    Eviden Foto Alat Kerja
                  </h3>
                  <p className="text-[9px] text-pink-100 font-medium">Dokumentasi fisik inventaris alker</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoItem(null)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition relative z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Photo preview */}
            <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[200px]">
              {activePhotoItem.foto ? (
                <img
                  src={activePhotoItem.foto}
                  alt={activePhotoItem.alatKerja}
                  className="max-h-[320px] max-w-full rounded-lg object-contain shadow-md"
                />
              ) : (
                <div className="text-slate-400 text-xs text-center">Belum ada eviden foto</div>
              )}
            </div>

            {/* Information about this checked out item */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">{activePhotoItem.alatKerja}</h4>
                  <p className="text-slate-500 font-mono text-[10.5px]">{activePhotoItem.merkType}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                    activePhotoItem.status === 'Layak'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activePhotoItem.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 text-[10px]">
                <div>
                  <span className="text-slate-400">Teknisi Pengambil:</span>
                  <p className="font-bold text-slate-800 uppercase">{activePhotoItem.teknisi}</p>
                </div>
                <div>
                  <span className="text-slate-400">Unit & Lokasi:</span>
                  <p className="font-bold text-slate-800">{activePhotoItem.unit} • STO {activePhotoItem.sto}</p>
                </div>
              </div>

              {activePhotoItem.keterangan && (
                <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700">Catatan: </span>
                  {activePhotoItem.keterangan}
                </p>
              )}

              {/* Upload new photo button */}
              <div className="pt-1.5 flex items-center justify-between">
                <label className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-[10.5px] flex items-center space-x-1.5 cursor-pointer shadow-xs">
                  <Camera className="w-3 h-3" />
                  <span>Upload Foto Baru</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleQuickUpload(e, activePhotoItem.id)}
                    className="hidden"
                  />
                </label>
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

      {/* PWA Install Guide Modal Berwarna-warni Indah & Font Manis */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-200">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">Instal Aplikasi di HP</h3>
                  <p className="text-[9px] text-sky-100 font-medium">Akses cepat offline & online</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-[11px] text-slate-700">
              <p className="font-semibold text-slate-800 text-xs">
                Aplikasi ini dapat diinstal langsung ke layar utama HP Android/iOS (Progressive Web App).
              </p>

              <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-1">
                <p className="font-bold text-indigo-700 flex items-center space-x-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cara Pasang di Android (Chrome):</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                  <li>Ketuk titik tiga (⋮) di pojok kanan atas browser.</li>
                  <li>Pilih menu "Tambahkan ke Layar Utama" atau "Instal Aplikasi".</li>
                </ol>
              </div>

              <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-1">
                <p className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                  <Apple className="w-3.5 h-3.5 text-slate-700" />
                  <span>Cara Pasang di iPhone (Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                  <li>Ketuk tombol Bagikan (Share) di browser Safari.</li>
                  <li>Pilih "Tambahkan ke Layar Utama" (Add to Home Screen).</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERINGATAN HAK AKSES EDIT & HAPUS (KHUSUS ADMIN) */}
      {showRestrictedModal && (
        <div
          onClick={() => setShowRestrictedModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-slate-800 flex flex-col transform animate-in zoom-in-95 duration-150"
          >
            {/* Header Pop-up Berwarna-warni Indah & Elegan */}
            <div className="px-4 py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center space-x-2 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-200 shadow-inner">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-wide text-white">
                    Pemberitahuan Wewenang
                  </h3>
                  <p className="text-[9px] text-rose-100 font-medium">Sistem Hak Akses & Kapasitas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestrictedModal(false)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition relative z-10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body dengan Pesan Wajib Sesuai Permintaan */}
            <div className="p-4 sm:p-5 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-rose-700 tracking-tight leading-snug">
                  "Maaf Untuk Edit & Hapus Bukan Kapasitas Anda"
                </h4>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Fungsi <span className="font-bold text-slate-800">Edit</span> dan{' '}
                  <span className="font-bold text-slate-800">Hapus</span> data alat kerja hanya dapat dilakukan oleh akun <span className="font-bold text-indigo-700">ADMIN</span>.
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
                  Akun aktif: <span className="font-bold text-slate-700 uppercase">{currentUser.name}</span> ({currentUser.unit})
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowRestrictedModal(false)}
                  className="w-full py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT & EDIT DATA STOK & PEMBELIAN ALAT KERJA */}
      <StokPembelianModal
        isOpen={isStokModalOpen}
        itemToEdit={stokItemToEdit}
        currentUser={currentUser}
        onClose={() => setIsStokModalOpen(false)}
        onSave={(savedItem) => {
          onSaveStokItem(savedItem);
          setIsStokModalOpen(false);
        }}
      />

      {/* MODAL INPUT & EDIT REKAP STOK ALKER */}
      <RekapStokAlkerModal
        isOpen={isRekapModalOpen}
        itemToEdit={rekapItemToEdit}
        currentUser={currentUser}
        onClose={() => setIsRekapModalOpen(false)}
        onSave={(savedItem) => {
          onSaveRekapItem(savedItem);
          setIsRekapModalOpen(false);
        }}
      />
    </div>
  );
};
