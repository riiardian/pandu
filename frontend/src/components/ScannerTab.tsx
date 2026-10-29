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

const SPEEDTEST_TICKS = [
  { x1: 83.35, y1: 190.92, x2: 78.76, y2: 194.78, isMajor: true },
  { x1: 69.81, y1: 175.86, x2: 67.14, y2: 177.22, isMajor: false },
  { x1: 62.67, y1: 156.77, x2: 59.76, y2: 157.50, isMajor: false },
  { x1: 60.01, y1: 136.57, x2: 57.01, y2: 136.62, isMajor: false },
  { x1: 64.90, y1: 116.91, x2: 59.03, y2: 115.66, isMajor: true },
  { x1: 68.43, y1: 96.96, x2: 65.71, y2: 95.70, isMajor: false },
  { x1: 79.08, y1: 79.59, x2: 76.71, y2: 77.74, isMajor: false },
  { x1: 93.36, y1: 65.06, x2: 91.47, y2: 62.73, isMajor: false },
  { x1: 111.86, y1: 56.80, x2: 109.23, y2: 51.41, isMajor: true },
  { x1: 129.75, y1: 47.31, x2: 129.08, y2: 44.38, isMajor: false },
  { x1: 150.00, y1: 45.00, x2: 150.00, y2: 42.00, isMajor: false },
  { x1: 170.25, y1: 47.31, x2: 170.92, y2: 44.38, isMajor: false },
  { x1: 188.14, y1: 56.80, x2: 190.77, y2: 51.41, isMajor: true },
  { x1: 206.64, y1: 65.06, x2: 208.53, y2: 62.73, isMajor: false },
  { x1: 220.92, y1: 79.59, x2: 223.29, y2: 77.74, isMajor: false },
  { x1: 231.57, y1: 96.96, x2: 234.29, y2: 95.70, isMajor: false },
  { x1: 235.10, y1: 116.91, x2: 240.97, y2: 115.66, isMajor: true },
  { x1: 239.99, y1: 136.57, x2: 242.99, y2: 136.62, isMajor: false },
  { x1: 237.33, y1: 156.77, x2: 240.24, y2: 157.50, isMajor: false },
  { x1: 230.19, y1: 175.86, x2: 232.86, y2: 177.22, isMajor: false },
  { x1: 216.65, y1: 190.92, x2: 221.24, y2: 194.78, isMajor: true },
];

const SPEEDTEST_LABELS = [
  { x: 90.25, y: 185.14, val: 0 },
  { x: 73.70, y: 118.78, val: 20 },
  { x: 115.81, y: 64.89, val: 40 },
  { x: 184.19, y: 64.89, val: 60 },
  { x: 226.30, y: 118.78, val: 80 },
  { x: 209.75, y: 185.14, val: 100 },
];

function RiskGaugeDial({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  // Needle angle: -130deg at 0% score to +130deg at 100% score (260deg sweep, Ookla Speedtest spec)
  const needleAngle = -130 + (clampedScore / 100) * 260;
  // Circumference for 260 deg arc on r=100: 2 * PI * 100 * (260/360) = 453.79
  const arcLength = 453.79;
  const activeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  // Dynamic colors:
  // Score < 35: Vibrant Cyan-Emerald (#10b981)
  // Score 35 - 69: Vibrant Amber-Orange (#f59e0b)
  // Score >= 70: Vibrant Crimson-Rose (#ef4444)
  let mainColor = "#10b981";
  let gradStart = "#06b6d4";
  let gradEnd = "#10b981";

  if (clampedScore >= 70) {
    mainColor = "#ef4444";
    gradStart = "#f59e0b";
    gradEnd = "#ef4444";
  } else if (clampedScore >= 35) {
    mainColor = "#f59e0b";
    gradStart = "#10b981";
    gradEnd = "#f59e0b";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      {/* Speedtest Style Radial Gauge */}
      <div className="relative w-[270px] sm:w-[290px] h-[195px] sm:h-[205px]">
        <svg viewBox="0 0 300 220" className="w-full h-full overflow-visible">
          <defs>
            {/* Multi-tier bloom glow for active sweep */}
            <filter id="speedtestBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={mainColor} floodOpacity="0.7" />
            </filter>
            <filter id="speedtestNeedleShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            {/* Active sweep gradient */}
            <linearGradient id="speedtestSweepGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>

          {/* Inactive Background Ribbon (Translucent white/slate track) */}
          <path
            d="M 73.40 199.28 A 100 100 0 1 1 226.60 199.28"
            fill="none"
            stroke="rgba(255, 255, 255, 0.10)"
            strokeWidth="12"
            strokeLinecap="butt"
          />

          {/* Outer Fine Ring Guide */}
          <path
            d="M 68.03 203.78 A 107 107 0 1 1 231.97 203.78"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.8"
          />

          {/* Redline Danger Zone Ribbon (80 to 100) */}
          <path
            d="M 247.81 114.21 A 100 100 0 0 1 226.60 199.28"
            fill="none"
            stroke="rgba(239, 68, 68, 0.25)"
            strokeWidth="12"
            strokeLinecap="butt"
          />

          {/* Active Swept Ribbon (Dynamic fill from 0 up to current needle angle) */}
          <path
            d="M 73.40 199.28 A 100 100 0 1 1 226.60 199.28"
            fill="none"
            stroke="url(#speedtestSweepGrad)"
            strokeWidth="12"
            strokeLinecap="butt"
            strokeDasharray={arcLength}
            strokeDashoffset={activeDashoffset}
            filter="url(#speedtestBloom)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
          />

          {/* Radial Ticks Inside Arc */}
          {SPEEDTEST_TICKS.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isMajor ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
              strokeWidth={t.isMajor ? 2.6 : 1.2}
              strokeLinecap="round"
            />
          ))}

          {/* Scale Labels (Solid thick bold white 0 to 100) */}
          {SPEEDTEST_LABELS.map((l, idx) => (
            <text
              key={idx}
              x={l.x}
              y={l.y}
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="0.5"
              fontSize="13.5"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {l.val}
            </text>
          ))}

          {/* CUSTOM ELECTRIC BLUE ARROWHEAD NEEDLE */}
          <g
            transform={`rotate(${needleAngle} 150 135)`}
            filter="url(#speedtestNeedleShadow)"
            style={{ transition: "transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
          >
            {/* Aerodynamic Counterbalance Tail */}
            <polygon points="147.5,135 147,153 153,153 152.5,135" fill="#111827" stroke="#1f2937" strokeWidth="0.8" />
            <circle cx="150" cy="147" r="1.6" fill="#00d2ff" />

            {/* Main Stem: Two-tone Electric Blue */}
            <polygon points="147.5,135 148.5,51 151.5,51 152.5,135" fill="#0284c7" />
            <polygon points="150,135 150,51 151.5,51 152.5,135" fill="#00d2ff" />

            {/* Distinct Precision Arrowhead Tip */}
            <polygon points="146.2,51 150,35 150,51" fill="#0284c7" />
            <polygon points="153.8,51 150,35 150,51" fill="#00d2ff" />
            {/* Sharp white illuminated spine and apex */}
            <line x1="150" y1="135" x2="150" y2="37" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <polygon points="148.8,39 150,35 151.2,39" fill="#ffffff" />
          </g>

          {/* CLEAN, SIMPLE, SOLID FLAT BLACK CENTER HUB */}
          <circle cx="150" cy="135" r="13" fill="#000000" stroke="#334155" strokeWidth="1.6" />
        </svg>
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
            <RiskGaugeDial score={result.risk_score} />
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
