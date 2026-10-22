export type TransactionType = 'MASUK' | 'KELUAR';

export interface RekapStokAlkerItem {
  id: string;
  alatKerja: string;
  merkType: string;
  stokGudang: number;
  beliBaru: number;
  baru: number;
  layak: number;
  rusak: number;
  total: number;
  keterangan?: string;
  updatedAt: string;
  createdAtTime: number;
}


export interface StokPembelianItem {
  id: string;
  alatKerja: string;
  merkType: string;
  status: 'Stok' | 'Beli Baru';
  kondisiAlat: 'Baru' | 'Layak' | 'Rusak' | 'Layak (Kondisi 50%)';
  jumlah: number;
  tanggal: string;
  keterangan?: string;
  foto?: string;
  updatedAt: string;
  createdAtTime: number;
}

export interface AlkerItem {
  id: string;
  alatKerja: string;
  merkType: string;
  posisiAlker: 'Teknisi' | 'WH' | 'Service';
  teknisi: string;
  unit: string;
  sto: string;
  status: 'Layak' | 'Rusak' | 'Tidak Ada';
  keterangan?: string;
  foto?: string;
  updatedAt: string;
  createdAtTime: number;
}

export interface UserSession {
  name: string;
  unit: string;
  isAdmin: boolean;
  sto?: string;
}

export interface Technician {
  id: string;
  name: string;
  unit: 'ASSURANCE' | 'PROVISIONING' | 'ADMIN' | 'LAIN-2';
  sto: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  brandModel: string;
  unit: string;
  stockCurrent: number;
  minStock: number;
  location: string;
  condition: 'Bagus' | 'Perlu Perbaikan' | 'Baru';
  photo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItemDetail {
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unit: string;
  serialNumber?: string;
  condition?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  date: string;
  recipientOrSource: string;
  unitOrDepartment: string;
  stoLocation: string;
  purpose: string;
  items: TransactionItemDetail[];
  officerName: string;
  notes?: string;
  photoEvidence?: string;
  signature?: string;
  status: 'SELESAI' | 'DIBATALKAN';
  createdAt: string;
}
