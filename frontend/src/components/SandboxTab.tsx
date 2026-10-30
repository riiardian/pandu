"use client";

import React, { useState, useEffect } from "react";
import CyberRadarAnimation from "@/components/CyberRadarAnimation";
import HackerAvatar from "@/components/HackerAvatar";
import { useLanguage } from "@/hooks/useLanguage";
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Send,
  FileBox,
  Link2,
  Trophy,
  ArrowRight,
  UserCheck,
  X,
} from "lucide-react";

interface ScenarioSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  platform: string;
  description: string;
}

const SCENARIO_TRANSLATIONS: Record<string, { title: string; description: string }> = {
  "kurir-paket-apk": {
    title: "Courier Package Receipt / Traffic Fine .APK Malware",
    description: "Learn to detect malicious .APK traps disguised as courier delivery receipts or wedding invitations.",
  },
  "kurir-malware-apk": {
    title: "Courier Package Receipt / Traffic Fine .APK Malware",
    description: "Learn to detect malicious .APK traps disguised as courier delivery receipts or wedding invitations.",
  },
  "bank-kenaikan-tarif": {
    title: "Official Bank Fee Increase Letter Rp 150,000",
    description: "Encounter deceptive official bank notices demanding cancellation forms on phishing links.",
  },
  "loker-like-video": {
    title: "Part-Time Job Scam: Video Liking & Review Tasks",
    description: "Test instincts against fraudsters promising daily income through video likes and store follow tasks.",
  },
  "cs-palsu-otp": {
    title: "Spoofed Call Center: E-Wallet Transaction Cancellation",
    description: "Resist impostors claiming to be official customer service urging you to share OTP codes.",
  },
  "teman-pinjam-uang": {
    title: "Impersonated Relative Urgently Requesting Emergency Funds",
    description: "Train cognitive immunity against sympathy manipulation when an acquaintance claims sudden hardship.",
  },
};

