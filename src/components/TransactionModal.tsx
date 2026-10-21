import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Camera,
  Upload,
  RotateCcw,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { InventoryItem, Technician, Transaction, TransactionType } from '../types/inventory';
import {
  MASTER_TEKNISI,
  STO_LOCATIONS,
  TRANSACTION_PURPOSES_IN,
  TRANSACTION_PURPOSES_OUT,
} from '../data/initialData';
import { generateTrxNumber } from '../utils/formatters';

interface TransactionModalProps {
  currentUser?: { name: string; unit: 'ASSURANCE' | 'PROVISIONING'; sto: string } | null;
  isOpen: boolean;
  initialType: TransactionType;
  items: InventoryItem[];
  technicians: Technician[];
  existingTransactionsCount: number;
  onClose: () => void;
  onSave: (transaction: Transaction, updatedItems: InventoryItem[]) => void;
}

interface ItemRow {
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unit: string;
  serialNumber: string;
  condition: string;
  maxStock: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  currentUser,
  isOpen,
  initialType,
  items,
  technicians,
  existingTransactionsCount,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [trxNumber, setTrxNumber] = useState<string>('');
  const [trxDate, setTrxDate] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [unitDept, setUnitDept] = useState<string>('ASSURANCE');
  const [sto, setSto] = useState<string>('BGR');
  const [purpose, setPurpose] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Petugas Logistik STO');
  const [notes, setNotes] = useState<string>('');

  // Item rows
  const [rows, setRows] = useState<ItemRow[]>([]);

  // Photos
  const [photoEvidence, setPhotoEvidence] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Digital Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  // Validation message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      const generated = generateTrxNumber(initialType, existingTransactionsCount);
      setTrxNumber(generated);
      setTrxDate(new Date().toISOString().slice(0, 16));
      setErrorMessage('');
      setPhotoEvidence('');
      setHasSignature(false);
      setNotes('');

      if (initialType === 'KELUAR') {
        const defaultTek = currentUser?.name
          ? { name: currentUser.name, unit: currentUser.unit, sto: currentUser.sto }
          : technicians[0] || MASTER_TEKNISI[0];
        setRecipient(defaultTek?.name || '');
        setUnitDept(defaultTek?.unit || 'ASSURANCE');
        setSto(defaultTek?.sto || 'BGR');
        setPurpose(TRANSACTION_PURPOSES_OUT[0]);
      } else {
        setRecipient(currentUser?.name ? `PENGEMBALIAN - ${currentUser.name}` : 'PT TELKOM LOGISTIK PUSAT');
        setUnitDept(currentUser?.unit || 'LOGISTIK PUSAT');
        setSto(currentUser?.sto || 'BGR');
        setPurpose(TRANSACTION_PURPOSES_IN[0]);
      }

