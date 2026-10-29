"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  FileCode,
  ArrowRight,
  Flame,
  MessageSquare,
  Globe,
  Phone,
  CreditCard,
  Mail,
  Upload,
  FileText,
  ChevronDown,
  Eye,
} from "lucide-react";

interface ScannerTabProps {
  onForwardToDossier?: (data: {
    category: string;
    suspect_url?: string;
    chronology: string;
  }) => void;
}

type ScanCategory = "text" | "url" | "phone" | "bank" | "email" | "file";

interface BankOption {
  id: string;
  code: string;
  name: string;
  fullName: string;
  type: string;
  category: "bank" | "ewallet";
  routingCode: string;
}

const BANK_CATALOG: BankOption[] = [
  { id: "BCA", code: "BCA", name: "BCA", fullName: "Bank Central Asia (BCA)", type: "Bank Swasta", category: "bank", routingCode: "014" },
  { id: "BRI", code: "BRI", name: "BRI", fullName: "Bank Rakyat Indonesia (BRI)", type: "Bank BUMN", category: "bank", routingCode: "002" },
  { id: "Mandiri", code: "MANDIRI", name: "Bank Mandiri", fullName: "Bank Mandiri (Persero)", type: "Bank BUMN", category: "bank", routingCode: "008" },
  { id: "BNI", code: "BNI", name: "BNI", fullName: "Bank Negara Indonesia (BNI)", type: "Bank BUMN", category: "bank", routingCode: "009" },
  { id: "BSI", code: "BSI", name: "BSI", fullName: "Bank Syariah Indonesia (BSI)", type: "Bank Syariah", category: "bank", routingCode: "451" },
  { id: "CIMB", code: "CIMB", name: "CIMB Niaga", fullName: "Bank CIMB Niaga", type: "Bank Swasta", category: "bank", routingCode: "022" },
  { id: "Danamon", code: "DANAMON", name: "Bank Danamon", fullName: "Bank Danamon Indonesia", type: "Bank Swasta", category: "bank", routingCode: "011" },
  { id: "Permata", code: "PERMATA", name: "Bank Permata", fullName: "Bank Permata", type: "Bank Swasta", category: "bank", routingCode: "013" },
  { id: "BTN", code: "BTN", name: "BTN", fullName: "Bank Tabungan Negara (BTN)", type: "Bank BUMN", category: "bank", routingCode: "200" },
  { id: "Jago", code: "JAGO", name: "Bank Jago", fullName: "Bank Jago Digital", type: "Bank Digital", category: "bank", routingCode: "542" },
  { id: "SeaBank", code: "SEABANK", name: "SeaBank", fullName: "SeaBank Indonesia", type: "Bank Digital", category: "bank", routingCode: "535" },
  { id: "DANA", code: "DANA", name: "DANA", fullName: "DANA (Dompet Digital)", type: "E-Wallet", category: "ewallet", routingCode: "014 / 002 (VA)" },
  { id: "GoPay", code: "GOPAY", name: "GoPay", fullName: "GoPay (Gojek Ecosystem)", type: "E-Wallet", category: "ewallet", routingCode: "70001 (VA)" },
  { id: "OVO", code: "OVO", name: "OVO", fullName: "OVO (Payment)", type: "E-Wallet", category: "ewallet", routingCode: "39358 (VA)" },
  { id: "ShopeePay", code: "SHOPEEPAY", name: "ShopeePay", fullName: "ShopeePay Indonesia", type: "E-Wallet", category: "ewallet", routingCode: "122 (VA)" },
];

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRY_CATALOG: CountryOption[] = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "SG", name: "Singapura", flag: "🇸🇬", dialCode: "+65" },
  { code: "PH", name: "Filipina", flag: "🇵🇭", dialCode: "+63" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "KH", name: "Kamboja (Cambodia)", flag: "🇰🇭", dialCode: "+855" },
  { code: "MM", name: "Myanmar (Burma)", flag: "🇲🇲", dialCode: "+95" },
  { code: "LA", name: "Laos", flag: "🇱🇦", dialCode: "+856" },
  { code: "US", name: "Amerika Serikat", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", name: "Inggris Raya (UK)", flag: "🇬🇧", dialCode: "+44" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "JP", name: "Jepang", flag: "🇯🇵", dialCode: "+81" },
  { code: "KR", name: "Korea Selatan", flag: "🇰🇷", dialCode: "+82" },
  { code: "CN", name: "Tiongkok (China)", flag: "🇨🇳", dialCode: "+86" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "SA", name: "Arab Saudi", flag: "🇸🇦", dialCode: "+966" },
  { code: "AE", name: "Uni Emirat Arab", flag: "🇦🇪", dialCode: "+971" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "RU", name: "Rusia", flag: "🇷🇺", dialCode: "+7" },
  { code: "UA", name: "Ukraina", flag: "🇺🇦", dialCode: "+380" },
  { code: "DE", name: "Jerman", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", name: "Prancis", flag: "🇫🇷", dialCode: "+33" },
  { code: "NL", name: "Belanda", flag: "🇳🇱", dialCode: "+31" },
  { code: "TR", name: "Turki", flag: "🇹🇷", dialCode: "+90" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55" },
];

interface PipelineStep {
  title: string;
  desc: string;
}

const TOOL_PIPELINES: Record<ScanCategory, PipelineStep[]> = {
  text: [
    { title: "Membaca Muatan Pesan", desc: "" },
    { title: "Mendeteksi Pola Manipulasi", desc: "" },
    { title: "Mencocokkan Modus Penipuan", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
  url: [
    { title: "Memeriksa Alamat & Pengalihan", desc: "" },
    { title: "Mengaudit Enkripsi & Struktur Server", desc: "" },
    { title: "Membedah Halaman & Alur Data", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
  phone: [
    { title: "Mengidentifikasi Asal Nomor", desc: "" },
    { title: "Melacak Rekam Jejak Digital", desc: "" },
    { title: "Menguji Riwayat Daftar Hitam", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
  bank: [
    { title: "Memvalidasi Lembaga Perbankan", desc: "" },
    { title: "Penelusuran Jejak Kejahatan Finansial", desc: "" },
    { title: "Menguji Riwayat Rekening Mencurigakan", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
  email: [
    { title: "Memeriksa Format & Domain", desc: "" },
    { title: "Mengecek Reputasi Spam Global", desc: "" },
    { title: "Menguji Server Penerima Email", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
  file: [
    { title: "Membaca Byte & Hash Berkas", desc: "" },
    { title: "Memeriksa Struktur Berkas", desc: "" },
    { title: "Membedah Teks & Kejanggalan Visual", desc: "" },
    { title: "Menghitung Indeks Risiko", desc: "" },
  ],
};

const GAUGE_TICKS = [
  { x1: 56.03, y1: 159.20, x2: 71.07, y2: 153.73, stroke: "#0f172a", width: 2.6 },
  { x1: 53.68, y1: 151.89, x2: 60.43, y2: 150.01, stroke: "#64748b", width: 1.0 },
  { x1: 51.90, y1: 144.42, x2: 58.77, y2: 143.06, stroke: "#64748b", width: 1.0 },
  { x1: 50.70, y1: 136.84, x2: 57.65, y2: 136.01, stroke: "#64748b", width: 1.0 },
  { x1: 50.09, y1: 129.19, x2: 57.08, y2: 128.89, stroke: "#64748b", width: 1.0 },
  { x1: 50.06, y1: 121.51, x2: 62.05, y2: 121.93, stroke: "#0f172a", width: 1.8 },
  { x1: 50.62, y1: 113.85, x2: 57.58, y2: 114.63, stroke: "#64748b", width: 1.0 },
  { x1: 51.77, y1: 106.26, x2: 58.65, y2: 107.57, stroke: "#64748b", width: 1.0 },
  { x1: 53.50, y1: 98.78, x2: 60.25, y2: 100.62, stroke: "#64748b", width: 1.0 },
  { x1: 55.79, y1: 91.45, x2: 62.39, y2: 93.80, stroke: "#64748b", width: 1.0 },
  { x1: 58.65, y1: 84.33, x2: 73.26, y2: 90.83, stroke: "#0f172a", width: 2.6 },
  { x1: 62.04, y1: 77.44, x2: 68.19, y2: 80.77, stroke: "#64748b", width: 1.0 },
  { x1: 65.94, y1: 70.83, x2: 71.83, y2: 74.62, stroke: "#64748b", width: 1.0 },
  { x1: 70.35, y1: 64.54, x2: 75.92, y2: 68.77, stroke: "#64748b", width: 1.0 },
  { x1: 75.22, y1: 58.61, x2: 80.45, y2: 63.25, stroke: "#64748b", width: 1.0 },
  { x1: 80.53, y1: 53.07, x2: 88.87, y2: 61.70, stroke: "#0f172a", width: 1.8 },
  { x1: 86.26, y1: 47.95, x2: 90.72, y2: 53.34, stroke: "#64748b", width: 1.0 },
  { x1: 92.36, y1: 43.29, x2: 96.39, y2: 49.01, stroke: "#64748b", width: 1.0 },
  { x1: 98.80, y1: 39.10, x2: 102.38, y2: 45.12, stroke: "#64748b", width: 1.0 },
  { x1: 105.54, y1: 35.43, x2: 108.65, y2: 41.70, stroke: "#64748b", width: 1.0 },
  { x1: 112.54, y1: 32.28, x2: 118.53, y2: 47.12, stroke: "#0f172a", width: 2.6 },
  { x1: 119.76, y1: 29.68, x2: 121.88, y2: 36.35, stroke: "#64748b", width: 1.0 },
  { x1: 127.16, y1: 27.64, x2: 128.76, y2: 34.46, stroke: "#64748b", width: 1.0 },
  { x1: 134.70, y1: 26.18, x2: 135.77, y2: 33.09, stroke: "#64748b", width: 1.0 },
  { x1: 142.33, y1: 25.29, x2: 142.87, y2: 32.27, stroke: "#64748b", width: 1.0 },
  { x1: 150.00, y1: 25.00, x2: 150.00, y2: 37.00, stroke: "#0f172a", width: 1.8 },
  { x1: 157.67, y1: 25.29, x2: 157.13, y2: 32.27, stroke: "#64748b", width: 1.0 },
  { x1: 165.30, y1: 26.18, x2: 164.23, y2: 33.09, stroke: "#64748b", width: 1.0 },
  { x1: 172.84, y1: 27.64, x2: 171.24, y2: 34.46, stroke: "#64748b", width: 1.0 },
  { x1: 180.24, y1: 29.68, x2: 178.12, y2: 36.35, stroke: "#64748b", width: 1.0 },
  { x1: 187.46, y1: 32.28, x2: 181.47, y2: 47.12, stroke: "#0f172a", width: 2.6 },
  { x1: 194.46, y1: 35.43, x2: 191.35, y2: 41.70, stroke: "#64748b", width: 1.0 },
  { x1: 201.20, y1: 39.10, x2: 197.62, y2: 45.12, stroke: "#64748b", width: 1.0 },
  { x1: 207.64, y1: 43.29, x2: 203.61, y2: 49.01, stroke: "#64748b", width: 1.0 },
  { x1: 213.74, y1: 47.95, x2: 209.28, y2: 53.34, stroke: "#64748b", width: 1.0 },
  { x1: 219.47, y1: 53.07, x2: 211.13, y2: 61.70, stroke: "#dc2626", width: 1.8 },
  { x1: 224.78, y1: 58.61, x2: 219.55, y2: 63.25, stroke: "#f87171", width: 1.0 },
  { x1: 229.65, y1: 64.54, x2: 224.08, y2: 68.77, stroke: "#f87171", width: 1.0 },
  { x1: 234.06, y1: 70.83, x2: 228.17, y2: 74.62, stroke: "#f87171", width: 1.0 },
  { x1: 237.96, y1: 77.44, x2: 231.81, y2: 80.77, stroke: "#f87171", width: 1.0 },
  { x1: 241.35, y1: 84.33, x2: 226.74, y2: 90.83, stroke: "#dc2626", width: 2.6 },
  { x1: 244.21, y1: 91.45, x2: 237.61, y2: 93.80, stroke: "#f87171", width: 1.0 },
  { x1: 246.50, y1: 98.78, x2: 239.75, y2: 100.62, stroke: "#f87171", width: 1.0 },
  { x1: 248.23, y1: 106.26, x2: 241.35, y2: 107.57, stroke: "#f87171", width: 1.0 },
  { x1: 249.38, y1: 113.85, x2: 242.42, y2: 114.63, stroke: "#f87171", width: 1.0 },
  { x1: 249.94, y1: 121.51, x2: 237.95, y2: 121.93, stroke: "#dc2626", width: 1.8 },
  { x1: 249.91, y1: 129.19, x2: 242.92, y2: 128.89, stroke: "#f87171", width: 1.0 },
  { x1: 249.30, y1: 136.84, x2: 242.35, y2: 136.01, stroke: "#f87171", width: 1.0 },
  { x1: 248.10, y1: 144.42, x2: 241.23, y2: 143.06, stroke: "#f87171", width: 1.0 },
  { x1: 246.32, y1: 151.89, x2: 239.57, y2: 150.01, stroke: "#f87171", width: 1.0 },
  { x1: 243.97, y1: 159.20, x2: 228.93, y2: 153.73, stroke: "#dc2626", width: 2.6 },
];

const GAUGE_LABELS = [
  { x: 84.22, y: 148.94, text: "0", color: "#0f172a" },
  { x: 86.05, y: 96.53, text: "20", color: "#0f172a" },
  { x: 123.78, y: 60.10, text: "40", color: "#0f172a" },
  { x: 176.22, y: 60.10, text: "60", color: "#0f172a" },
  { x: 213.95, y: 96.53, text: "80", color: "#dc2626" },
  { x: 215.78, y: 148.94, text: "100", color: "#dc2626" },
];

function RiskGaugeDial({ score, threatLevel }: { score: number; threatLevel: string }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  // Needle angle: -110deg at 0% score to +110deg at 100% score (220deg sweep)
  const needleAngle = -110 + (clampedScore / 100) * 220;

  // Dynamic colors:
  // Score < 35: Emerald Green (#10b981)
  // Score 35 - 69: Amber Orange (#f59e0b)
  // Score >= 70: Crimson Red (#dc2626)
  let color = "#10b981";
  let badgeBorder = "border-emerald-500/30";
  let badgeBg = "bg-emerald-950/40 text-emerald-300";

  if (clampedScore >= 70) {
    color = "#dc2626";
    badgeBorder = "border-rose-500/40";
    badgeBg = "bg-rose-950/50 text-rose-300";
  } else if (clampedScore >= 35) {
    color = "#f59e0b";
    badgeBorder = "border-amber-500/30";
    badgeBg = "bg-amber-950/40 text-amber-300";
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center select-none">
      {/* Precision White Dial Speedometer */}
      <div className="relative w-[260px] sm:w-[280px] h-[185px] sm:h-[195px]">
        <svg viewBox="0 0 300 215" className="w-full h-full overflow-visible">
          <defs>
            {/* Needle physical drop shadow */}
            <filter id="gaugeNeedleShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>

            {/* Chrome Bezel Rim Gradient */}
            <linearGradient id="gaugeChromeBezel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* White Enameled Face Disc with subtle pearl depth */}
            <radialGradient id="gaugeWhiteDial" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>

            {/* Machined Metal Center Hub */}
            <radialGradient id="gaugeMetalHub" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="55%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>

          {/* Chrome Bezel Ring */}
          <circle cx="150" cy="125" r="115" fill="#0b0f19" stroke="url(#gaugeChromeBezel)" strokeWidth="2.5" />

          {/* White Enameled Dial Face */}
          <circle cx="150" cy="125" r="112" fill="url(#gaugeWhiteDial)" />
          <circle cx="150" cy="125" r="112" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />

          {/* Calibrated White Dial Track Arc (220 deg sweep) */}
          <path
            d="M 56.03 159.20 A 100 100 0 1 1 243.97 159.20"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Redline Danger Zone Arc (70% - 100%) */}
          <path
            d="M 219.47 53.07 A 100 100 0 0 1 243.97 159.20"
            fill="none"
            stroke="#dc2626"
            strokeWidth="4.0"
            strokeLinecap="round"
          />

          {/* Precision Graduation Ticks */}
          {GAUGE_TICKS.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.stroke}
              strokeWidth={t.width}
              strokeLinecap="round"
            />
          ))}

          {/* Speedometer Scale Numbers (0, 20, 40, 60, 80, 100) */}
          {GAUGE_LABELS.map((l, idx) => (
            <text
              key={idx}
              x={l.x}
              y={l.y}
              fill={l.color}
              fontSize="10.5"
              fontFamily="-apple-system, system-ui, sans-serif"
              fontWeight="800"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {l.text}
            </text>
          ))}

          {/* Dial Subtitle */}
          <text
            x="150"
            y="87"
            fill="#64748b"
            fontSize="8.5"
            fontFamily="monospace"
            fontWeight="700"
            letterSpacing="1.5"
            textAnchor="middle"
          >
            INDEKS RISIKO
          </text>

          {/* REAL SPEEDOMETER NEEDLE ASSEMBLY */}
          <g
            transform={`rotate(${needleAngle} 150 125)`}
            filter="url(#gaugeNeedleShadow)"
            style={{ transition: "transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
          >
            {/* Counterbalance Tail */}
            <polygon points="146.5,125 145,153 155,153 153.5,125" fill="#0f172a" />
            <circle cx="150" cy="145" r="2.2" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />

            {/* Main Needle Stem: Solid Fluorescent Sports Red Blade */}
            <polygon points="146,125 149.4,27 150,24 150,125" fill="#b91c1c" />
            <polygon points="154,125 150.6,27 150,24 150,125" fill="#ef4444" />
            <line x1="150" y1="127" x2="150" y2="26" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

            {/* Center Pivot Hub */}
            <circle cx="150" cy="125" r="14" fill="url(#gaugeMetalHub)" stroke="#334155" strokeWidth="1.5" />
            <circle cx="150" cy="125" r="9" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.0" />
            <circle cx="150" cy="125" r="4" fill="#334155" />
          </g>
        </svg>
      </div>

      {/* Digital HUD Readout */}
      <div className="mt-3 flex flex-col items-center text-center space-y-1">
        <div
          className="text-4xl sm:text-5xl font-black font-sans tracking-tight"
          style={{ color }}
        >
          {clampedScore}%
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Indeks Risiko
        </div>
        <div className="pt-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badgeBorder} ${badgeBg}`}
          >
            <span
              className="h-2 w-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="truncate max-w-xs">{threatLevel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ScannerTab({ onForwardToDossier }: ScannerTabProps) {
  const router = useRouter();
  const [scanType, setScanType] = useState<ScanCategory>("text");

  // Form states
  const [inputText, setInputText] = useState("");
  const [inputURL, setInputURL] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [inputBankName, setInputBankName] = useState("BCA");
  const [inputBankAcc, setInputBankAcc] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_CATALOG[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countryFilterQuery, setCountryFilterQuery] = useState("");

  const filteredCountries = COUNTRY_CATALOG.filter((c) => {
    if (!countryFilterQuery.trim()) return true;
    const q = countryFilterQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.dialCode.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankFilterQuery, setBankFilterQuery] = useState("");

  const selectedBankObj = BANK_CATALOG.find((b) => b.id.toLowerCase() === inputBankName.toLowerCase()) || BANK_CATALOG[0];

  const filteredBanks = BANK_CATALOG.filter((b) => {
    if (!bankFilterQuery.trim()) return true;
    const q = bankFilterQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.fullName.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q)
    );
  });

  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRunScan = async () => {
    setErrorMsg("");
    setResult(null);

    let endpoint = "";
    let payload: any = {};

    if (scanType === "text") {
      if (!inputText.trim()) {
        setErrorMsg("Masukkan teks pesan atau chat yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/text";
      payload = { text: inputText };
    } else if (scanType === "url") {
      if (!inputURL.trim()) {
        setErrorMsg("Masukkan tautan atau domain website yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/url";
      payload = { url: inputURL, follow_redirects: true };
    } else if (scanType === "phone") {
      if (!inputPhone.trim()) {
        setErrorMsg("Masukkan nomor telepon atau WhatsApp yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/phone";
      const raw = inputPhone.trim();
      let formattedPhone = raw;
      if (!raw.startsWith("+")) {
        if (selectedCountry.dialCode === "+62") {
          formattedPhone = raw.startsWith("0") ? raw : "0" + raw;
        } else {
          formattedPhone = `${selectedCountry.dialCode}${raw.replace(/^0+/, "")}`;
        }
      }
      payload = { phone: formattedPhone };
    } else if (scanType === "bank") {
      if (!inputBankAcc.trim()) {
        setErrorMsg("Masukkan nomor rekening bank atau nomor akun e-wallet.");
        return;
      }
      endpoint = "/api/v1/scan/bank";
      payload = { bank_name: inputBankName, account_number: inputBankAcc };
    } else if (scanType === "email") {
      if (!inputEmail.trim()) {
        setErrorMsg("Masukkan alamat email yang ingin diperiksa.");
        return;
      }
      endpoint = "/api/v1/scan/email";
      payload = { email: inputEmail };
    } else if (scanType === "file") {
      if (!selectedFile) {
        setErrorMsg("Pilih berkas, gambar bukti transfer, atau APK yang ingin diperiksa.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran berkas maksimal 5 MB.");
        return;
      }
      endpoint = "/api/v1/scan/file";
    }

    const steps = TOOL_PIPELINES[scanType];
    const STEP_DURATION_MS = 2000;

    setLoading(true);
    setCurrentStepIndex(0);

    const startTime = Date.now();
    let stepCount = 0;
    const stepTimer = setInterval(() => {
      stepCount++;
      if (stepCount < steps.length) {
        setCurrentStepIndex(stepCount);
      }
    }, STEP_DURATION_MS);

    try {
      const isFileScan = scanType === "file" && selectedFile;
      const requestBody = isFileScan
        ? (() => {
            const form = new FormData();
            form.append("file", selectedFile);
            return form;
          })()
        : JSON.stringify(payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: isFileScan ? undefined : { "Content-Type": "application/json" },
        body: requestBody,
      });

      const responseText = await res.text();
      let json: any;
      try {
        json = JSON.parse(responseText);
      } catch {
        throw new Error(res.status === 413 ? "Ukuran berkas melebihi batas 5 MB." : "Respons engine PANDU tidak dapat dibaca.");
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses pemindaian.");
      }

      // Lock minimum 2 seconds per stage
      const totalMinDuration = steps.length * STEP_DURATION_MS;
      const elapsed = Date.now() - startTime;
      if (elapsed < totalMinDuration) {
        await new Promise((resolve) => setTimeout(resolve, totalMinDuration - elapsed));
      }

      clearInterval(stepTimer);
      setCurrentStepIndex(steps.length - 1);
      setResult(json.data);
    } catch (err: any) {
      clearInterval(stepTimer);
      setErrorMsg(err.message || "Gagal menghubungi engine keamanan PANDU.");
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSelectedFile(null);
        setErrorMsg("Ukuran berkas maksimal 5 MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      setResult(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-rose-400 bg-rose-950/40 border-rose-500/40";
    if (score >= 35) return "text-indigo-300 bg-indigo-950/30 border-indigo-500/30";
    return "text-blue-300 bg-blue-950/25 border-blue-500/25";
  };

  const TABS = [
    { id: "text", label: "Pesan Chat", icon: MessageSquare },
    { id: "url", label: "Tautan Web", icon: Globe },
    { id: "phone", label: "No. Telepon", icon: Phone },
    { id: "bank", label: "Rekening Bank", icon: CreditCard },
    { id: "email", label: "Alamat Email", icon: Mail },
    { id: "file", label: "Berkas / APK / Foto", icon: FileCode },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Intro Header Section */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-2 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Investigasi Ancaman Digital
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
          Mesin cerdas PANDU membedah rekayasa sosial, merayapi reputasi digital publik secara real-time, mengaudit alur interaksi web, dan menguji keaslian bukti transfer serta berkas mencurigakan sebelum Anda menjadi korban.
        </p>
      </section>

      {/* Main Scanner Card */}
      <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-xl">
        {/* Multi-Target Category Tabs (OSINT Industries Dynamic Pill Dock) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = scanType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setScanType(tab.id as ScanCategory);
                  setResult(null);
                  setErrorMsg("");
                  setIsBankDropdownOpen(false);
                  setIsCountryDropdownOpen(false);
                }}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 border border-blue-500"
                    : "bg-[#060a14] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
                title={tab.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {isActive && (
                  <span className="text-xs font-semibold tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Input Form Fields by Active Tab (OSINT Industries Unified Input Style) */}
        <div className="pt-1">
          {scanType === "text" && (
            <div className="rounded-xl border border-white/10 bg-[#060a14] p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tempel atau ketik teks pesan WhatsApp, SMS, atau Telegram di sini untuk dibedah modusnya..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
              />
            </div>
          )}

          {scanType === "url" && (
            <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
              <span className="flex items-center gap-1 px-3.5 py-3 text-xs text-slate-400 bg-white/5 border-r border-white/10 font-mono shrink-0 select-none">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span>https://</span>
              </span>
              <input
                type="text"
                value={inputURL}
                onChange={(e) => setInputURL(e.target.value)}
                placeholder="domain-atau-link-mencurigakan.com/login..."
                className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {scanType === "phone" && (
            <div className="relative">
              <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryDropdownOpen(!isCountryDropdownOpen);
                    setIsBankDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-3 text-xs text-white bg-white/5 border-r border-white/10 hover:bg-white/10 font-mono font-bold transition-colors cursor-pointer shrink-0 select-none"
                >
                  <span className="text-base leading-none">{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </button>
                <input
                  type="text"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  placeholder="85819238491..."
                  className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-[#0d0e12] shadow-2xl z-50 divide-y divide-white/5 animate-in fade-in duration-150">
                  <div className="p-2 sticky top-0 bg-[#0d0e12] border-b border-white/10 z-10">
                    <input
                      type="text"
                      value={countryFilterQuery}
                      onChange={(e) => setCountryFilterQuery(e.target.value)}
                      placeholder="Cari negara atau kode..."
                      className="w-full rounded-lg border border-white/10 bg-[#060a14] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c);
                        setIsCountryDropdownOpen(false);
                        setCountryFilterQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                        selectedCountry.code === c.code ? "bg-blue-600/20 text-blue-300 font-bold" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 ml-2 shrink-0">{c.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {scanType === "bank" && (
            <div className="relative">
              <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setIsBankDropdownOpen(!isBankDropdownOpen);
                    setIsCountryDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-3 text-xs text-white bg-white/5 border-r border-white/10 hover:bg-white/10 font-mono font-bold transition-colors cursor-pointer shrink-0 select-none"
                >
                  <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                  <span>{selectedBankObj?.code}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </button>
                <input
                  type="text"
                  value={inputBankAcc}
                  onChange={(e) => setInputBankAcc(e.target.value)}
                  placeholder={`Nomor rekening / akun ${selectedBankObj?.code}...`}
                  className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              {isBankDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-[#0d0e12] shadow-2xl z-50 divide-y divide-white/5 animate-in fade-in duration-150">
                  <div className="p-2 sticky top-0 bg-[#0d0e12] border-b border-white/10 z-10">
                    <input
                      type="text"
                      value={bankFilterQuery}
                      onChange={(e) => setBankFilterQuery(e.target.value)}
                      placeholder="Cari bank atau e-wallet..."
                      className="w-full rounded-lg border border-white/10 bg-[#060a14] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {filteredBanks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setInputBankName(b.id);
                        setIsBankDropdownOpen(false);
                        setBankFilterQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                        inputBankName.toLowerCase() === b.id.toLowerCase() ? "bg-blue-600/20 text-blue-300 font-bold" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{b.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-500 ml-2 shrink-0">{b.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {scanType === "email" && (
            <div className="flex items-center rounded-xl border border-white/10 bg-[#060a14] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
              <span className="flex items-center px-3.5 py-3 text-xs text-slate-400 bg-white/5 border-r border-white/10 shrink-0 select-none">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
              </span>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="nama-pengirim@domain.com..."
                className="w-full px-3.5 py-3 text-sm text-white bg-transparent placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {scanType === "file" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-xl border border-dashed border-white/20 bg-[#060a14] p-3 sm:p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Upload className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedFile ? selectedFile.name : "Unggah bukti transfer, poster loker/undian, atau berkas APK"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Mendukung JPG, PNG, WEBP, PDF, APK (Maksimal 5 MB)"}
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shrink-0 shadow-sm shadow-blue-600/30">
                  <span>{selectedFile ? "Ganti" : "Pilih File"}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".apk,.exe,.zip,.pdf,.jpg,.jpeg,.png,.webp"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 px-3">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="font-mono text-white font-medium truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 ml-2 shrink-0 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunScan}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>
              {loading
                ? "Sedang Menyelidiki..."
                : scanType === "text"
                ? "Periksa Pesan"
                : scanType === "url"
                ? "Periksa Tautan"
                : scanType === "phone"
                ? "Periksa Nomor"
                : scanType === "bank"
                ? "Periksa Rekening"
                : scanType === "email"
                ? "Periksa Email"
                : "Periksa Berkas"}
            </span>
          </button>
        </div>
      </section>

      {/* Active Forensic Inspection Pipeline (Simple & Clean Cable Stepper) */}
      {loading && (
        <section className="rounded-2xl border border-blue-500/30 bg-[#0c0d12] p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          {/* Cable & Circular Badges Stepper */}
          <div className="relative flex items-center justify-between max-w-xs sm:max-w-sm mx-auto px-2 pt-2">
            {/* Connecting Cable Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 z-0" />

            {/* Circular Stage Badges */}
            {TOOL_PIPELINES[scanType].map((_, sidx) => {
              const isActive = sidx === currentStepIndex;
              return (
                <div key={sidx} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "h-9 w-9 bg-blue-600 text-white border-2 border-blue-400 shadow-[0_0_18px_rgba(37,99,235,0.85)] scale-110"
                        : "h-8 w-8 bg-[#121316] text-slate-600 border border-white/10"
                    }`}
                  >
                    {sidx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Single Clean Active Stage Label */}
          <div className="text-center pt-1">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide animate-in fade-in duration-200">
              {TOOL_PIPELINES[scanType][currentStepIndex]?.title}...
            </h4>
          </div>
        </section>
      )}

      {/* Result Section */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300 pt-2">
          {/* Borderless Speedometer Gauge (No Box / No Card) */}
          <div className="py-2 flex flex-col items-center justify-center text-center select-none">
            <RiskGaugeDial score={result.risk_score} threatLevel={result.threat_level} />
            <div className="mt-2 text-center space-y-0.5">
              <div className="text-base font-bold text-white tracking-wide">
                {result.hostname || result.clean_number || result.account_number || result.email || result.file_name || "Target Terperiksa"}
              </div>
              {result.detected_category && (
                <div className="text-xs text-slate-400">
                  {result.detected_category}
                </div>
              )}
            </div>
          </div>

          {/* Temuan Indikator (Hanya jika ada red flags) */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4" />
                <span>Temuan Indikator ({result.red_flags.length})</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {result.red_flags.map((rf: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      rf.level === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-500/40" : "bg-amber-950 text-amber-300 border border-amber-500/40"
                    }`}>
                      {rf.level}
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-white">{rf.title}:</strong> {rf.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analisis AI Vision untuk Berkas / Gambar */}
          {result.ai_vision_result && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2 text-xs">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Analisis AI Vision ({result.ai_vision_result.content_type})</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{result.ai_vision_result.explanation}</p>
              {result.ai_vision_result.extracted_text_summary && (
                <p className="text-[11px] text-slate-400 font-mono">Teks: {result.ai_vision_result.extracted_text_summary}</p>
              )}
            </div>
          )}

          {/* Sumber Data yang Diperiksa (Transparan & Rapi) */}
          {result.sources && result.sources.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#0c0d12] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                <span className="font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Sumber Data Diperiksa ({result.sources.length})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {result.sources.filter((s: any) => s.status === "queried").length} Sumber Aktif
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {result.sources.map((source: any) => {
                  const isMatch = source.outcome === "match";
                  const isUnavailable = source.status === "unavailable";

                  // Format evidence cleanly without yapping
                  let evidenceText = "";
                  if (source.evidence && source.evidence.length > 0) {
                    const cleanItems = source.evidence
                      .filter((e: any) => {
                        if (!isMatch && e.label?.includes("Penalaran")) return false;
                        if (e.label === "expiration" || e.label === "last changed") return false;
                        if (e.label === "Ringkasan alur") return false;
                        if (e.label === "Judul halaman") return false;
                        return true;
                      })
                      .map((e: any) => {
                        if (e.label === "Alamat IP publik") {
                          const ips = (e.value || "").split(", ").filter((ip: string) => !ip.includes(":")).slice(0, 2).join(", ");
                          return `IP: ${ips || e.value}`;
                        }
                        if (e.label === "Umur Domain Aktif") return `Umur: ${e.value}`;
                        if (e.label === "Domain registry") return `Registry: ${e.value}`;
                        if (e.label === "Penerbit") return `Penerbit: ${e.value}`;
                        if (e.label === "Form publik ditemukan") return `Form: ${e.value}`;
                        return `${e.label}: ${e.value}`;
                      });
                    evidenceText = cleanItems.join(" • ");
                  }

                  if (!evidenceText) {
                    evidenceText = isMatch ? "Ditemukan catatan kecurigaan." : "Tidak ditemukan riwayat kejahatan / aduan.";
                  }

                  return (
                    <div key={source.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{source.name}</span>
                          {source.attribution_url && (
                            <a href={source.attribution_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:text-blue-300 font-mono">
                              [Tautan ↗]
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal truncate">
                          {evidenceText}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        isUnavailable
                          ? "bg-slate-800 text-slate-400"
                          : isMatch
                          ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {isUnavailable ? "Tidak Tersedia" : isMatch ? "Ada Catatan" : "Bersih"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => {
                const payload = {
                  category:
                    result.detected_category?.includes("APK") || result.file_type_category === "APK_TROJAN"
                      ? "APK_SNIFFER"
                      : result.detected_category?.includes("Loker")
                      ? "LOKER_FREELANCE"
                      : "PHISHING_URL",
                  suspect_url:
                    result.normalized_url ||
                    result.clean_number ||
                    result.email ||
                    result.file_name ||
                    "",
                  chronology: `Hasil investigasi PANDU: ${
                    result.detected_category || result.threat_level || "indikator digital"
                  }. Indeks indikator ${result.risk_score}%.`,
                };
                if (typeof window !== "undefined") {
                  try {
                    sessionStorage.setItem("pandu_forward_dossier", JSON.stringify(payload));
                  } catch (e) {}
                }
                if (onForwardToDossier) {
                  onForwardToDossier(payload);
                } else {
                  router.push("/aksi");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all w-full sm:w-auto cursor-pointer"
            >
              <span>Bawa ke Pusat Laporan &amp; Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
