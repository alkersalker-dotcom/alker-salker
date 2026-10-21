import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AlkerDashboard } from './components/AlkerDashboard';
import { AlkerModal } from './components/AlkerModal';
import { AlkerItem, UserSession, StokPembelianItem } from './types/inventory';
import { INITIAL_ALKER_DATA, INITIAL_STOK_PEMBELIAN_DATA } from './data/initialData';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current active user session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('cek_alker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Alker database items
  const [alkerData, setAlkerData] = useState<AlkerItem[]>(() => {
    try {
      const saved = localStorage.getItem('cek_alker_db');
      return saved ? JSON.parse(saved) : INITIAL_ALKER_DATA;
    } catch {
      return INITIAL_ALKER_DATA;
    }
  });

  // Stok & Pembelian database items
  const [stokData, setStokData] = useState<StokPembelianItem[]>(() => {
    try {
      const saved = localStorage.getItem('cek_alker_stok_pembelian');
      return saved ? JSON.parse(saved) : INITIAL_STOK_PEMBELIAN_DATA;
    } catch {
      return INITIAL_STOK_PEMBELIAN_DATA;
    }
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<AlkerItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('cek_alker_db', JSON.stringify(alkerData));
  }, [alkerData]);

  useEffect(() => {
    localStorage.setItem('cek_alker_stok_pembelian', JSON.stringify(stokData));
  }, [stokData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('cek_alker_user', JSON.stringify(user));
    showToast(`Selamat datang, ${user.name} (${user.unit})!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cek_alker_user');
    showToast('Anda telah keluar dari aplikasi.');
  };

  const handleSaveItem = (savedItem: AlkerItem) => {
    const existingIndex = alkerData.findIndex((i) => i.id === savedItem.id);
    if (existingIndex >= 0) {
      const updated = [...alkerData];
      updated[existingIndex] = savedItem;
      setAlkerData(updated);
      showToast(`Data alat "${savedItem.alatKerja}" berhasil diperbarui.`);
    } else {
      setAlkerData([savedItem, ...alkerData]);
      showToast(`Data alat "${savedItem.alatKerja}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    const item = alkerData.find((i) => i.id === id);
    setAlkerData(alkerData.filter((i) => i.id !== id));
    showToast(`Data alat ${item ? `"${item.alatKerja}"` : ''} berhasil dihapus.`);
  };

  const handleUpdateItemFoto = (id: string, fotoBase64: string) => {
    setAlkerData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, foto: fotoBase64 } : item))
    );
    showToast('Eviden foto berhasil disimpan.');
  };

  const handleSaveStokItem = (savedItem: StokPembelianItem) => {
    const existingIndex = stokData.findIndex((i) => i.id === savedItem.id);
    if (existingIndex >= 0) {
      const updated = [...stokData];
      updated[existingIndex] = savedItem;
      setStokData(updated);
      showToast(`Data stok "${savedItem.alatKerja}" berhasil diperbarui.`);
    } else {
      setStokData([savedItem, ...stokData]);
      showToast(`Data stok "${savedItem.alatKerja}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteStokItem = (id: string) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    const item = stokData.find((i) => i.id === id);
    setStokData(stokData.filter((i) => i.id !== id));
    showToast(`Data stok ${item ? `"${item.alatKerja}"` : ''} berhasil dihapus.`);
  };

  const handleOpenEdit = (item: AlkerItem) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  // If user is not logged in, render the clean login landing page requested
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Database View matching image_b3b599da.png */}
      <AlkerDashboard
        currentUser={currentUser}
        alkerData={alkerData}
        stokData={stokData}
        onOpenAddModal={handleOpenAdd}
        onEditItem={handleOpenEdit}
        onDeleteItem={handleDeleteItem}
        onUpdateItemFoto={handleUpdateItemFoto}
        onSaveStokItem={handleSaveStokItem}
        onDeleteStokItem={handleDeleteStokItem}
        onLogout={handleLogout}
      />

      {/* Form Input / Edit Modal */}
      <AlkerModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        currentUser={currentUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
      />
    </>
  );
}
