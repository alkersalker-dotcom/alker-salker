import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ChevronDown,
  User,
  ArrowRight,
  Cloud,
  Shield,
  Lock,
  AlertCircle,
  Download,
  Smartphone,
  Apple,
  X,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MASTER_TEKNISI } from '../data/initialData';
import { UserSession } from '../types/inventory';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTeknisi, setSelectedTeknisi] = useState<string>('');
  const [manualTeknisi, setManualTeknisi] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running in standalone mode (already installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePwaClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaModal(true);
    }
  };

  const availableTeknisi = MASTER_TEKNISI.filter((t) => t.unit === selectedUnit);

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setSelectedTeknisi(unit === 'ADMIN' ? 'ADMIN' : '');
    setManualTeknisi('');
    setAdminPassword('');
    setShowAdminPassword(false);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedUnit) {
      setErrorMessage('Silakan pilih Unit terlebih dahulu.');
      return;
    }

    if (selectedUnit === 'ADMIN') {
      const cleanPass = adminPassword.trim().toUpperCase().replace(/\s+/g, '');
      if (cleanPass !== 'ADMIN123') {
        setErrorMessage("Password Admin Salah! Gunakan 'ADMIN123'");
        return;
      }
      onLoginSuccess({
        name: 'ADMIN',
        unit: 'ADMIN',
        isAdmin: true,
        sto: 'PUSAT',
      });
      return;
    }

    let finalName = '';
    if (selectedUnit === 'LAIN-2') {
      finalName = manualTeknisi.trim().toUpperCase();
      if (!finalName) {
        setErrorMessage('Silakan ketik nama Teknisi / User.');
        return;
      }
    } else {
      finalName = selectedTeknisi.trim().toUpperCase();
      if (!finalName) {
        setErrorMessage('Silakan pilih Nama Teknisi / User dari daftar.');
        return;
      }
    }

    const matched = MASTER_TEKNISI.find((t) => t.name === finalName && t.unit === selectedUnit);
    const sto = matched ? matched.sto : 'BGR';

    onLoginSuccess({
      name: finalName,
      unit: selectedUnit,
      isAdmin: false,
      sto,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient Blobs for cool and elegant vibe */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-indigo-200/50 via-purple-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* TOP FLOATING / HEADER BAR - Elegan & Keren dengan Tombol Download App PWA */}
      <header className="w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
         <img src="/PT%20KES.jpg" alt="PT KES" className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
              <span>CEK ALAT KERJA</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h1>
            <p className="text-[9px] text-slate-500 font-medium tracking-wide">
              Assurance & Provisioning
            </p>
          </div>
        </div>

        {/* TOMBOL DOWNLOAD APP PWA PERSIS SESUAI GAMBAR USER (image_42e0e884.png) */}
        <button
          type="button"
          onClick={handlePwaClick}
          className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg shadow-sky-500/25 transition-all duration-200 hover:scale-[1.02] flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-[13px] border border-sky-300/40 cursor-pointer group"
          title="Download dan Pasang Aplikasi ke Layar Utama HP"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] group-hover:-translate-y-0.5 transition-transform" />
          <span className="font-bold tracking-tight">Download App</span>
          <span className="bg-white/25 text-white text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
            PWA
          </span>
        </button>
      </header>

      {/* LOGIN CARD CENTERED */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-auto">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 transform transition-all">
          {/* Top Header Card */}
          <div className="bg-gradient-to-b from-[#251e7a] via-[#312a91] to-[#3f34bd] p-5 sm:p-6 text-white text-center relative overflow-hidden">
            {/* Subtle Shield Watermark in background */}
            <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none">
              <Shield className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10 space-y-2">
              {/* Rounded Icon Box */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md mb-0.5 border border-white/20 shadow-inner">
                <Wrench className="w-6 h-6 text-emerald-400 stroke-[2.2]" />
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Cek Alat Kerja</h2>

              {/* Subtitle */}
              <p className="text-[11px] text-indigo-100 leading-relaxed max-w-xs mx-auto font-normal">
                Silakan login memilih Unit dan Nama Teknisi Anda untuk membuka aplikasi. Data tersinkronisasi otomatis via Cloud.
              </p>
            </div>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. PILIH UNIT */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold tracking-wide mb-1.5">
                <label className="text-slate-700 uppercase">PILIH UNIT</label>
                <span className="text-rose-500 font-semibold text-[10px] uppercase tracking-wider">* WAJIB</span>
              </div>
              <div className="relative">
                <select
                  value={selectedUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  required
                  className="w-full border border-slate-300/90 rounded-xl py-2.5 px-3.5 text-xs sm:text-[13px] font-medium text-slate-700 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Unit --</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ASSURANCE">ASSURANCE</option>
                  <option value="PROVISIONING">PROVISIONING</option>
                  <option value="LAIN-2">LAIN-2</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. PILIH NAMA TEKNISI / USER */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold tracking-wide mb-1.5">
                <label className="text-slate-700 uppercase">
                  {selectedUnit === 'LAIN-2' ? 'KETIK NAMA TEKNISI / USER' : 'PILIH NAMA TEKNISI / USER'}
                </label>
                <span className="text-rose-500 font-semibold text-[10px] uppercase tracking-wider">* WAJIB</span>
              </div>

              {selectedUnit === 'ADMIN' ? (
                <div className="relative">
                  <input
                    type="text"
                    value="ADMIN"
                    readOnly
                    className="w-full border border-slate-200 bg-slate-100 rounded-xl py-2.5 px-3.5 text-xs sm:text-[13px] font-bold text-slate-700 cursor-not-allowed outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              ) : selectedUnit === 'LAIN-2' ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik Nama Teknisi / User Manual..."
                    value={manualTeknisi}
                    onChange={(e) => {
                      setManualTeknisi(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    autoFocus
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-[13px] font-semibold text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none uppercase"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTeknisi}
                    onChange={(e) => {
                      setSelectedTeknisi(e.target.value);
                      setErrorMessage('');
                    }}
                    disabled={!selectedUnit}
                    required
                    className={`w-full border rounded-xl py-2.5 px-3.5 text-xs sm:text-[13px] font-medium transition shadow-2xs outline-none appearance-none cursor-pointer ${
                      !selectedUnit
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300/90 text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500'
                    }`}
                  >
                    {!selectedUnit ? (
                      <option value="">-- Pilih Unit Terlebih Dahulu --</option>
                    ) : (
                      <>
                        <option value="">-- Pilih Nama Teknisi ({availableTeknisi.length} Teknisi) --</option>
                        {availableTeknisi.map((tek) => (
                          <option key={tek.id} value={tek.name}>
                            {tek.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. PASSWORD ADMIN (HANYA MUNCUL JIKA UNIT = ADMIN) */}
            {selectedUnit === 'ADMIN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between text-xs font-bold tracking-wide mb-1.5">
                  <label className="text-slate-700 uppercase">PASSWORD ADMIN</label>
                  <span className="text-rose-500 font-semibold text-[10px] uppercase tracking-wider">* WAJIB</span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Masukkan Password Admin (ADMIN123)"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className="w-full border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-[13px] font-medium text-slate-800 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition cursor-pointer"
                    title={showAdminPassword ? 'Sembunyikan password' : 'Lihat teks password'}
                    aria-label={showAdminPassword ? 'Sembunyikan password' : 'Lihat teks password'}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Gunakan password: <b>ADMIN123</b></p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <span>Masuk Aplikasi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* OPSI AKSES DOWNLOAD APP PWA PADA CARD */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handlePwaClick}
                className="w-full py-2 px-3 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/20 transition flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.4] group-hover:-translate-y-0.5 transition-transform" />
                <span>Download App</span>
                <span className="bg-white/25 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  PWA
                </span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Pasang di Layar Utama HP (Android & iOS) tanpa install APK
              </p>
            </div>

            {/* Bottom Footer Note */}
            <div className="text-center pt-1">
              <p className="text-[10.5px] text-slate-400 font-medium flex items-center justify-center space-x-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cloud Database Active & Real-time Sync</span>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-3 text-[11px] text-slate-400">
        Sistem Cek Alat Kerja & Inventaris • Telkom Akses
      </footer>

      {/* PWA GUIDE MODAL (BERWARNA-WARNI INDAH & FONT MANIS) */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-indigo-100">
            {/* Header Modal Berwarna-warni */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-2.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 border border-white/30 shadow-inner">
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-xs sm:text-sm tracking-tight">Instal Aplikasi di HP</h3>
                    <span className="bg-amber-300 text-slate-900 font-black text-[8px] px-1 py-0.2 rounded uppercase">
                      PWA
                    </span>
                  </div>
                  <p className="text-[9.5px] text-sky-100 font-medium">Akses langsung dari layar utama tanpa Play Store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="w-7 h-7 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body dengan Font Manis & Panduan Jelas */}
            <div className="p-4 space-y-3 text-[11px] text-slate-700">
              <div className="p-2.5 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-sky-900 leading-snug">
                  Aplikasi web ini dapat langsung diinstal ke HP Anda menjadi aplikasi native (ringan, cepat dibuka, dan hemat memori).
                </p>
              </div>

              {/* Panduan Android */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-1.5">
                <p className="font-bold text-indigo-700 flex items-center space-x-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Untuk Pengguna Android (Chrome):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[10.5px]">
                  <li>Buka aplikasi ini di browser Chrome HP.</li>
                  <li>Ketuk titik tiga (<b>⋮</b>) di pojok kanan atas browser.</li>
                  <li>Pilih menu <b>"Tambahkan ke Layar Utama"</b> atau <b>"Instal Aplikasi"</b>.</li>
                </ol>
              </div>

              {/* Panduan iPhone iOS */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                  <Apple className="w-4 h-4 text-slate-700" />
                  <span>Untuk Pengguna iPhone (Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[10.5px]">
                  <li>Buka tautan aplikasi ini di browser Safari iPhone.</li>
                  <li>Ketuk tombol <b>Bagikan (Share icon)</b> di bagian bawah.</li>
                  <li>Gulir ke bawah lalu pilih <b>"Tambahkan ke Layar Utama"</b> (<i>Add to Home Screen</i>).</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 space-y-2">
                {deferredPrompt ? (
                  <button
                    type="button"
                    onClick={handlePwaClick}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi Sekarang</span>
                  </button>
                ) : isAppInstalled ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aplikasi Sudah Terpasang di Perangkat Ini</span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowPwaModal(false)}
                  className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