      // Default one item row
      if (items.length > 0) {
        const firstItem = items[0];
        setRows([
          {
            itemId: firstItem.id,
            itemCode: firstItem.code,
            itemName: firstItem.name,
            qty: 1,
            unit: firstItem.unit,
            serialNumber: '',
            condition: 'Bagus',
            maxStock: firstItem.stockCurrent,
          },
        ]);
      } else {
        setRows([]);
      }
    }
  }, [isOpen, initialType, existingTransactionsCount, items, technicians]);

  // Handle switching type between MASUK and KELUAR
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setTrxNumber(generateTrxNumber(newType, existingTransactionsCount));
    if (newType === 'KELUAR') {
      const firstTek = technicians[0] || MASTER_TEKNISI[0];
      setRecipient(firstTek?.name || '');
      setUnitDept(firstTek?.unit || 'ASSURANCE');
      setPurpose(TRANSACTION_PURPOSES_OUT[0]);
    } else {
      setRecipient('PT TELKOM LOGISTIK PUSAT');
      setUnitDept('LOGISTIK PUSAT');
      setPurpose(TRANSACTION_PURPOSES_IN[0]);
    }
  };

  // Handle technician select
  const handleTechnicianSelect = (name: string) => {
    setRecipient(name);
    const matched = technicians.find((t) => t.name === name);
    if (matched) {
      setUnitDept(matched.unit);
      setSto(matched.sto);
    }
  };

  // Add Item Row
  const handleAddRow = () => {
    if (items.length === 0) return;
    const firstItem = items[0];
    setRows([
      ...rows,
      {
        itemId: firstItem.id,
        itemCode: firstItem.code,
        itemName: firstItem.name,
        qty: 1,
        unit: firstItem.unit,
        serialNumber: '',
        condition: 'Bagus',
        maxStock: firstItem.stockCurrent,
      },
    ]);
  };

  // Remove Item Row
  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, idx) => idx !== index));
  };

  // Update item in row
  const handleRowItemChange = (index: number, itemId: string) => {
    const selected = items.find((i) => i.id === itemId);
    if (!selected) return;

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      itemId: selected.id,
      itemCode: selected.code,
      itemName: selected.name,
      unit: selected.unit,
      maxStock: selected.stockCurrent,
    };
    setRows(newRows);
  };

  const handleRowQtyChange = (index: number, qty: number) => {
    const newRows = [...rows];
    newRows[index].qty = Math.max(1, qty);
    setRows(newRows);
  };

  const handleRowFieldChange = (index: number, field: 'serialNumber' | 'condition', val: string) => {
    const newRows = [...rows];
    newRows[index][field] = val;
    setRows(newRows);
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoEvidence(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Camera
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Tidak dapat membuka kamera. Pastikan izin kamera aktif.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
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
      setPhotoEvidence(canvas.toDataURL('image/jpeg', 0.8));
    }
    stopCamera();
  };

  // Canvas Signature pad helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!recipient.trim()) {
      setErrorMessage('Harap isi nama penerima atau sumber barang.');
      return;
    }

    if (rows.length === 0) {
      setErrorMessage('Harap tambahkan minimal 1 jenis barang.');
      return;
    }

    // Stock check for KELUAR
    if (type === 'KELUAR') {
      for (const row of rows) {
        const item = items.find((i) => i.id === row.itemId);
        if (item && item.stockCurrent < row.qty) {
          setErrorMessage(
            `Stok "${row.itemName}" tidak mencukupi! Tersedia: ${item.stockCurrent} ${item.unit}, diminta: ${row.qty} ${item.unit}.`
          );
          return;
        }
      }
    }

    // Get Signature data URL if signed
    let signatureData = '';
    if (hasSignature && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    // Prepare new transaction
    const newTransaction: Transaction = {
      id: `trx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      transactionNumber: trxNumber,
      type,
      date: trxDate ? new Date(trxDate).toISOString() : new Date().toISOString(),
      recipientOrSource: recipient.trim().toUpperCase(),
      unitOrDepartment: unitDept,
      stoLocation: sto,
      purpose: purpose || (type === 'MASUK' ? 'Penerimaan Gudang' : 'Operasional Lapangan'),
      items: rows.map((r) => ({
        itemId: r.itemId,
        itemCode: r.itemCode,
        itemName: r.itemName,
        qty: Number(r.qty),
        unit: r.unit,
        serialNumber: r.serialNumber.trim() || undefined,
        condition: r.condition,
      })),
      officerName: officerName.trim() || 'Admin Gudang',
      notes: notes.trim() || undefined,
      photoEvidence: photoEvidence || undefined,
      signature: signatureData || undefined,
      status: 'SELESAI',
      createdAt: new Date().toISOString(),
    };

    // Recalculate stock
    const updatedItems = items.map((item) => {
      const rowMatches = rows.filter((r) => r.itemId === item.id);
      if (rowMatches.length === 0) return item;

      const totalQtyDelta = rowMatches.reduce((acc, r) => acc + Number(r.qty), 0);
      const newStock =
        type === 'MASUK'
          ? item.stockCurrent + totalQtyDelta
          : Math.max(0, item.stockCurrent - totalQtyDelta);

      return {
        ...item,
        stockCurrent: newStock,
        updatedAt: new Date().toISOString(),
      };
    });

    onSave(newTransaction, updatedItems);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div
          className={`px-6 py-4 text-white flex items-center justify-between ${
            type === 'MASUK' ? 'bg-emerald-700' : 'bg-indigo-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              {type === 'MASUK' ? (
                <ArrowDownLeft className="w-5 h-5 text-emerald-200" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-indigo-200" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {type === 'MASUK' ? 'Form Catat Barang Masuk (BPM)' : 'Form Catat Barang Keluar (Surat Jalan)'}
              </h3>
              <p className="text-xs text-white/80">
                {type === 'MASUK'
                  ? 'Penerimaan stok dari supplier pusat / retur alker teknisi'
                  : 'Pengeluaran alat & material untuk teknisi / pekerjaan lapangan'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            type="button"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Switch Type Pill */}
          <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm mx-auto border border-slate-200">
            <button
              type="button"
              onClick={() => handleTypeChange('MASUK')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                type === 'MASUK'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>BARANG MASUK</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('KELUAR')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                type === 'KELUAR'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>BARANG KELUAR</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Dokumen & Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                No. Bukti / Surat Jalan
              </label>
              <input
                type="text"
                value={trxNumber}
                onChange={(e) => setTrxNumber(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Tanggal & Jam
              </label>
              <input
                type="datetime-local"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Lokasi STO / Gudang
              </label>
              <select
                value={sto}
                onChange={(e) => setSto(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STO_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    STO {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Pihak Terkait (Penerima / Teknisi / Sumber) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {type === 'KELUAR' ? 'Teknisi / Penerima' : 'Sumber / Pengirim'}
              </label>
              {type === 'KELUAR' ? (
                <div className="space-y-1.5">
                  <select
                    value={recipient}
                    onChange={(e) => handleTechnicianSelect(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih dari Daftar Teknisi --</option>
                    {technicians.map((tek) => (
                      <option key={tek.id} value={tek.name}>
                        {tek.name} ({tek.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Atau ketik nama penerima manual..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 uppercase"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PT TELKOM LOGISTIK PUSAT">PT TELKOM LOGISTIK PUSAT</option>
                    <option value="PENGEMBALIAN ALKER TEKNISI">PENGEMBALIAN ALKER TEKNISI</option>
                    <option value="VENDOR MATERIAL PT CCSI / VOKSEL">VENDOR MATERIAL PT CCSI / VOKSEL</option>
                    <option value="GUDANG REGIONAL JABAR">GUDANG REGIONAL JABAR</option>
                    <option value="LAINNYA">LAINNYA (Ketik di bawah)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ketik nama sumber pengirim..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 uppercase"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Unit / Divisi
              </label>
              <select
                value={unitDept}
                onChange={(e) => setUnitDept(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ASSURANCE">ASSURANCE</option>
                <option value="PROVISIONING">PROVISIONING</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="LOGISTIK PUSAT">LOGISTIK PUSAT</option>
                <option value="ADMIN">ADMIN</option>
                <option value="KONTRAKTOR / MITRA">KONTRAKTOR / MITRA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Keperluan / Tujuan
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(type === 'MASUK' ? TRANSACTION_PURPOSES_IN : TRANSACTION_PURPOSES_OUT).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Daftar Barang (Item Rows) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Daftar Barang yang {type === 'MASUK' ? 'Diterima' : 'Dikeluarkan'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pilih item barang dan tentukan kuantitas serta nomor seri jika ada.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Barang</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, idx) => {
                const isStockShortage = type === 'KELUAR' && row.qty > row.maxStock;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition ${
                      isStockShortage
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      {/* Select Item */}
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                          Barang / Alat Kerja ({idx + 1})
                        </label>
                        <select
                          value={row.itemId}
                          onChange={(e) => handleRowItemChange(idx, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 outline-none"
                        >
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              [{it.code}] {it.name} • Sisa: {it.stockCurrent} {it.unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5 flex justify-between">
                          <span>Qty ({row.unit})</span>
                          {type === 'KELUAR' && (
                            <span
                              className={`text-[9px] font-bold ${
                                isStockShortage ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              Stok: {row.maxStock}
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={row.qty}
                          onChange={(e) => handleRowQtyChange(idx, parseInt(e.target.value) || 1)}
                          className={`w-full bg-white border rounded-lg p-2 font-bold text-slate-900 outline-none text-center ${
                            isStockShortage
                              ? 'border-rose-500 ring-1 ring-rose-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>

                      {/* Serial Number */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                          No. Seri / Barcode SN (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: SN-902148"
                          value={row.serialNumber}
                          onChange={(e) => handleRowFieldChange(idx, 'serialNumber', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-800 outline-none"
                        />
                      </div>

                      {/* Condition & Delete */}
                      <div className="sm:col-span-2 flex items-center space-x-1.5 pt-4 sm:pt-0">
                        <select
                          value={row.condition}
                          onChange={(e) => handleRowFieldChange(idx, 'condition', e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-[11px] text-slate-700 outline-none"
                        >
                          <option value="Bagus">Bagus</option>
                          <option value="Baru">Baru</option>
                          <option value="Perlu Servis">Perlu Servis</option>
                        </select>

                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isStockShortage && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kuantitas diminta melebihi stok yang ada di gudang!</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Bukti Fisik Foto & Tanda Tangan Digital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foto Bukti Fisik / Surat Jalan */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Foto Bukti Fisik / Surat Jalan
              </label>

              {photoEvidence ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                  <img
                    src={photoEvidence}
                    alt="Bukti"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoEvidence('')}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 shadow"
                    title="Hapus Foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : isCameraActive ? (
                <div className="space-y-2">
                  <div className="relative bg-black rounded-lg overflow-hidden h-36 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Jepret Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-3 text-center cursor-pointer transition bg-white flex flex-col items-center justify-center">
                    <Upload className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-700">Upload Berkas</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-3 text-center transition bg-white flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-700">Buka Kamera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Digital Signature Pad */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Tanda Tangan {type === 'KELUAR' ? 'Teknisi / Penerima' : 'Penerima Gudang'}
                </label>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Hapus TTD</span>
                  </button>
                )}
              </div>
              <div className="border border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner touch-none relative">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[110px] cursor-crosshair"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs italic">
                    Goreskan tanda tangan di sini
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Petugas Gudang & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Nama Petugas Gudang Yang Melayani
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Tiket IN-88914, ODP BGR-04, kondisi kardus baik..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center space-x-1.5 cursor-pointer ${
                type === 'MASUK'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Terbitkan {type === 'MASUK' ? 'BPM' : 'Surat Jalan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
