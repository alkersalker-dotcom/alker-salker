import React from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileText,
  Printer,
  ChevronRight,
  ShieldAlert,
  PackageCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem, Transaction } from '../types/inventory';
import { formatIndoDate } from '../utils/formatters';

interface DashboardOverviewProps {
  items: InventoryItem[];
  transactions: Transaction[];
  onOpenNewTransaction: (type: 'MASUK' | 'KELUAR') => void;
  onViewSuratJalan: (trx: Transaction) => void;
  onNavigateTab: (tab: string) => void;
  onFilterLowStock: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  items,
  transactions,
  onOpenNewTransaction,
  onViewSuratJalan,
  onNavigateTab,
  onFilterLowStock,
}) => {
  // Aggregate stats
  const totalSku = items.length;
  const totalPhysicalStock = items.reduce((acc, it) => acc + it.stockCurrent, 0);

  const lowStockItems = items.filter((it) => it.stockCurrent <= it.minStock);

  // Transactions counts
  const trxMasuk = transactions.filter((t) => t.type === 'MASUK');
  const trxKeluar = transactions.filter((t) => t.type === 'KELUAR');

  const totalQtyKeluar = trxKeluar.reduce(
    (acc, t) => acc + t.items.reduce((sum, it) => sum + it.qty, 0),
    0
  );
  const totalQtyMasuk = trxMasuk.reduce(
    (acc, t) => acc + t.items.reduce((sum, it) => sum + it.qty, 0),
    0
  );

  // Category breakdown
  const categoryStats = items.reduce<Record<string, { count: number; stock: number }>>((acc, it) => {
    if (!acc[it.category]) {
      acc[it.category] = { count: 0, stock: 0 };
    }
    acc[it.category].count += 1;
    acc[it.category].stock += it.stockCurrent;
    return acc;
  }, {});

  // Fast-moving calculation: items most frequently issued out
  const itemOutCounts: Record<string, { name: string; code: string; unit: string; totalQty: number }> = {};
  trxKeluar.forEach((t) => {
    t.items.forEach((it) => {
      if (!itemOutCounts[it.itemId]) {
        itemOutCounts[it.itemId] = {
          name: it.itemName,
          code: it.itemCode,
          unit: it.unit,
          totalQty: 0,
        };
      }
      itemOutCounts[it.itemId].totalQty += it.qty;
    });
  });

  const fastMoving = Object.values(itemOutCounts)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 4);

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Low Stock (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-300/80 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                Peringatan: Ada {lowStockItems.length} Item Barang dengan Stok Menipis / Kritis!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Beberapa alat kerja atau material (seperti{' '}
                <span className="font-semibold">{lowStockItems[0]?.name}</span>) telah mencapai batas minimum.
              </p>
            </div>
          </div>
          <button
            onClick={onFilterLowStock}
            type="button"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Tinjau Stok Kritis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total SKU & Fisik */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Katalog Barang
            </p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalSku}</h3>
            <span className="text-xs font-semibold text-slate-500">SKU / Item</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <PackageCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Total fisik: <b>{totalPhysicalStock}</b> unit/pcs</span>
          </p>
        </div>

        {/* Barang Keluar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Barang Keluar
            </p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600">{totalQtyKeluar}</h3>
            <span className="text-xs font-semibold text-slate-500">Unit Keluar</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Tercatat <b>{trxKeluar.length}</b> kali pengeluaran</span>
          </p>
        </div>

        {/* Barang Masuk */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Barang Masuk
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{totalQtyMasuk}</h3>
            <span className="text-xs font-semibold text-slate-500">Unit Masuk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tercatat <b>{trxMasuk.length}</b> kali pasokan/retur</span>
          </p>
        </div>

        {/* Stok Menipis */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Stok Kritis / Menipis
            </p>
            <div
              className={`p-2 rounded-xl ${
                lowStockItems.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3
              className={`text-2xl sm:text-3xl font-extrabold ${
                lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-700'
              }`}
            >
              {lowStockItems.length}
            </h3>
            <span className="text-xs font-semibold text-slate-500">Item Perlu Restock</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            {lowStockItems.length > 0 ? (
              <span className="text-amber-600 font-semibold">Segera ajukan restock logistik</span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Semua stok di atas ambang aman
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Aktivitas Transaksi Terkini
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('keluar')}
              type="button"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {recentTransactions.map((trx) => {
              const isMasuk = trx.type === 'MASUK';
              const totalItemsInTrx = trx.items.reduce((s, i) => s + i.qty, 0);

              return (
                <div
                  key={trx.id}
                  className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isMasuk ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {trx.transactionNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isMasuk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isMasuk ? 'Masuk' : 'Keluar'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatIndoDate(trx.date)}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 uppercase mt-1 truncate">
                        {trx.recipientOrSource}
                        <span className="text-slate-400 font-normal ml-1.5 lowercase">
                          ({trx.unitOrDepartment} • STO {trx.stoLocation})
                        </span>
                      </p>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {trx.items.map((it) => `${it.itemName} (${it.qty} ${it.unit})`).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Print Surat Jalan Shortcut */}
                  <button
                    onClick={() => onViewSuratJalan(trx)}
                    type="button"
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition shrink-0 cursor-pointer"
                    title="Cetak Surat Jalan / Bukti Transaksi"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fast Moving & Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Fast-Moving Items Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-sm text-slate-900">Barang Paling Sering Keluar</h4>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Fast Moving</span>
            </div>

            <div className="space-y-3">
              {fastMoving.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">{item.code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs">
                      {item.totalQty} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <h4 className="font-bold text-sm text-slate-900 mb-3.5 flex items-center justify-between">
              <span>Sebaran Kategori Barang</span>
              <span className="text-xs font-semibold text-slate-400">{totalSku} Macam</span>
            </h4>

            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, stat], idx) => {
                const percentage = Math.round((stat.stock / (totalPhysicalStock || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate">{category}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {stat.stock} unit <span className="text-slate-400 font-normal">({stat.count} SKU)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                        style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
