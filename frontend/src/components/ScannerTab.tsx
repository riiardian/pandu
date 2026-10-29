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

function RiskGaugeDial({ score, threatLevel }: { score: number; threatLevel: string }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  // Needle angle: -90deg at 0% score to +90deg at 100% score
  const needleAngle = -90 + (clampedScore / 100) * 180;
  // Radius = 85, Semi-circle length = PI * 85 ≈ 267.04
  const arcLength = 267.04;
  const strokeOffset = arcLength - (clampedScore / 100) * arcLength;

  // Dynamic colors:
  // Score < 35: Emerald Green (#10b981)
  // Score 35 - 69: Amber Orange (#f59e0b)
  // Score >= 70: Rose Red (#f43f5e)
  let color = "#10b981";
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let badgeBorder = "border-emerald-500/30";
  let badgeBg = "bg-emerald-950/40 text-emerald-300";

  if (clampedScore >= 70) {
    color = "#f43f5e";
    glowColor = "rgba(244, 63, 94, 0.5)";
    badgeBorder = "border-rose-500/40";
    badgeBg = "bg-rose-950/50 text-rose-300";
  } else if (clampedScore >= 35) {
    color = "#f59e0b";
    glowColor = "rgba(245, 158, 11, 0.45)";
    badgeBorder = "border-amber-500/30";
    badgeBg = "bg-amber-950/40 text-amber-300";
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center select-none">
      {/* Semi-circular Speedometer Dial */}
      <div className="relative w-[220px] sm:w-[240px] h-[125px] sm:h-[135px]">
        <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
          <defs>
            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.6" />
            </filter>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 35 115 A 85 85 0 0 1 205 115"
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d="M 35 115 A 85 85 0 0 1 205 115"
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeDasharray="267.04"
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            filter="url(#dialGlow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Scale Reference Marks */}
          <text x="24" y="132" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">0%</text>
          <text x="120" y="24" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">50%</text>
          <text x="216" y="132" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">100%</text>

          {/* Panah Timbangan (Rotating Needle) */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: "120px 115px",
              transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Needle Body */}
            <line
              x1="120"
              y1="115"
              x2="120"
              y2="42"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#dialGlow)"
            />
            {/* Arrowhead / Diamond Pointer Tip */}
            <polygon
              points="120,32 115,44 125,44"
              fill={color}
              filter="url(#dialGlow)"
            />
            {/* Counterbalance Tail */}
            <line
              x1="120"
              y1="115"
              x2="120"
              y2="124"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Center Pivot Point */}
            <circle cx="120" cy="115" r="7" fill={color} />
            <circle cx="120" cy="115" r="3" fill="#0c0d12" />
          </g>
        </svg>
      </div>

      {/* Numerical Score & Verdict */}
      <div className="-mt-3 space-y-1">
        <div
          className="text-3xl sm:text-4xl font-black font-sans tracking-tight"
          style={{ color, textShadow: `0 0 18px ${glowColor}` }}
        >
          {clampedScore}%
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Indeks Risiko
        </div>
        <div className="pt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badgeBorder} ${badgeBg}`}
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
