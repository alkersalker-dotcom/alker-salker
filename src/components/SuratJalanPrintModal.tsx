import React from 'react';
import { Transaction } from '../types/inventory';
import { formatIndoDate } from '../utils/formatters';
import { Printer, X, CheckCircle, ShieldCheck, Warehouse, FileText } from 'lucide-react';

interface SuratJalanPrintModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const SuratJalanPrintModal: React.FC<SuratJalanPrintModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isMasuk = transaction.type === 'MASUK';
  const docTitle = isMasuk
    ? 'BUKTI PENERIMAAN BARANG MASUK (BPM)'
    : 'SURAT JALAN / BUKTI SERAH TERIMA PENGELUARAN BARANG (BK)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-4 overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base">Pratinjau Surat Jalan & Dokumen Resmi</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white print-container text-slate-900 text-xs sm:text-sm">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-indigo-700 text-white flex items-center justify-center font-black text-sm">
                    LOG
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                      LOGISTIK & INVENTARIS GUDANG
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Divisi Pengelolaan Alat Kerja & Material Jaringan
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs uppercase">
                  {transaction.stoLocation} • {transaction.transactionNumber}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tanggal: {formatIndoDate(transaction.date)}
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-base sm:text-lg font-extrabold tracking-wider underline underline-offset-4 uppercase text-slate-900">
                {docTitle}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">
                Nomor: {transaction.transactionNumber}
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                {isMasuk ? 'Sumber / Pengirim' : 'Penerima / Teknisi'}
              </p>
              <p className="text-sm font-extrabold text-slate-900 uppercase">
                {transaction.recipientOrSource}
              </p>
              <p className="text-slate-600 mt-0.5">
                Unit / Dept: <span className="font-semibold text-slate-800">{transaction.unitOrDepartment}</span>
              </p>
              <p className="text-slate-600">
                Lokasi STO: <span className="font-semibold text-slate-800">{transaction.stoLocation}</span>
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Keperluan / Keterangan</p>
              <p className="font-semibold text-slate-800">{transaction.purpose}</p>
              <p className="text-slate-600 mt-1">
                Petugas Gudang: <span className="font-semibold text-slate-800">{transaction.officerName}</span>
              </p>
              <p className="text-slate-600">
                Status Dokumen: <span className="font-bold text-emerald-600 uppercase">{transaction.status}</span>
              </p>
            </div>
          </div>

          {/* Table of Items */}
          <div className="mb-6">
            <p className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              Daftar Barang & Rincian:
            </p>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 w-28">Kode SKU</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Deskripsi Barang / Alat</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Jumlah</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Satuan</th>
                    <th className="py-2.5 px-3">No Seri (SN) / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transaction.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-semibold text-slate-800">
                        {item.itemCode}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                        {item.itemName}
                        {item.condition && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                            {item.condition}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-900 text-sm">
                        {item.qty}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-600">
                        {item.unit}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        {item.serialNumber || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes / Special remarks */}
          {transaction.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-6">
              <span className="font-bold">Catatan Khusus: </span>
              <span>{transaction.notes}</span>
            </div>
          )}

          {/* Photo evidence preview if attached */}
          {transaction.photoEvidence && (
            <div className="mb-6">
              <p className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Lampiran Foto / Bukti Fisik:
              </p>
              <div className="border border-slate-200 rounded-lg p-2 max-w-xs bg-slate-50">
                <img
                  src={transaction.photoEvidence}
                  alt="Bukti Transaksi"
                  className="rounded max-h-40 object-cover w-full"
                />
              </div>
            </div>
          )}

          {/* Signature Sign-Off Block */}
          <div className="grid grid-cols-2 gap-8 pt-4 mt-8 border-t border-slate-300 text-center">
            {/* Yang Menyerahkan */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                {isMasuk ? 'Petugas Penerima Gudang' : 'Yang Menyerahkan (Petugas Gudang)'}
              </p>
              <div className="h-20 w-44 flex items-center justify-center my-1 border-b border-dashed border-slate-400">
                <span className="text-[10px] text-slate-400 italic">Tanda Tangan Petugas</span>
              </div>
              <p className="font-bold text-sm text-slate-900 uppercase">
                ( {transaction.officerName} )
              </p>
              <p className="text-[10px] text-slate-500">Logistik & Distribusi STO</p>
            </div>

            {/* Yang Menerima */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                {isMasuk ? 'Yang Menyerahkan / Supplier' : 'Yang Menerima (Teknisi / Lapangan)'}
              </p>
              <div className="h-20 w-44 flex items-center justify-center my-1 border-b border-dashed border-slate-400">
                {transaction.signature ? (
                  <img
                    src={transaction.signature}
                    alt="TTD Penerima"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Tanda Tangan Penerima</span>
                )}
              </div>
              <p className="font-bold text-sm text-slate-900 uppercase">
                ( {transaction.recipientOrSource} )
              </p>
              <p className="text-[10px] text-slate-500">
                {transaction.unitOrDepartment} • {transaction.stoLocation}
              </p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
            Dokumen sah dicetak melalui Sistem Aplikasi Keluar Masuk Barang • Dicetak pada: {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
};
