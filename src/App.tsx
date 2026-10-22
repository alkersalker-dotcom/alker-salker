import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AlkerDashboard } from './components/AlkerDashboard';
import { AlkerModal } from './components/AlkerModal';
import { AlkerItem, UserSession, StokPembelianItem, RekapStokAlkerItem } from './types/inventory';
import { INITIAL_ALKER_DATA, INITIAL_STOK_PEMBELIAN_DATA, INITIAL_REKAP_STOK_DATA } from './data/initialData';
import {
  fetchServerData,
  apiSaveAlkerItem,
  apiDeleteAlkerItem,
  apiSaveStokItem,
  apiDeleteStokItem,
  apiSaveRekapItem,
  apiDeleteRekapItem,
  apiSyncAll,
  SyncStatus,
} from './services/apiSync';
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

  // Rekap Stok Alker database items
  const [rekapData, setRekapData] = useState<RekapStokAlkerItem[]>(() => {
    try {
      const saved = localStorage.getItem('cek_alker_rekap_stok');
      return saved ? JSON.parse(saved) : INITIAL_REKAP_STOK_DATA;
    } catch {
      return INITIAL_REKAP_STOK_DATA;
    }
  });

  // Cloud multi-device sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<AlkerItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');

  // Reference to prevent overwrite loops
  const isSyncingRef = useRef<boolean>(false);

  // Cache to localStorage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem('cek_alker_db', JSON.stringify(alkerData));
    } catch (e) {
      console.warn('LocalStorage quota limit reached for alker:', e);
    }
  }, [alkerData]);

  useEffect(() => {
    try {
      localStorage.setItem('cek_alker_stok_pembelian', JSON.stringify(stokData));
    } catch (e) {
      console.warn('LocalStorage error for stok:', e);
    }
  }, [stokData]);

  useEffect(() => {
    try {
      localStorage.setItem('cek_alker_rekap_stok', JSON.stringify(rekapData));
    } catch (e) {
      console.warn('LocalStorage error for rekap:', e);
    }
  }, [rekapData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Synchronize with centralized server
  const loadFromCentralServer = useCallback(async (silent = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (!silent) setSyncStatus('syncing');

    try {
      const serverResult = await fetchServerData();
      if (serverResult && serverResult.success) {
        if (Array.isArray(serverResult.alkerData)) {
          setAlkerData(serverResult.alkerData);
        }
        if (Array.isArray(serverResult.stokData)) {
          setStokData(serverResult.stokData);
        }
        if (Array.isArray(serverResult.rekapData)) {
          setRekapData(serverResult.rekapData);
        }

        const timeStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSyncedTime(timeStr);
        setSyncStatus('connected');
        if (!silent) {
          showToast(`⚡ Data terhubung & disinkronkan (${timeStr})`);
        }
      } else {
        setSyncStatus('offline');
      }
    } catch (err) {
      console.warn('Multi-device sync error:', err);
      setSyncStatus('offline');
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initial load and periodic polling (multi-device synchronization)
  useEffect(() => {
    // 1. Initial sync
    loadFromCentralServer(true);

    // 2. Poll every 5 seconds so changes from any device appear on all other devices
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadFromCentralServer(true);
      }
    }, 5000);

    // 3. Sync immediately when user switches tabs back or reconnects
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadFromCentralServer(true);
      }
    };
    const handleOnline = () => {
      loadFromCentralServer(false);
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadFromCentralServer]);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('cek_alker_user', JSON.stringify(user));
    showToast(`Selamat datang, ${user.name} (${user.unit})!`);
    loadFromCentralServer(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cek_alker_user');
    showToast('Anda telah keluar dari aplikasi.');
  };

  // Save / Update Alker Item
  const handleSaveItem = async (savedItem: AlkerItem) => {
    // 1. Optimistic local update
    const existingIndex = alkerData.findIndex((i) => i.id === savedItem.id);
    let updatedList: AlkerItem[];
    if (existingIndex >= 0) {
      updatedList = [...alkerData];
      updatedList[existingIndex] = savedItem;
      showToast(`Data alat "${savedItem.alatKerja}" berhasil diperbarui.`);
    } else {
      updatedList = [savedItem, ...alkerData];
      showToast(`Data alat "${savedItem.alatKerja}" berhasil ditambahkan.`);
    }
    setAlkerData(updatedList);

    // 2. Broadcast to centralized server
    setSyncStatus('syncing');
    const ok = await apiSaveAlkerItem(savedItem);
    setSyncStatus(ok ? 'connected' : 'offline');
    if (ok) {
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Delete Alker Item
  const handleDeleteItem = async (id: string) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    const item = alkerData.find((i) => i.id === id);
    setAlkerData((prev) => prev.filter((i) => i.id !== id));
    showToast(`Data alat ${item ? `"${item.alatKerja}"` : ''} berhasil dihapus.`);

    // Broadcast to server
    setSyncStatus('syncing');
    const ok = await apiDeleteAlkerItem(id);
    setSyncStatus(ok ? 'connected' : 'offline');
  };

  // Update Item Foto (Eviden)
  const handleUpdateItemFoto = async (id: string, fotoBase64: string) => {
    const updated = alkerData.map((item) =>
      item.id === id ? { ...item, foto: fotoBase64 } : item
    );
    setAlkerData(updated);
    showToast('Eviden foto berhasil disimpan.');

    const target = updated.find((i) => i.id === id);
    if (target) {
      apiSaveAlkerItem(target);
    }
  };

  // Save / Update Stok Item
  const handleSaveStokItem = async (savedItem: StokPembelianItem) => {
    const existingIndex = stokData.findIndex((i) => i.id === savedItem.id);
    let updatedList: StokPembelianItem[];
    if (existingIndex >= 0) {
      updatedList = [...stokData];
      updatedList[existingIndex] = savedItem;
      showToast(`Data stok "${savedItem.alatKerja}" berhasil diperbarui.`);
    } else {
      updatedList = [savedItem, ...stokData];
      showToast(`Data stok "${savedItem.alatKerja}" berhasil ditambahkan.`);
    }
    setStokData(updatedList);

    setSyncStatus('syncing');
    const ok = await apiSaveStokItem(savedItem);
    setSyncStatus(ok ? 'connected' : 'offline');
    if (ok) {
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Delete Stok Item
  const handleDeleteStokItem = async (id: string) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    const item = stokData.find((i) => i.id === id);
    setStokData((prev) => prev.filter((i) => i.id !== id));
    showToast(`Data stok ${item ? `"${item.alatKerja}"` : ''} berhasil dihapus.`);

    setSyncStatus('syncing');
    const ok = await apiDeleteStokItem(id);
    setSyncStatus(ok ? 'connected' : 'offline');
  };

  // Save / Update Rekap Item
  const handleSaveRekapItem = async (savedItem: RekapStokAlkerItem) => {
    const existingIndex = rekapData.findIndex((i) => i.id === savedItem.id);
    let updatedList: RekapStokAlkerItem[];
    if (existingIndex >= 0) {
      updatedList = [...rekapData];
      updatedList[existingIndex] = savedItem;
      showToast(`Rekap stok "${savedItem.alatKerja} (${savedItem.merkType})" berhasil diperbarui.`);
    } else {
      updatedList = [savedItem, ...rekapData];
      showToast(`Rekap stok "${savedItem.alatKerja} (${savedItem.merkType})" berhasil ditambahkan.`);
    }
    setRekapData(updatedList);

    setSyncStatus('syncing');
    const ok = await apiSaveRekapItem(savedItem);
    setSyncStatus(ok ? 'connected' : 'offline');
    if (ok) {
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Delete Rekap Item
  const handleDeleteRekapItem = async (id: string) => {
    if (!currentUser?.isAdmin) {
      showToast('Maaf Untuk Edit & Hapus Bukan Kapasitas Anda');
      return;
    }
    const item = rekapData.find((i) => i.id === id);
    setRekapData((prev) => prev.filter((i) => i.id !== id));
    showToast(`Data rekap ${item ? `"${item.alatKerja}"` : ''} berhasil dihapus.`);

    setSyncStatus('syncing');
    const ok = await apiDeleteRekapItem(id);
    setSyncStatus(ok ? 'connected' : 'offline');
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

      {/* Main Database View */}
      <AlkerDashboard
        currentUser={currentUser}
        alkerData={alkerData}
        stokData={stokData}
        rekapData={rekapData}
        onOpenAddModal={handleOpenAdd}
        onEditItem={handleOpenEdit}
        onDeleteItem={handleDeleteItem}
        onUpdateItemFoto={handleUpdateItemFoto}
        onSaveStokItem={handleSaveStokItem}
        onDeleteStokItem={handleDeleteStokItem}
        onSaveRekapItem={handleSaveRekapItem}
        onDeleteRekapItem={handleDeleteRekapItem}
        onLogout={handleLogout}
        syncStatus={syncStatus}
        lastSyncedTime={lastSyncedTime}
        onManualSync={() => loadFromCentralServer(false)}
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
