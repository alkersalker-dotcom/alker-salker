import { AlkerItem, StokPembelianItem, RekapStokAlkerItem } from '../types/inventory';

export interface ServerSyncResponse {
  success: boolean;
  alkerData: AlkerItem[];
  stokData: StokPembelianItem[];
  rekapData: RekapStokAlkerItem[];
  lastUpdated: string;
  version: number;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline';

// Fetch all central data from server
export async function fetchServerData(): Promise<ServerSyncResponse | null> {
  try {
    const res = await fetch('/api/data', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ServerSyncResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('Gagal menghubungi server pusat, menggunakan data lokal offline:', err);
    return null;
  }
}

// Push an Alker item to server
export async function apiSaveAlkerItem(item: AlkerItem): Promise<boolean> {
  try {
    const res = await fetch('/api/alker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal mengirim alker ke server, disimpan di perangkat lokal:', err);
    return false;
  }
}

// Delete an Alker item on server
export async function apiDeleteAlkerItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/alker/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal hapus alker di server:', err);
    return false;
  }
}

// Push a Stok item to server
export async function apiSaveStokItem(item: StokPembelianItem): Promise<boolean> {
  try {
    const res = await fetch('/api/stok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal simpan stok di server:', err);
    return false;
  }
}

// Delete a Stok item on server
export async function apiDeleteStokItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/stok/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal hapus stok di server:', err);
    return false;
  }
}

// Push a Rekap item to server
export async function apiSaveRekapItem(item: RekapStokAlkerItem): Promise<boolean> {
  try {
    const res = await fetch('/api/rekap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal simpan rekap di server:', err);
    return false;
  }
}

// Delete a Rekap item on server
export async function apiDeleteRekapItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rekap/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline: Gagal hapus rekap di server:', err);
    return false;
  }
}

// Batch Sync if needed
export async function apiSyncAll(
  alkerData: AlkerItem[],
  stokData: StokPembelianItem[],
  rekapData: RekapStokAlkerItem[]
): Promise<ServerSyncResponse | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alkerData, stokData, rekapData }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Gagal sinkronisasi data penuh:', err);
    return null;
  }
}
