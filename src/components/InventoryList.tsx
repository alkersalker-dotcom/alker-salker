import React, { useState } from 'react';
import {
  Package,
  Search,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Barcode,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { ITEM_CATEGORIES } from '../data/initialData';
import { exportInventoryToExcel } from '../utils/formatters';

interface InventoryListProps {
  items: InventoryItem[];
  onOpenAddItem: () => void;
  onOpenEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onQuickTrx: (item: InventoryItem, type: 'MASUK' | 'KELUAR') => void;
  initialFilterLowStock?: boolean;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onOpenAddItem,
  onOpenEditItem,
  onDeleteItem,
  onQuickTrx,
  initialFilterLowStock = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(initialFilterLowStock);
  const [barcodeModalItem, setBarcodeModalItem] = useState<InventoryItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesLowStock = onlyLowStock ? item.stockCurrent <= item.minStock : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Katalog Stok & Master Data Barang
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredItems.length} dari total {items.length} item dalam gudang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInventoryToExcel(filteredItems)}
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel Stok</span>
          </button>

          <button
            onClick={onOpenAddItem}
            type="button"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-900/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Kode SKU, Nama Barang, Merk, atau Lokasi Rak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Kategori</option>
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Low Stock Toggle button */}
        <button
          type="button"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            onlyLowStock
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Hanya Stok Menipis</span>
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Barang / Alat</th>
                <th className="py-3 px-4">Kategori & Merk</th>
                <th className="py-3 px-4">Lokasi Rak</th>
                <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada barang yang ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Silakan sesuaikan kata kunci atau tambah master data barang baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.stockCurrent <= item.minStock;
                  const isOutOfStock = item.stockCurrent === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5 text-indigo-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {item.code}
                              </span>
                              <button
                                onClick={() => setBarcodeModalItem(item)}
                                className="text-slate-400 hover:text-indigo-600 transition"
                                title="Lihat Barcode SKU"
                              >
                                <Barcode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5">
                              {item.name}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{item.category}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.brandModel}</p>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-base font-black ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isCritical
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.stockCurrent}
                        </span>{' '}
                        <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                        <p className="text-[10px] text-slate-400">Min: {item.minStock}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            HABIS
                          </span>
                        ) : isCritical ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            MENIPIS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            AMAN
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onQuickTrx(item, 'MASUK')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                            title="Catat Tambah Stok (Masuk)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onQuickTrx(item, 'KELUAR')}
                            className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                            title="Catat Pengeluaran (Keluar)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditItem(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Master Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Master Data"
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

      {/* Barcode Sticker Preview Modal */}
      {barcodeModalItem && (
        <div
          onClick={() => setBarcodeModalItem(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">Label Inventaris Gudang</p>
              <h4 className="font-extrabold text-sm text-slate-900 mt-1">{barcodeModalItem.name}</h4>
              <p className="text-xs text-slate-500 font-mono">{barcodeModalItem.brandModel}</p>

              {/* Barcode Graphic */}
              <div className="my-3 py-2 px-4 bg-white border border-dashed border-slate-300 rounded flex flex-col items-center">
                <div className="flex space-x-1 h-12 items-center">
                  {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
                <p className="font-mono text-sm font-black tracking-widest text-slate-800 mt-1">
                  *{barcodeModalItem.code}*
                </p>
              </div>

              <p className="text-[10px] text-slate-400">
                Lokasi: {barcodeModalItem.location} • STO BGR
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              <button
                onClick={() => window.print()}
                type="button"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                Cetak Label Stiker
              </button>
              <button
                onClick={() => setBarcodeModalItem(null)}
                type="button"
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
