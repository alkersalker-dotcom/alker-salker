import React, { useState } from 'react';
import {
  Users,
  Search,
  Wrench,
  RotateCcw,
  Package,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowDownLeft,
} from 'lucide-react';
import { InventoryItem, Technician, Transaction } from '../types/inventory';
import { formatIndoDate } from '../utils/formatters';

interface TechnicianBorrowingProps {
  technicians: Technician[];
  transactions: Transaction[];
  items: InventoryItem[];
  onReturnItem: (technicianName: string, itemDetail: { itemId: string; itemName: string; qty: number; unit: string }) => void;
}

export const TechnicianBorrowing: React.FC<TechnicianBorrowingProps> = ({
  technicians,
  transactions,
  items,
  onReturnItem,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Calculate items currently held by each technician:
  // (Total Qty Out to Tech) minus (Total Qty In / Returned by Tech)
  const technicianHoldings: Record<string, Record<string, { itemId: string; itemName: string; unit: string; qty: number; lastDate: string }>> = {};

  // Sort chronological
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTransactions.forEach((trx) => {
    const techName = trx.recipientOrSource.toUpperCase();
    if (!technicianHoldings[techName]) {
      technicianHoldings[techName] = {};
    }

    trx.items.forEach((it) => {
      if (!technicianHoldings[techName][it.itemId]) {
        technicianHoldings[techName][it.itemId] = {
          itemId: it.itemId,
          itemName: it.itemName,
          unit: it.unit,
          qty: 0,
          lastDate: trx.date,
        };
      }

      if (trx.type === 'KELUAR') {
        technicianHoldings[techName][it.itemId].qty += it.qty;
        technicianHoldings[techName][it.itemId].lastDate = trx.date;
      } else {
        // Returned
        technicianHoldings[techName][it.itemId].qty = Math.max(
          0,
          technicianHoldings[techName][it.itemId].qty - it.qty
        );
      }
    });
  });

  const filteredTechnicians = technicians.filter((tek) => {
    const matchesSearch =
      tek.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tek.sto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUnit = selectedUnit === '' || tek.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Monitoring Posisi Alat & Peminjaman Teknisi
            </h2>
            <p className="text-xs text-slate-500">
              Lacak alat kerja (Splicer, OPM, Tangga, dll.) yang sedang dibawa teknisi di lapangan
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nama Teknisi atau STO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Unit</option>
          <option value="ASSURANCE">ASSURANCE</option>
          <option value="PROVISIONING">PROVISIONING</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      {/* Grid of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechnicians.map((tek) => {
          const rawItems = technicianHoldings[tek.name.toUpperCase()] || {};
          const activeHeldItems = Object.values(rawItems).filter((it) => it.qty > 0);

          return (
            <div
              key={tek.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {tek.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase">{tek.name}</h3>
                    <p className="text-[10px] text-slate-400">
                      STO {tek.sto} • <span className="font-semibold text-indigo-600">{tek.unit}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeHeldItems.length > 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {activeHeldItems.length > 0 ? `${activeHeldItems.length} Macam Alat` : 'Bebas Pinjaman'}
                </span>
              </div>

              {/* Body: Items held */}
              <div className="p-4 flex-1 space-y-2 text-xs">
                {activeHeldItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-70" />
                    <p className="font-semibold text-slate-600">Tidak ada barang/alat yang dibawa</p>
                    <p className="text-[10px] text-slate-400">Semua alat sudah dikembalikan ke gudang.</p>
                  </div>
                ) : (
                  activeHeldItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.itemName}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Dipinjam: {formatIndoDate(item.lastDate)}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.qty} {item.unit}
                        </span>

                        <button
                          onClick={() =>
                            onReturnItem(tek.name, {
                              itemId: item.itemId,
                              itemName: item.itemName,
                              qty: item.qty,
                              unit: item.unit,
                            })
                          }
                          type="button"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Catat Pengembalian Barang ke Gudang"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retur</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
