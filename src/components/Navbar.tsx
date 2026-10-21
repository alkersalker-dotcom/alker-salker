import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Users,
  FileSpreadsheet,
  PlusCircle,
  ScanBarcode,
  Layers,
  Clock,
  Warehouse,
} from 'lucide-react';

import { LogOut, UserCheck } from 'lucide-react';

interface CurrentUser {
  name: string;
  unit: 'ASSURANCE' | 'PROVISIONING';
  sto: string;
}

interface NavbarProps {
  currentUser: CurrentUser | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: (type: 'MASUK' | 'KELUAR') => void;
  onOpenBarcodeScanner: () => void;
  onLogout: () => void;
  criticalStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenBarcodeScanner,
  onLogout,
  criticalStockCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }) + ' • ' +
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'keluar', label: 'Barang Keluar', icon: ArrowUpRight, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'masuk', label: 'Barang Masuk', icon: ArrowDownLeft, badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'inventory', label: 'Katalog Stok', icon: Package, alertCount: criticalStockCount },
    { id: 'technicians', label: 'Posisi Alat / Teknisi', icon: Users },
    { id: 'reports', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
  ];

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-3 flex-wrap lg:flex-nowrap">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img src="/PT KES.jpg" alt="PT KES" className="w-10 h-10 rounded-full bg-white object-contain p-1 shadow-md" />            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  LOGISTIK GUDANG
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Sistem Keluar Masuk Barang & Alat Kerja</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline text-indigo-300 font-mono text-[11px]">{currentTime}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenBarcodeScanner}
              type="button"
              className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 shadow-sm"
              title="Cari Cepat & Scan Barcode"
            >
              <ScanBarcode className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Scan SKU</span>
            </button>

            {/* Quick Barang Masuk */}
            <button
              onClick={() => onOpenNewTransaction('MASUK')}
              type="button"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-900/30 border border-emerald-400/30 cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Catat</span>
              <span>Barang Masuk</span>
            </button>

            {/* Quick Barang Keluar */}
            <button
              onClick={() => onOpenNewTransaction('KELUAR')}
              type="button"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-900/30 border border-indigo-400/30 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="hidden sm:inline">Catat</span>
              <span>Barang Keluar</span>
            </button>

            {/* Logged in User Card & Logout */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-slate-800/90 py-1 px-2.5 rounded-xl border border-slate-700/80 ml-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-extrabold text-white leading-tight max-w-[130px] truncate uppercase">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-semibold uppercase leading-none">
                    {currentUser.unit} • STO {currentUser.sto}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  type="button"
                  className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 rounded-lg transition ml-1"
                  title="Keluar / Ganti Akun Teknisi"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.alertCount !== undefined && item.alertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
                    {item.alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
