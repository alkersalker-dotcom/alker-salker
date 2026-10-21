import * as XLSX from 'xlsx';
import { InventoryItem, Transaction } from '../types/inventory';

export function formatIndoDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatSimpleDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateTrxNumber(type: 'MASUK' | 'KELUAR', existingCount: number = 0): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const prefix = type === 'MASUK' ? 'BM' : 'BK';
  const sequence = String(existingCount + 1).padStart(3, '0');
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `${prefix}-${year}${month}${day}-${sequence}${randomSuffix}`;
}

export function exportInventoryToExcel(items: InventoryItem[]) {
  const data = items.map((it, idx) => ({
    'No': idx + 1,
    'Kode Barang / SKU': it.code,
    'Nama Barang': it.name,
    'Kategori': it.category,
    'Merk / Tipe': it.brandModel,
    'Stok Saat Ini': it.stockCurrent,
    'Satuan': it.unit,
    'Stok Minimum': it.minStock,
    'Status Stok': it.stockCurrent === 0 ? 'HABIS' : it.stockCurrent <= it.minStock ? 'MENIPIS' : 'AMAN',
    'Lokasi Rak': it.location,
    'Kondisi': it.condition,
    'Keterangan': it.notes || '-',
    'Terakhir Diperbarui': formatIndoDate(it.updatedAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 14 },
    { wch: 30 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Stok Barang');

  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Laporan_Stok_Gudang_${todayStr}.xlsx`);
}

export function exportTransactionsToExcel(transactions: Transaction[], title: string = 'Laporan Transaksi Barang') {
  const flatRows: Record<string, string | number>[] = [];
  let no = 1;

  transactions.forEach((trx) => {
    trx.items.forEach((item, itemIdx) => {
      flatRows.push({
        'No': itemIdx === 0 ? no : '',
        'No. Bukti Transaksi': trx.transactionNumber,
        'Tipe': trx.type === 'MASUK' ? 'BARANG MASUK' : 'BARANG KELUAR',
        'Tanggal': formatIndoDate(trx.date),
        'Pihak Terkait / Teknisi': trx.recipientOrSource,
        'Unit / Departemen': trx.unitOrDepartment,
        'Lokasi STO': trx.stoLocation,
        'Keperluan': trx.purpose,
        'Kode Item': item.itemCode,
        'Nama Item': item.itemName,
        'Qty': item.qty,
        'Satuan': item.unit,
        'Serial Number (SN)': item.serialNumber || '-',
        'Petugas Gudang': trx.officerName,
        'Keterangan Transaksi': trx.notes || '-',
        'Status': trx.status,
      });
    });
    no++;
  });

  const worksheet = XLSX.utils.json_to_sheet(flatRows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 16 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 12 },
    { wch: 26 },
    { wch: 15 },
    { wch: 35 },
    { wch: 8 },
    { wch: 10 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Transaksi');

  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${todayStr}.xlsx`);
}
