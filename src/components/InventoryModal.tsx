import React, { useState, useEffect } from 'react';
import { X, Package, Check, Upload, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { ITEM_CATEGORIES } from '../data/initialData';

interface InventoryModalProps {
  isOpen: boolean;
  itemToEdit: InventoryItem | null;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>(ITEM_CATEGORIES[0]);
  const [brandModel, setBrandModel] = useState<string>('');
  const [unit, setUnit] = useState<string>('Unit');
  const [stockCurrent, setStockCurrent] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [location, setLocation] = useState<string>('');
  const [condition, setCondition] = useState<'Bagus' | 'Perlu Perbaikan' | 'Baru'>('Bagus');
  const [notes, setNotes] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');

  useEffect(() => {
    if (itemToEdit) {
      setCode(itemToEdit.code);
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setBrandModel(itemToEdit.brandModel);
      setUnit(itemToEdit.unit);
      setStockCurrent(itemToEdit.stockCurrent);
      setMinStock(itemToEdit.minStock);
      setLocation(itemToEdit.location);
      setCondition(itemToEdit.condition);
      setNotes(itemToEdit.notes || '');
      setPhoto(itemToEdit.photo || '');
    } else {
      const randomCode = 'ITM-' + Math.floor(100 + Math.random() * 900);
      setCode(randomCode);
      setName('');
      setCategory(ITEM_CATEGORIES[0]);
      setBrandModel('');
      setUnit('Unit');
      setStockCurrent(10);
      setMinStock(3);
      setLocation('Rak A-1 STO BGR');
      setCondition('Bagus');
      setNotes('');
      setPhoto('');
    }
  }, [itemToEdit, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      brandModel: brandModel.trim() || '-',
      unit,
      stockCurrent: Number(stockCurrent),
      minStock: Number(minStock),
      location: location.trim() || 'Gudang Utama',
      condition,
      notes: notes.trim() || undefined,
      photo: photo || undefined,
      createdAt: itemToEdit ? itemToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">
              {itemToEdit ? 'Edit Master Data Barang' : 'Tambah Master Data Barang Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Kode Barang / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Nama Barang / Alat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Splicer Fiber Optic Core Alignment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Merk / Type / Spesifikasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Fujikura 70S / Fiberhome / CCSI"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Satuan Ukuran <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Unit">Unit</option>
                <option value="Pcs">Pcs</option>
                <option value="Roll">Roll</option>
                <option value="Meter">Meter</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Stok Fisik Saat Ini
              </label>
              <input
                type="number"
                min="0"
                value={stockCurrent}
                onChange={(e) => setStockCurrent(parseInt(e.target.value) || 0)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-base"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Batas Minimum Stok (Alert)
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-amber-700 outline-none focus:ring-2 focus:ring-indigo-500 text-center"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Peringatan akan muncul jika stok di bawah nilai ini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Lokasi Rak / Posisi Penyimpanan
              </label>
              <input
                type="text"
                placeholder="Contoh: Rak Alker B1 STO BGR"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Kondisi Awal
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Bagus">Bagus</option>
                <option value="Baru">Baru</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Catatan / Keterangan
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan spesifikasi atau catatan tambahan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Foto Barang (Opsional)
            </label>
            {photo ? (
              <div className="flex items-center space-x-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <img src={photo} alt="Barang" className="w-14 h-14 rounded object-cover border" />
                <div className="flex-1 text-[11px] text-slate-500">Foto barang terlampir</div>
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-3 text-center cursor-pointer transition flex items-center justify-center space-x-2 bg-slate-50">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">Pilih Foto dari Perangkat</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambahkan Barang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
