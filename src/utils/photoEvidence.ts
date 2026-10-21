// Professional SVG DataURLs for realistic tool evidence photos

export function createToolEvidenceSvg(toolName: string, brand: string, technician: string, dateStr: string): string {
  const cleanTool = toolName.toUpperCase();
  let iconPath = '';
  let bgColor = '#1e1b4b'; // deep indigo
  let accentColor = '#38bdf8'; // sky blue

  if (cleanTool.includes('SPLICER')) {
    bgColor = '#0f172a';
    accentColor = '#22c55e'; // green screen
  } else if (cleanTool.includes('OPM') || cleanTool.includes('POWER METER')) {
    bgColor = '#1e293b';
    accentColor = '#f59e0b'; // amber
  } else if (cleanTool.includes('TANGGA')) {
    bgColor = '#334155';
    accentColor = '#e2e8f0';
  } else if (cleanTool.includes('CLEAVER')) {
    bgColor = '#1e1b4b';
    accentColor = '#6366f1';
  } else if (cleanTool.includes('HELM') || cleanTool.includes('SAFETY') || cleanTool.includes('HARNES')) {
    bgColor = '#78350f';
    accentColor = '#facc15';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bgColor}"/>
    <!-- Device grid frame -->
    <rect x="20" y="20" width="360" height="260" rx="16" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <!-- Screen / viewfinder -->
    <rect x="40" y="40" width="320" height="150" rx="10" fill="#020617" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Central Tool Badge -->
    <rect x="60" y="60" width="280" height="110" rx="8" fill="#0f172a"/>
    <circle cx="95" cy="115" r="28" fill="${accentColor}" opacity="0.2"/>
    <text x="95" y="122" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${accentColor}" text-anchor="middle">⚙</text>
    
    <text x="140" y="100" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${toolName}</text>
    <text x="140" y="122" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">${brand}</text>
    <text x="140" y="142" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#22c55e">● KONDISI LAYAK / SIAP PAKAI</text>
    
    <!-- Evidence watermark footer -->
    <rect x="40" y="202" width="320" height="60" rx="6" fill="#090d16" opacity="0.9"/>
    <text x="50" y="222" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#38bdf8">EVIDEN BON ALKER - PT TELKOM AKSES</text>
    <text x="50" y="238" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">Teknisi: ${technician}</text>
    <text x="50" y="252" font-family="Arial, sans-serif" font-size="9" fill="#94a3b8">Waktu: ${dateStr} • Status: Terverifikasi</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
