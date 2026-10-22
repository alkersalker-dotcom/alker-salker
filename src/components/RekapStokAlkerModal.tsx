import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  ClipboardList,
  Layers,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Calculator,
} from 'lucide-react';
import { RekapStokAlkerItem, UserSession } from '../types/inventory';
import { DAFTAR_ALAT_KERJA } from '../data/initialData';

interface RekapStokAlkerModalProps {
  isOpen: boolean;
  itemToEdit: RekapStokAlkerItem | null;
  currentUser: UserSession;
  onClose: () => void;
  onSave: (item: RekapStokAlkerItem) => void;
}

export const RekapStokAlkerModal: React.FC<RekapStokAlkerModalProps> = ({
  isOpen,
  itemToEdit,
  currentUser,
  onClose,
  onSave,
}) => {
  const [alatKerja, setAlatKerja] = useState<string>('SPLICER');
  const [customAlatKerja, setCustomAlatKerja] = useState<string>('');
  const [merkType, setMerkType] = useState<string>('');
  const [stokGudang, setStokGudang] = useState<number>(0);
  const [beliBaru, setBeliBaru] = useState<number>(0);
  const [baru, setBaru] = useState<number>(0);
  const [layak, setLayak] = useState<number>(0);
  const [rusak, setRusak] = useState<number>(0);
  const [keterangan, setKeterangan] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Auto calculate total
  // Total is the sum of (stokGudang + beliBaru) or (baru + layak + rusak)
  const calculatedTotal = (Number(stokGudang) || 0) + (Number(beliBaru) || 0);

  useEffect(() => {
    if (itemToEdit) {
      if (DAFTAR_ALAT_KERJA.includes(itemToEdit.alatKerja as any)) {
        setAlatKerja(itemToEdit.alatKerja);
        setCustomAlatKerja('');
      } else {
        setAlatKerja('LAINNYA');
        setCustomAlatKerja(itemToEdit.alatKerja);
      }
      setMerkType(itemToEdit.merkType.toUpperCase());
      setStokGudang(itemToEdit.stokGudang);
      setBeliBaru(itemToEdit.beliBaru);
      setBaru(itemToEdit.baru);
      setLayak(itemToEdit.layak);
      setRusak(itemToEdit.rusak);
      setKeterangan(itemToEdit.keterangan || '');
    } else {
      setAlatKerja('SPLICER');
      setCustomAlatKerja('');
      setMerkType('');
      setStokGudang(0);
      setBeliBaru(0);
      setBaru(0);
      setLayak(0);
      setRusak(0);
      setKeterangan('');
    }
    setValidationError('');
  }, [itemToEdit, isOpen]);

  // When beliBaru changes on new item, we can auto-suggest baru
  const handleBeliBaruChange = (val: number) => {
    const num = Math.max(0, val);
    setBeliBaru(num);
    if (!itemToEdit && baru === 0) {
      setBaru(num);
    }
  };

  const handleStokGudangChange = (val: number) => {
    const num = Math.max(0, val);
    setStokGudang(num);
    if (!itemToEdit && layak === 0 && num > 0) {
      setLayak(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const finalAlatKerja = alatKerja === 'LAINNYA' ? customAlatKerja.trim().toUpperCase() : alatKerja;
    const finalMerkType = merkType.trim().toUpperCase();

    if (!finalAlatKerja) {
      setValidationError('Silakan pilih atau isi nama Alat Kerja.');
      return;
    }

    if (!finalMerkType) {
      setValidationError('Silakan isi Merk / Type (Otomatis Huruf Besar).');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID');
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedUpdate = `${dateStr} ${timeStr}`;

    const savedItem: RekapStokAlkerItem = {
      id: itemToEdit ? itemToEdit.id : `rekap-${Date.now()}`,
      alatKerja: finalAlatKerja,
      merkType: finalMerkType,
      stokGudang: Number(stokGudang) || 0,
      beliBaru: Number(beliBaru) || 0,
      baru: Number(baru) || 0,
      layak: Number(layak) || 0,
      rusak: Number(rusak) || 0,
      total: calculatedTotal,
      keterangan: keterangan.trim() || undefined,
      updatedAt: formattedUpdate,
      createdAtTime: itemToEdit ? itemToEdit.createdAtTime : Date.now(),
    };

    onSave(savedItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER: Multi-Color Gradient yang Indah & Elegan */}
        <div className="relative bg-gradient-to-r from-violet-700 via-indigo-600 to-fuchsia-600 px-5 py-4 text-white overflow-hidden shadow-sm">
          {/* Subtle Ambient Light Glows */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-400/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Rounded Glass Icon Box */}
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                <ClipboardList className="w-5 h-5 text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
                    {itemToEdit ? 'Edit Rekap Stok Alker' : 'Input Rekap Stok Alker'}
                  </h3>
                  <span className="bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Rekap Stok
                  </span>
                </div>
                <p className="text-[10.5px] text-indigo-100 font-medium">
                  {itemToEdit ? 'Perbarui data akumulasi alat kerja' : 'Tambahkan data rekap stok gudang & kondisi alat kerja'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL FORM BODY DENGAN FONT MANIS & FORM ELEMENT COMPACT */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. ALAT KERJA (DROPDOWN) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <label className="text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black">1</span>
                <span>ALAT KERJA (Dropdown)</span>
              </label>
              <span className="text-rose-500 font-semibold text-[9.5px] uppercase tracking-wider">* WAJIB</span>
            </div>
            <select
              value={alatKerja}
              onChange={(e) => setAlatKerja(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none cursor-pointer"
            >
              {DAFTAR_ALAT_KERJA.map((alker) => (
                <option key={alker} value={alker}>
                  {alker}
                </option>
              ))}
            </select>

            {alatKerja === 'LAINNYA' && (
              <input
                type="text"
                placeholder="Ketik Nama Alat Kerja..."
                value={customAlatKerja}
                onChange={(e) => setCustomAlatKerja(e.target.value)}
                required
                className="w-full mt-1.5 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 outline-none uppercase"
              />
            )}
          </div>

          {/* 2. MERK TYPE (OTOMATIS HURUF BESAR) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <label className="text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black">2</span>
                <span>MERK / TYPE</span>
                <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-1.5 py-0.2 rounded-md lowercase">
                  (otomatis huruf besar)
                </span>
              </label>
              <span className="text-rose-500 font-semibold text-[9.5px] uppercase tracking-wider">* WAJIB</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="CONTOH: FUJIKURA 70S+ / CFS-2 / MINI OTDR"
                value={merkType}
                onChange={(e) => setMerkType(e.target.value.toUpperCase())}
                required
                className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none uppercase tracking-wide"
              />
            </div>
            <p className="text-[9.5px] text-slate-400">
              Setiap ketikan akan otomatis terformat huruf kapital besar secara otomatis.
            </p>
          </div>

          {/* 3 & 4. STOK GUDANG & BELI BARU (2 Kolom) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* STOK GUDANG */}
            <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-[10.5px] font-bold">
                <label className="text-slate-700 uppercase tracking-wide">STOK GUDANG</label>
                <span className="text-indigo-600 font-black text-[9px] bg-indigo-100 px-1 py-0.2 rounded">Qty</span>
              </div>
              <input
                type="number"
                min="0"
                value={stokGudang}
                onChange={(e) => handleStokGudangChange(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-2.5 text-xs font-black text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 outline-none text-center"
              />
              <p className="text-[9px] text-slate-400 text-center">Unit di gudang saat ini</p>
            </div>

            {/* BELI BARU */}
            <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-[10.5px] font-bold">
                <label className="text-slate-700 uppercase tracking-wide">BELI BARU</label>
                <span className="text-teal-600 font-black text-[9px] bg-teal-100 px-1 py-0.2 rounded">Qty</span>
              </div>
              <input
                type="number"
                min="0"
                value={beliBaru}
                onChange={(e) => handleBeliBaruChange(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-2.5 text-xs font-black text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-teal-400 outline-none text-center"
              />
              <p className="text-[9px] text-slate-400 text-center">Pengadaan baru</p>
            </div>
          </div>

          {/* 5, 6, 7. KONDISI: BARU, LAYAK, RUSAK (3 Kolom) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <label className="text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black">3</span>
                <span>RINCIAN KONDISI ALAT KERJA</span>
              </label>
              <span className="text-slate-400 font-normal text-[9.5px]">Unit per kondisi</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* BARU */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 text-center space-y-1">
                <label className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  BARU
                </label>
                <input
                  type="number"
                  min="0"
                  value={baru}
                  onChange={(e) => setBaru(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-emerald-300 rounded-lg py-1 px-1.5 text-xs font-black text-emerald-900 bg-white text-center outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-[8.5px] text-emerald-600 font-semibold block">Gress / Segel</span>
              </div>

              {/* LAYAK */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2 text-center space-y-1">
                <label className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">
                  LAYAK
                </label>
                <input
                  type="number"
                  min="0"
                  value={layak}
                  onChange={(e) => setLayak(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-blue-300 rounded-lg py-1 px-1.5 text-xs font-black text-blue-900 bg-white text-center outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-[8.5px] text-blue-600 font-semibold block">Siap Kerja</span>
              </div>

              {/* RUSAK */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2 text-center space-y-1">
                <label className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                  RUSAK
                </label>
                <input
                  type="number"
                  min="0"
                  value={rusak}
                  onChange={(e) => setRusak(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-rose-300 rounded-lg py-1 px-1.5 text-xs font-black text-rose-900 bg-white text-center outline-none focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-[8.5px] text-rose-600 font-semibold block">Perlu Service</span>
              </div>
            </div>
          </div>

          {/* 8. TOTAL (OTOMATIS TERKALKULASI DENGAN HIGHLIGHT INDAH) */}
          <div className="p-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl text-white flex items-center justify-between shadow-md border border-indigo-400/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-300/30 flex items-center justify-center text-amber-300">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-black tracking-wider">
                  TOTAL KESELURUHAN
                </p>
                <p className="text-[9px] text-slate-300 font-medium">
                  Stok Gudang ({stokGudang}) + Beli Baru ({beliBaru})
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-300 tracking-tight font-mono">
                {calculatedTotal}
              </span>
              <span className="text-[9.5px] text-indigo-200 block font-semibold uppercase">Unit</span>
            </div>
          </div>

          {/* 9. KETERANGAN (OPSIONAL) */}
          <div className="space-y-1">
            <label className="text-slate-700 text-[10.5px] font-bold uppercase tracking-wide block">
              KETERANGAN / CATATAN (OPSIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Unit operasional STO Bogor, kalibrasi rutin berkala..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data Rekap</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
