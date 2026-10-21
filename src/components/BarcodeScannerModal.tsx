import React, { useState, useRef, useEffect } from 'react';
import { X, ScanBarcode, Camera, Search, Package, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  items: InventoryItem[];
  onClose: () => void;
  onSelectAction: (item: InventoryItem, action: 'MASUK' | 'KELUAR') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  items,
  onClose,
  onSelectAction,
}) => {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setMatchedItem(null);
    }
  }, [isOpen]);

  const handleSearchCode = (code: string) => {
    setScannedCode(code);
    const found = items.find(
      (it) => it.code.toUpperCase() === code.trim().toUpperCase()
    );
    setMatchedItem(found || null);
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
      alert('Tidak dapat mengaktifkan kamera scanner.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScanBarcode className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base">Scan Barcode / SKU Barang</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Camera Scanner View or Input */}
          {isCameraActive ? (
            <div className="space-y-3">
              <div className="relative bg-black rounded-xl overflow-hidden h-48 flex items-center justify-center border-2 border-sky-400">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {/* Laser scan line overlay */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-500 shadow-lg shadow-rose-500 animate-pulse" />
                <div className="absolute bottom-2 text-white/80 text-[10px] bg-black/60 px-2 py-0.5 rounded">
                  Arahkan barcode ke garis tengah
                </div>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
              >
                Tutup Kamera & Input Manual
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Input Barcode / Kode SKU
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik kode (Contoh: ALK-001, MAT-001, ONT-001)..."
                  value={scannedCode}
                  onChange={(e) => handleSearchCode(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Buka Kamera Scan</span>
                </button>
                <div className="text-[10px] text-slate-400">Pindai cepat barcode fisik</div>
              </div>
            </div>
          )}

          {/* Quick Select Pill Buttons for quick testing */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Pilihan Cepat Kode Barang:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 6).map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleSearchCode(it.code)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border ${
                    scannedCode.toUpperCase() === it.code.toUpperCase()
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {it.code}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Item Card */}
          {matchedItem ? (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
                    {matchedItem.code}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{matchedItem.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {matchedItem.category} • {matchedItem.brandModel}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lokasi: <b>{matchedItem.location}</b>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Stok Gudang</p>
                  <p className="text-xl font-black text-indigo-700">
                    {matchedItem.stockCurrent}{' '}
                    <span className="text-xs font-semibold text-slate-600">{matchedItem.unit}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-200/80">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onSelectAction(matchedItem, 'MASUK');
                  }}
                  className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition shadow-sm"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Catat Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onSelectAction(matchedItem, 'KELUAR');
                  }}
                  className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Catat Keluar</span>
                </button>
              </div>
            </div>
          ) : scannedCode ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              Tidak ada barang dengan kode "{scannedCode}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