export default function SandboxTab() {
  const lang = useLanguage();
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioID, setActiveScenarioID] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [currentStepID, setCurrentStepID] = useState<string>("step_1");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "bot" | "user"; text: string; attachment?: any; tactic?: string }>>([]);
  const [currentScore, setCurrentScore] = useState<number>(50);
  const [turnFeedback, setTurnFeedback] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch("/api/v1/sandbox/scenarios");
      const json = await res.json();
      if (json.success) {
        setScenarios(json.data);
      }
    } catch (e) {
      console.error("Gagal mengambil skenario", e);
    }
  };

  const startScenario = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/sandbox/scenarios/${id}`);
      const json = await res.json();
      if (json.success) {
        const sc = json.data;
        setActiveScenario(sc);
        setActiveScenarioID(id);
        setCurrentStepID(sc.initial_step);
        setCurrentScore(50); // Base starting score
        setIsCompleted(false);
        setFinalResult(null);
        setTurnFeedback(null);

        // Seed initial message
        const initialStep = sc.steps[sc.initial_step];
        setChatHistory([
          {
            sender: "bot",
            text: initialStep.message,
            attachment: initialStep.attachment_type !== "NONE" ? {
              type: initialStep.attachment_type,
              data: initialStep.attachment_data,
            } : null,
            tactic: initialStep.deception_tactic,
          },
        ]);
      }
    } catch (e) {
      console.error("Gagal memulai skenario", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChoice = async (choice: any) => {
    setLoading(true);
    setTurnFeedback(null);

    // 1. Add user reply to chat
    const updatedHistory = [
      ...chatHistory,
      { sender: "user" as const, text: choice.text },
    ];
    setChatHistory(updatedHistory);

    try {
      const res = await fetch("/api/v1/sandbox/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: activeScenarioID,
          step_id: currentStepID,
          choice_id: choice.id,
          score_so_far: currentScore,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message);
      }

      const turnData = json.data;
      setCurrentScore(turnData.new_total_score);
      setTurnFeedback({
        rating: choice.safety_rating,
        feedback: choice.feedback,
        psychology: choice.psychology_note,
        scoreDelta: choice.score_delta,
      });

      if (turnData.is_completed) {
        setIsCompleted(true);
        setFinalResult({
          verdict: turnData.final_verdict,
          lessons: turnData.lessons_learned,
          score: turnData.new_total_score,
        });

        if (turnData.next_step) {
          setChatHistory([
            ...updatedHistory,
            {
              sender: "bot",
              text: turnData.next_step.message,
              tactic: turnData.next_step.deception_tactic,
            },
          ]);
        }
      } else if (turnData.next_step) {
        setCurrentStepID(turnData.next_step.step_id);
        // Scammer replies
        setChatHistory([
          ...updatedHistory,
          {
            sender: "bot",
            text: turnData.next_step.message,
            attachment: turnData.next_step.attachment_type !== "NONE" ? {
              type: turnData.next_step.attachment_type,
              data: turnData.next_step.attachment_data,
            } : null,
            tactic: turnData.next_step.deception_tactic,
          },
        ]);
      }
    } catch (e) {
      console.error("Gagal memproses pilihan", e);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = activeScenario && activeScenario.steps ? activeScenario.steps[currentStepID] : null;

  return (
    <div className="space-y-6">
      {/* Intro Hero Section (Centered, Borderless, Translucent Shimmer Text) */}
      {!activeScenarioID && (
        <section className="pt-1 pb-2 flex flex-col items-center justify-center text-center">
          <CyberRadarAnimation className="w-56 h-36 sm:w-72 sm:h-44 lg:w-80 lg:h-48 shrink-0 mb-3.5 sm:mb-4.5" />

          <div className="w-full text-center">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight inline-block whitespace-nowrap animate-text-shimmer">
              {lang === "en" ? "Recognize Social Engineering Scams" : "Kenali Modus Social Engineering"}
            </h2>
          </div>
        </section>
      )}

      {!activeScenarioID ? (
        /* Scenario Selection Grid (Clean, Obsidian Dark, Human-crafted, 5 Real Vectors) */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((sc) => {
            const displayTitle = (lang === "en" && SCENARIO_TRANSLATIONS[sc.id]?.title) || sc.title;
            const displayDesc = (lang === "en" && SCENARIO_TRANSLATIONS[sc.id]?.description) || sc.description;
            return (
              <div
                key={sc.id}
                onClick={() => startScenario(sc.id)}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl hover:border-blue-500/50 hover:bg-[#16181d] transition-all cursor-pointer text-left"
              >
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {displayTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-white/5 flex items-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold !text-white group-hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40">
                    {lang === "en" ? "Start Simulation" : "Mulai Simulasi"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Simulation Sandbox (Refined Obsidian Dark Theme) */
        <div className="grid gap-6 lg:grid-cols-3 text-left">
          {/* Left Column: Chat Container Mockup */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md shadow-2xl overflow-hidden min-h-[560px]">
            {/* Chat App Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1014] px-4 sm:px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <HackerAvatar className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {currentStep?.sender_name || currentStep?.SenderName || (lang === "en" && activeScenarioID && SCENARIO_TRANSLATIONS[activeScenarioID]?.title) || activeScenario?.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentStep?.sender_role || currentStep?.SenderRole || (lang === "en" ? "Foreign Entity" : "Entitas Asing")} · <span className="text-emerald-400 font-semibold">Online</span>
                  </p>
                </div>
              </div>

              {/* Minimal Clean Exit Button */}
              <button
                onClick={() => setActiveScenarioID(null)}
                aria-label="Tutup simulasi"
                title="Tutup simulasi"
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 space-y-4 p-4 sm:p-5 overflow-y-auto max-h-[440px] bg-[#090a0d]">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20"
                        : "bg-[#15171d] text-slate-100 rounded-tl-none border border-white/10"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Dangerous Attachment Rendering (Authentic, No Spoilers) */}
                    {msg.attachment && (
                      <div className="mt-2.5 rounded-xl border border-white/10 bg-[#0c0d11] p-3">
                        {msg.attachment.type === "FILE_APK" && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-mono text-xs font-bold shrink-0">
                              APK
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate text-slate-900 dark:text-white">
                                {msg.attachment.data.split(" ")[0]}
                              </p>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                4.8 MB · {lang === "en" ? "Application Package" : "Berkas Aplikasi"}
                              </span>
                            </div>
                          </div>
                        )}
                        {msg.attachment.type === "LINK" && (
                          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                              <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-mono truncate text-blue-600 dark:text-blue-300 underline">{msg.attachment.data}</span>
                          </div>
                        )}
                        {msg.attachment.type === "IMAGE" && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                            [{lang === "en" ? "Image Attachment: " : "Lampiran Gambar: "}{msg.attachment.data}]
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Feedback Bar */}
            {turnFeedback && (
              <div
                className={`border-t p-4 text-xs flex items-start gap-3 ${
                  turnFeedback.rating === "SAFE"
                    ? "bg-emerald-950/25 border-emerald-500/30 text-emerald-300"
                    : turnFeedback.rating === "RISKY"
                    ? "bg-amber-950/25 border-amber-500/30 text-amber-300"
                    : "bg-rose-950/25 border-rose-500/30 text-rose-300"
                }`}
              >
                {turnFeedback.rating === "SAFE" ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider font-mono">
                      {turnFeedback.rating === "SAFE"
                        ? (lang === "en" ? "Safe Decision" : "Keputusan Aman")
                        : (lang === "en" ? "Risky Decision" : "Keputusan Berisiko")}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        turnFeedback.scoreDelta > 0
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {turnFeedback.scoreDelta > 0 ? `+${turnFeedback.scoreDelta}` : turnFeedback.scoreDelta}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-200">{turnFeedback.feedback}</p>
                  <p className="text-[11px] opacity-80 italic">{lang === "en" ? "Psychological Note: " : "Catatan: "}{turnFeedback.psychology}</p>
                </div>
              </div>
            )}

            {/* Input Action Panel (Conversational Quick Replies) */}
            <div className="border-t border-white/10 bg-[#0f1014] p-4">
              {!isCompleted && currentStep && currentStep.choices && currentStep.choices.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-slate-400">
                    {lang === "en" ? "Choose your response:" : "Pilih respon Anda:"}
                  </p>
                  <div className="grid gap-2">
                    {currentStep.choices.map((c: any) => (
                      <button
                        key={c.id}
                        disabled={loading}
                        onClick={() => handleMakeChoice(c)}
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#15171d] p-3 sm:p-3.5 text-left text-xs sm:text-sm font-medium text-slate-200 hover:border-blue-500/60 hover:bg-[#1a1d25] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <span className="leading-relaxed pr-3">{c.text}</span>
                        <span className="text-[11px] font-semibold text-blue-400 shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          {lang === "en" ? "Select →" : "Pilih →"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {lang === "en" ? "Simulation Scenario Completed." : "Skenario Latihan Telah Selesai."}
                  </span>
                  <button
                    onClick={() => startScenario(activeScenarioID)}
                    className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/40 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{lang === "en" ? "Restart Simulation" : "Ulangi Latihan"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Diagnostic Scorecard */}
          <div className="space-y-4">
            {/* Immunity Score Card */}
            <div className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                {lang === "en" ? "Digital Cognitive Immunity" : "Imunitas Kognitif Digital"}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{currentScore}</span>
                <span className="text-sm font-semibold text-slate-500">/ 100</span>
              </div>
              <div className="mt-3.5 w-full rounded-full bg-white/10 h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentScore >= 70
                      ? "bg-emerald-500"
                      : currentScore >= 40
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${currentScore}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                {lang === "en"
                  ? "Score increases when demanding official verification, and drops drastically if persuaded to deposit money, click unauthorized links, or share OTPs."
                  : "Skor meningkat ketika Anda menuntut verifikasi resmi, dan anjlok drastis jika Anda terbujuk menyetor uang, mengklik tautan tidak resmi, atau menyerahkan kode OTP."}
              </p>
            </div>

            {/* Final Result Card when finished */}
            {isCompleted && finalResult && (
              <div className="rounded-2xl border border-white/10 bg-[#121316]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-3.5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-blue-400">
                  <Trophy className="h-5 w-5" />
                  <h4 className="text-sm font-bold uppercase tracking-wider font-mono">
                    {lang === "en" ? "Final Evaluation" : "Evaluasi Akhir"}
                  </h4>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{finalResult.verdict}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    {lang === "en" ? "Key Takeaways:" : "Pelajaran Penting:"}
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                    {finalResult.lessons &&
                      finalResult.lessons.map((ls: string, lidx: number) => (
                        <li key={lidx}>{ls}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
