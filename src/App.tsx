import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AlkerDashboard } from './components/AlkerDashboard';
import { AlkerModal } from './components/AlkerModal';
import { AlkerItem, UserSession, StokPembelianItem } from './types/inventory';
import { INITIAL_ALKER_DATA, INITIAL_STOK_PEMBELIAN_DATA } from './data/initialData';
import { CheckCircle2 } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('cek_alker_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [alkerData, setAlkerData] = useState<AlkerItem[]>([]);
  const [stokData, setStokData] = useState<StokPembelianItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<AlkerItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // AMBIL DATA REALTIME DARI FIREBASE
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "alker_data"), (snap) => {
      const items = snap.docs.map(d => d.data() as AlkerItem);
      setAlkerData(items.length > 0 ? items : INITIAL_ALKER_DATA);
    });
    const unsub2 = onSnapshot(collection(db, "stok_pembelian"), (snap) => {
      const items = snap.docs.map(d => d.data() as StokPembelianItem);
      setStokData(items.length > 0 ? items : INITIAL_STOK_PEMBELIAN_DATA);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('cek_alker_user', JSON.stringify(user));
    showToast(`Selamat datang, ${user.name} (${user.unit})!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cek_alker_user');
    showToast('Anda telah logout');
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AlkerItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if(!confirm("Hapus item ini?")) return;
    await deleteDoc(doc(db, "alker_data", id));
    showToast('Item dihapus dari Firebase');
  };

  const handleUpdateItemFoto = async (id: string, foto: string) => {
    const item = alkerData.find(i => i.id === id);
    if(item){
      await setDoc(doc(db, "alker_data", id), { ...item, foto });
      showToast('Foto diperbarui');
    }
  };

  const handleSaveItem = async (item: AlkerItem) => {
    await setDoc(doc(db, "alker_data", item.id), item);
    showToast(itemToEdit ? 'Item diperbarui di Firebase!' : 'Item baru masuk Firebase!');
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSaveStokItem = async (item: StokPembelianItem) => {
    await setDoc(doc(db, "stok_pembelian", item.id), item);
    showToast('Data stok tersimpan ke Firebase!');
  };

  const handleDeleteStokItem = async (id: string) => {
    await deleteDoc(doc(db, "stok_pembelian", id));
    showToast('Data stok dihapus');
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
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

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[100]">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
