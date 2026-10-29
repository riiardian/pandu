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

    setLoading(true);
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

      setResult(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi engine keamanan PANDU.");
    } finally {
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
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <BrainCircuit className="h-4 w-4" />
          <span>Autonomous Threat Intelligence &amp; AI Forensics</span>
        </div>
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
                ? "Memeriksa..."
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

      {/* Result Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Diagnostic Header Card */}
          <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Hasil Diagnosis Forensik
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {result.detected_category ||
                    (result.impersonated_brand
                      ? `Pencatutan ${result.impersonated_brand}`
                      : result.operator
                      ? `${result.operator} (${result.country_name})`
                      : result.institution_type
                      ? `${result.original_bank} — ${result.clean_number}`
                      : result.file_type_category
                      ? `Berkas: ${result.file_name}`
                      : "Pemeriksaan Keabsahan Target")}
                </h3>
                {result.hostname && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    Host: {result.hostname} {result.tld ? `(${result.tld})` : ""}
                  </p>
                )}
              </div>

              {/* Score Badge */}
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${getScoreColor(result.risk_score)}`}>
                <div className="text-right">
                  <div className="text-2xl font-black">{result.risk_score}%</div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider">Indeks Risiko</div>
                </div>
                <div className="h-8 w-px bg-current opacity-20" />
                <div className="text-xs font-bold uppercase tracking-wide">
                  {result.threat_level}
                </div>
              </div>
            </div>

            {/* AI Vision Multimodal Forensic Report */}
            {result.ai_vision_result && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                    <Eye className="h-4 w-4" />
                    <span>Bedah Forensik AI Vision (OCR &amp; Rekayasa Visual)</span>
                  </div>
                  <span className="rounded bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 text-blue-200 font-mono font-bold text-[10px]">
                    {result.ai_vision_result.content_type}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.ai_vision_result.explanation}
                </p>
                {result.ai_vision_result.extracted_text_summary && (
                  <div className="rounded-lg bg-black/50 border border-white/10 p-2 text-[11px] text-slate-300">
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Ringkasan Teks Terbaca:</span>
                    <span className="font-mono">{result.ai_vision_result.extracted_text_summary}</span>
                  </div>
                )}
                {result.ai_vision_result.visual_anomalies?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-rose-300 uppercase block font-bold">Kejanggalan Visual Terdeteksi:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.ai_vision_result.visual_anomalies.map((ano: string, aidx: number) => (
                        <span key={aidx} className="rounded bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[11px] text-rose-300 font-medium">
                          {ano}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.ai_vision_result.social_engineering_patterns?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-300 uppercase block font-bold">Pola Rekayasa Sosial:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.ai_vision_result.social_engineering_patterns.map((pat: string, pidx: number) => (
                        <span key={pidx} className="rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[11px] text-amber-300 font-medium">
                          {pat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Text Agent Cognitive Report */}
            {result.ai_agent_analysis && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Analisis AI Agent Rekayasa Sosial</span>
                  </div>
                  <span className="rounded bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 text-blue-200 font-mono font-bold text-[10px]">
                    {result.ai_agent_analysis.detected_category}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.ai_agent_analysis.explanation}
                </p>
                {result.ai_agent_analysis.manipulative_tactics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {result.ai_agent_analysis.manipulative_tactics.map((tac: string, tidx: number) => (
                      <span key={tidx} className="rounded bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 text-[11px] text-blue-300">
                        {tac}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Coverage and queried-source evidence */}
            {result.coverage_summary && (
              <div className={`rounded-xl border p-4 space-y-1 ${
                result.coverage === "complete" ? "border-blue-500/30 bg-blue-950/20" : "border-amber-500/30 bg-amber-950/20"
              }`}>
                <div className="text-xs font-bold text-white">
                  Cakupan pemeriksaan: {result.coverage === "complete" ? "Lengkap" : result.coverage === "partial" ? "Parsial" : "Terbatas"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.coverage_summary}</p>
              </div>
            )}

            {/* Sources list */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Sumber Intelijen &amp; Penelusuran Publik yang Diperiksa
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.sources.map((source: any) => (
                    <div key={source.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white">{source.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 break-all">{source.checked_at}</div>
                        </div>
                        <span className={`rounded px-2 py-1 text-[10px] font-bold ${
                          source.status === "unavailable"
                            ? "bg-amber-950/60 text-amber-300"
                            : source.outcome === "match"
                            ? "bg-rose-950/60 text-rose-300"
                            : "bg-blue-950/60 text-blue-300"
                        }`}>
                          {source.status === "unavailable"
                            ? "Tidak tersedia"
                            : source.outcome === "match"
                            ? "Ada catatan"
                            : source.outcome === "no_match"
                            ? "Tidak ditemukan"
                            : "Konteks valid"}
                        </span>
                      </div>
                      {source.evidence?.map((item: any, index: number) => (
                        <div key={`${source.id}-${index}`} className="text-[11px] text-slate-300">
                          <span className="text-slate-500">{item.label}: </span>
                          <span className="font-mono break-all">{item.value}</span>
                        </div>
                      ))}
                      {source.limitation && <p className="text-[11px] text-slate-500 leading-relaxed">{source.limitation}</p>}
                      {source.attribution_url && (
                        <a href={source.attribution_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:text-blue-300">
                          Lihat sumber
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Detail Badges */}
            {(result.operator || result.hlr_region || result.institution_type || result.bank_routing_code || result.domain || result.geolocation || result.tls_cert || result.domain_age_summary || result.web_posture || result.sha256) && (
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {result.operator && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Operator Seluler:</span>
                    <span className="font-bold text-white">{result.operator}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{result.hlr_region}</span>
                  </div>
                )}
                {result.country_name && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Negara Asal:</span>
                    <span className="font-bold text-white">{result.country_name}</span>
                  </div>
                )}
                {result.institution_type && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Tipe Lembaga:</span>
                    <span className="font-bold text-white">{result.institution_type}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Kliring: {result.bank_routing_code}</span>
                  </div>
                )}
                {result.domain_age_summary && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Umur Registrasi Domain:</span>
                    <span className="font-bold text-emerald-400 font-mono">{result.domain_age_summary}</span>
                  </div>
                )}
                {result.domain && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Domain Server:</span>
                    <span className="font-bold text-white font-mono">@{result.domain}</span>
                  </div>
                )}
                {result.geolocation && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Server Hosting &amp; ASN:</span>
                    <span className="font-bold text-white">{result.geolocation.isp} ({result.geolocation.country})</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{result.geolocation.asn}</span>
                  </div>
                )}
                {result.tls_cert && (
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-slate-500 block">Sertifikat SSL/TLS:</span>
                    <span className="font-bold text-white">{result.tls_cert.issuer}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Berlaku s/d {result.tls_cert.valid_until}</span>
                  </div>
                )}
                {result.web_posture && (
                  <div className="rounded-xl bg-white/5 p-3 sm:col-span-3 space-y-2 border border-blue-500/20 bg-blue-950/10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 block font-bold">Struktur Pertahanan Keamanan Web:</span>
                      <span className={`font-mono font-bold text-xs ${result.web_posture.security_grade.startsWith("A") ? "text-emerald-400" : "text-amber-400"}`}>
                        {result.web_posture.security_grade}
                      </span>
                    </div>
                    {result.web_posture.security_strengths?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {result.web_posture.security_strengths.map((str: string, sidx: number) => (
                          <div key={sidx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {result.sha256 && (
                  <div className="rounded-xl bg-white/5 p-3 sm:col-span-3">
                    <span className="text-slate-500 block">Sidik Jari Kriptografi (SHA-256):</span>
                    <span className="font-bold text-slate-300 font-mono text-[11px] break-all">{result.sha256}</span>
                  </div>
                )}
              </div>
            )}

            {/* Passive public-page flow analysis */}
            {result.page_analysis && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Alur Data pada Halaman Publik
                </span>
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-3 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">{result.page_analysis.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.page_analysis.page_categories?.map((cat: string, cidx: number) => (
                      <span key={`cat-${cidx}`} className="rounded bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 text-blue-200 font-semibold text-[11px]">{cat}</span>
                    ))}
                    {result.page_analysis.form_count > 0 && <span className="rounded bg-white/10 px-2 py-1 text-slate-300">{result.page_analysis.form_count} form</span>}
                    {result.page_analysis.has_reward_bait && <span className="rounded bg-indigo-950/60 px-2 py-1 text-indigo-300">Umpan hadiah</span>}
                    {result.page_analysis.has_job_bait && <span className="rounded bg-indigo-950/60 px-2 py-1 text-indigo-300">Umpan kerja</span>}
                    {result.page_analysis.requests_password && <span className="rounded bg-rose-950/50 px-2 py-1 text-rose-300">Meminta password</span>}
                    {result.page_analysis.requests_otp && <span className="rounded bg-rose-950/50 px-2 py-1 text-rose-300">Meminta OTP</span>}
                    {result.page_analysis.requests_ewallet && <span className="rounded bg-rose-950/50 px-2 py-1 text-rose-300">Meminta nomor e-wallet</span>}
                    {result.page_analysis.requests_financial_data && <span className="rounded bg-rose-950/50 px-2 py-1 text-rose-300">Meminta data finansial</span>}
                  </div>
                  {result.page_analysis.login_providers?.length > 0 && (
                    <p className="text-slate-400">Opsi login terlihat: <span className="text-slate-200">{result.page_analysis.login_providers.join(", ")}</span></p>
                  )}
                  {result.page_analysis.cross_origin_form_actions?.length > 0 && (
                    <p className="text-slate-400 break-all">Tujuan form lintas domain: <span className="font-mono text-slate-200">{result.page_analysis.cross_origin_form_actions.join(", ")}</span></p>
                  )}
                  <p className="text-slate-500">PANDU hanya membaca HTML publik; tidak mengisi kredensial, tidak meminta OTP, dan tidak mengirim formulir.</p>
                </div>
              </div>
            )}

            {/* Live DNS MX Records (if email) */}
            {result.mx_records && result.mx_records.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Server Mail Exchange (MX) Aktif di DNS Publik:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {result.mx_records.map((mx: string, mxidx: number) => (
                    <div key={mxidx} className="rounded-lg bg-black/60 border border-white/10 p-2 font-mono text-[11px] text-slate-300">
                      {mx}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Cognitive Bias Section (If analyzing text) */}
          {result.cognitive_biases && result.cognitive_biases.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Anatomi Manipulasi Emosi (Cognitive Bias)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Sindikat penipuan memanfaatkan bias kognitif berikut untuk menekan nalar Anda:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                {result.cognitive_biases.map((bias: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-[#0d0e12] p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300">{bias.label}</span>
                      <span className="rounded bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
                        Bobot +{bias.weight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{bias.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dangerous Android Permissions for APK */}
          {result.dangerous_perms && result.dangerous_perms.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Izin Bahaya Tingkat Tinggi yang Diminta Aplikasi (.APK):</span>
              </div>
              <div className="space-y-1.5">
                {result.dangerous_perms.map((perm: string, pidx: number) => (
                  <div
                    key={pidx}
                    className="rounded-lg bg-rose-950/20 border border-rose-500/20 p-2.5 text-xs text-slate-300 font-mono"
                  >
                    {perm}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Red Flags Indicators */}
          {result.red_flags && result.red_flags.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Indikator &amp; Temuan yang Dapat Dijelaskan
                </h4>
              </div>
              <div className="space-y-3 pt-1">
                {result.red_flags.map((rf: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-[#0d0e12] p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                          rf.level === "CRITICAL"
                            ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                            : rf.level === "HIGH"
                            ? "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {rf.level}
                      </span>
                      <h5 className="text-sm font-bold text-white">{rf.title}</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rf.explanation}</p>
                    {rf.snippet && (
                      <div className="mt-2 rounded-lg bg-black border border-white/10 p-2.5 font-mono text-xs text-slate-300 break-all">
                        Target/Cuplikan: {rf.snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Safety Recommendations */}
          <section className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                Langkah Pengamanan &amp; Mitigasi
              </h4>
            </div>
            <ul className="space-y-2.5">
              {result.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Apakah Anda atau kerabat Anda terlanjur menjadi target atau mengirim uang?
              </p>
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
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all w-full sm:w-auto"
              >
                <span>Bawa ke Pusat Laporan &amp; Daftar Hitam</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
