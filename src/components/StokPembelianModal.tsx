import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Save,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { StokPembelianItem, UserSession } from '../types/inventory';
import { DAFTAR_ALAT_KERJA } from '../data/initialData';
import { createToolEvidenceSvg } from '../utils/photoEvidence';

interface StokPembelianModalProps {
  isOpen: boolean;
  itemToEdit: StokPembelianItem | null;
  currentUser: UserSession;
  onClose: () => void;
  onSave: (item: StokPembelianItem) => void;
}

export const StokPembelianModal: React.FC<StokPembelianModalProps> = ({
  isOpen,
  itemToEdit,
  currentUser,
  onClose,
  onSave,
}) => {
  const [alatKerja, setAlatKerja] = useState<string>('SPLICER');
  const [customAlat, setCustomAlat] = useState<string>('');
  const [merkType, setMerkType] = useState<string>('');
  const [status, setStatus] = useState<'Stok' | 'Beli Baru'>('Stok');
  const [kondisiAlat, setKondisiAlat] = useState<'Baru' | 'Layak' | 'Rusak'>('Baru');
  const [jumlah, setJumlah] = useState<number>(1);
  const [tanggal, setTanggal] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [foto, setFoto] = useState<string>('');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      const todayFormatted = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      if (itemToEdit) {
        setAlatKerja(itemToEdit.alatKerja);
        setCustomAlat('');
        setMerkType(itemToEdit.merkType || '');
        setStatus(itemToEdit.status || 'Stok');
        setKondisiAlat(
          itemToEdit.kondisiAlat === 'Rusak'
            ? 'Rusak'
            : itemToEdit.kondisiAlat === 'Baru'
            ? 'Baru'
            : 'Layak'
        );
        setJumlah(itemToEdit.jumlah || 1);
        setTanggal(itemToEdit.tanggal || todayFormatted);
        setKeterangan(itemToEdit.keterangan || '');
        setFoto(itemToEdit.foto || '');
      } else {
        setAlatKerja('SPLICER');
        setCustomAlat('');
        setMerkType('');
        setStatus('Stok');
        setKondisiAlat('Baru');
        setJumlah(1);
        setTanggal(todayFormatted);
        setKeterangan('');
        setFoto('');
      }
      setIsCameraActive(false);
    }
  }, [isOpen, itemToEdit]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Tidak dapat mengakses kamera perangkat. Pastikan izin kamera aktif.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setFoto(canvas.toDataURL('image/jpeg', 0.85));
    }
    stopCamera();
  };

  const handleAutoGeneratePhoto = () => {
    const now = new Date();
    const timeStr =
      now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const autoSvg = createToolEvidenceSvg(
      alatKerja,
      merkType || 'Standard Tool',
      `LOGISTIK (${status})`,
      timeStr
    );
    setFoto(autoSvg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr =
      now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const finalAlat =
      alatKerja === 'LAINNYA' && customAlat.trim() ? customAlat.trim().toUpperCase() : alatKerja;

    const finalFoto =
      foto ||
      createToolEvidenceSvg(
        finalAlat,
        merkType.trim() || 'Logistik Alker',
        `STOK/BELI (${kondisiAlat})`,
        timeStr
      );

    const savedItem: StokPembelianItem = {
      id: itemToEdit
        ? itemToEdit.id
        : `sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      alatKerja: finalAlat,
      merkType: merkType.trim() || '-',
      status,
      kondisiAlat,
      jumlah: Math.max(1, Number(jumlah) || 1),
      tanggal: tanggal.trim() || now.toLocaleDateString('id-ID'),
      keterangan: keterangan.trim() || undefined,
      foto: finalFoto,
      updatedAt: timeStr,
      createdAtTime: itemToEdit ? itemToEdit.createdAtTime : Date.now(),
    };

    onSave(savedItem);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-4 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER BERWARNA-WARNI INDAH & ELEGAN DENGAN FONT MANIS */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md relative overflow-hidden">
          {/* Subtle luminous decorative glows */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-400/25 rounded-full blur-xl pointer-events-none" />
          <div className="absolute left-1/3 -top-8 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-1/4 top-0 w-20 h-20 bg-cyan-300/20 rounded-full blur-lg pointer-events-none" />

          <div className="flex items-center space-x-2.5 relative z-10">
            {/* Colorful Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-300 via-emerald-400 to-teal-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900/40 rounded-[10px] backdrop-blur-sm flex items-center justify-center text-emerald-300">
                <ShoppingBag className="w-4 h-4 drop-shadow" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-xs sm:text-sm tracking-wide text-white drop-shadow flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                    {itemToEdit ? 'Edit Stok / Pembelian Alker' : 'Input Data Stok & Pembelian Alat Kerja'}
                  </span>
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-white/20 text-emerald-200 backdrop-blur-md border border-white/30 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-300" />
                  Logistik
                </span>
              </div>
              <p className="text-[9.5px] text-teal-100/90 font-medium tracking-wide mt-0.5">
                Pencatatan persediaan stok gudang dan pengadaan pembelian alker baru
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            type="button"
            className="w-7 h-7 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition relative z-10 cursor-pointer shadow-2xs border border-white/20"
            title="Tutup Form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM BODY DENGAN UKURAN FONT MANIS & FIELD LENGKAP */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* 1. ALAT KERJA */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-emerald-100 text-emerald-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    1
                  </span>
                  <span>ALAT KERJA</span>
                </span>
                <span className="text-rose-500 font-bold text-[8.5px] ml-1">* WAJIB</span>
              </label>
              <select
                value={alatKerja}
                onChange={(e) => setAlatKerja(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition cursor-pointer shadow-2xs"
              >
                {DAFTAR_ALAT_KERJA.map((alat) => (
                  <option key={alat} value={alat}>
                    {alat}
                  </option>
                ))}
              </select>

              {alatKerja === 'LAINNYA' && (
                <input
                  type="text"
                  placeholder="Ketik nama alat kerja baru..."
                  value={customAlat}
                  onChange={(e) => setCustomAlat(e.target.value)}
                  required
                  className="mt-1.5 w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs uppercase focus:ring-2 focus:ring-emerald-400 outline-none font-semibold text-slate-800"
                />
              )}
            </div>

            {/* 2. MERK / TYPE */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-teal-100 text-teal-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    2
                  </span>
                  <span>MERK / TYPE</span>
                </span>
                <span className="text-rose-500 font-bold text-[8.5px] ml-1">* WAJIB</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Fujikura 70S+ / Tribrer APM-50 / Krisbow Telescopic"
                value={merkType}
                onChange={(e) => setMerkType(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition placeholder:text-[11px] shadow-2xs"
              />
            </div>

            {/* 3. STATUS (DROPDOWN / STOK, BELI BARU) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-indigo-100 text-indigo-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    3
                  </span>
                  <span>STATUS</span>
                </span>
                <span className="text-rose-500 font-bold text-[8.5px] ml-1">* WAJIB</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Stok' | 'Beli Baru')}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition cursor-pointer shadow-2xs"
              >
                <option value="Stok">Stok (Persediaan Gudang)</option>
                <option value="Beli Baru">Beli Baru (Pengadaan)</option>
              </select>
            </div>

            {/* 4. KONDISI ALAT KERJA (DROPDOWN / BARU / RUSAK) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-sky-100 text-sky-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    4
                  </span>
                  <span>KONDISI ALAT KERJA</span>
                </span>
                <span className="text-rose-500 font-bold text-[8.5px] ml-1">* WAJIB</span>
              </label>
              <select
                value={kondisiAlat}
                onChange={(e) => setKondisiAlat(e.target.value as 'Baru' | 'Layak' | 'Rusak')}
                required
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition cursor-pointer shadow-2xs"
              >
                <option value="Baru">Baru (Kondisi Prima & Normal)</option>
                <option value="Layak">Layak (Kondisi 50%)</option>
                <option value="Rusak">Rusak (Perlu Perbaikan / Servis)</option>
              </select>
            </div>

            {/* 5. JUMLAH */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-amber-100 text-amber-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    5
                  </span>
                  <span>JUMLAH (UNIT / PCS)</span>
                </span>
                <span className="text-rose-500 font-bold text-[8.5px] ml-1">* WAJIB</span>
              </label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-700 flex items-center justify-center text-xs cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={jumlah}
                  onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs font-black text-center text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setJumlah(jumlah + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-700 flex items-center justify-center text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 6. TANGGAL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-violet-100 text-violet-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    6
                  </span>
                  <span>TANGGAL PENCATATAN</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 20/10/2026"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none shadow-2xs"
              />
            </div>

            {/* 7. KETERANGAN */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-purple-100 text-purple-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    7
                  </span>
                  <span>KETERANGAN / NO. PO / VENDOR (OPSIONAL)</span>
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="Tambahkan catatan PO, sumber pengadaan, toko vendor, lokasi rak, atau kondisi..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full border border-slate-300 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none resize-none bg-white transition shadow-2xs placeholder:text-[11px]"
              />
            </div>

            {/* 8. FOTO / EVIDEN DOKUMENTASI ALAT */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-pink-100 text-pink-700 text-[8.5px] font-black flex items-center justify-center shadow-2xs">
                    8
                  </span>
                  <span>FOTO EVIDEN ALAT / DOKUMEN</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoGeneratePhoto}
                  className="text-[9px] text-teal-700 hover:text-teal-800 font-bold bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Generate Eviden Digital</span>
                </button>
              </div>

              {foto ? (
                <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="w-14 h-14 border border-slate-200 rounded-lg bg-white relative overflow-hidden shrink-0 shadow-2xs">
                    <img src={foto} alt="Eviden Foto" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-[10.5px] text-slate-600">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Eviden Fisik Terlampir</span>
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                      Foto akan tampil di tabel database Stok & Pembelian.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFoto('')}
                    className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition font-bold text-[9.5px] flex items-center space-x-1 cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              ) : isCameraActive ? (
                <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="relative bg-black rounded-lg overflow-hidden h-40 flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Jepret Foto Sekarang</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl p-2 text-center cursor-pointer transition bg-slate-50 hover:bg-emerald-50/40 flex items-center justify-center space-x-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-slate-700">Upload dari Galeri / File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="border border-dashed border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/40 rounded-xl p-2 text-center transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-[11px] font-semibold text-slate-700">Ambil Foto dengan Kamera</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2.5 border-t border-slate-200 flex justify-end space-x-2 mt-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data Stok & Pembelian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
