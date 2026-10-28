"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Send,
  FileBox,
  Link2,
  Sparkles,
  Trophy,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface ScenarioSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  platform: string;
  description: string;
}

export default function SandboxTab() {
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
      {/* Intro Banner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Arena Simulasi & Pengambilan Keputusan
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
          Ruang latihan interaktif menghadapi persona penipu digital dalam format chat simulasi. Latih
          keberanian menolak intimidasi waktu, memverifikasi identitas, dan membangun imunitas
          kognitif di ruang digital.
        </p>
      </div>

      {!activeScenarioID ? (
        /* Scenario Selection Grid */
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-400 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                    {sc.platform}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      sc.difficulty === "Mudah"
                        ? "bg-emerald-100 text-emerald-800"
                        : sc.difficulty === "Sedang"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {sc.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 leading-snug">{sc.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{sc.description}</p>
              </div>

              <div className="pt-5 border-t border-zinc-100 mt-4">
                <button
                  onClick={() => startScenario(sc.id)}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
                >
                  <span>Mulai Simulasi</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Simulation Sandbox */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Chat Container Mockup */}
          <div className="lg:col-span-2 flex flex-col rounded-xl border border-zinc-300 bg-zinc-100 shadow-sm overflow-hidden min-h-[580px]">
            {/* Chat App Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-200 overflow-hidden border border-zinc-300">
                  <img
                    src={currentStep?.SenderAvatar || "https://api.dicebear.com/7.x/personas/svg?seed=Bot"}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                    {currentStep?.SenderName || activeScenario.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    {currentStep?.SenderRole || "Kontak Asing"} · <span className="text-emerald-600 font-semibold">Online</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveScenarioID(null)}
                className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Pilih Modus Lain</span>
              </button>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 space-y-4 p-4 overflow-y-auto max-h-[440px] bg-[#efeae2]/40">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Tactic Banner for Scammer Message */}
                  {msg.sender === "bot" && msg.tactic && msg.tactic !== "Selesai" && (
                    <div className="mb-1 rounded bg-rose-100/90 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                      Taktik Terdeteksi: {msg.tactic}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-white text-zinc-900 rounded-tl-none border border-zinc-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Dangerous Attachment Rendering */}
                    {msg.attachment && (
                      <div className="mt-2.5 rounded-lg border border-zinc-300 bg-zinc-50 p-2.5">
                        {msg.attachment.type === "FILE_APK" && (
                          <div className="flex items-center gap-2.5 text-rose-800">
                            <FileBox className="h-6 w-6 text-rose-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate">{msg.attachment.data}</p>
                              <span className="text-[10px] text-rose-600 font-semibold uppercase">
                                Berkas Aplikasi Android (.APK)
                              </span>
                            </div>
                          </div>
                        )}
                        {msg.attachment.type === "LINK" && (
                          <div className="flex items-center gap-2 text-blue-800">
                            <Link2 className="h-5 w-5 text-blue-600 shrink-0" />
                            <span className="text-xs font-mono truncate">{msg.attachment.data}</span>
                          </div>
                        )}
                        {msg.attachment.type === "IMAGE" && (
                          <div className="text-xs text-zinc-600 italic">
                            [Lampiran Gambar: {msg.attachment.data}]
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
                className={`border-t p-3 text-xs flex items-start gap-2.5 ${
                  turnFeedback.rating === "SAFE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : turnFeedback.rating === "RISKY"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                {turnFeedback.rating === "SAFE" ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold uppercase tracking-wider block">
                    {turnFeedback.rating === "SAFE" ? "Keputusan Aman" : "Keputusan Berisiko"} (Skor: {turnFeedback.scoreDelta > 0 ? `+${turnFeedback.scoreDelta}` : turnFeedback.scoreDelta})
                  </span>
                  <p className="mt-0.5">{turnFeedback.feedback}</p>
                  <p className="text-[10px] opacity-75 mt-0.5 italic">Catatan: {turnFeedback.psychology}</p>
                </div>
              </div>
            )}

            {/* Input Action Panel */}
            <div className="border-t border-zinc-200 bg-white p-3.5">
              {!isCompleted && currentStep && currentStep.choices && currentStep.choices.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Pilih Tindakan atau Jawaban Anda:
                  </p>
                  <div className="grid gap-2">
                    {currentStep.choices.map((c: any) => (
                      <button
                        key={c.id}
                        disabled={loading}
                        onClick={() => handleMakeChoice(c)}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-left text-xs font-medium text-zinc-900 hover:border-orange-500 hover:bg-orange-50/50 transition-all disabled:opacity-50"
                      >
                        <span className="pr-2">{c.text}</span>
                        <Send className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-600">Skenario Latihan Telah Selesai.</span>
                  <button
                    onClick={() => startScenario(activeScenarioID)}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Ulangi Latihan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Diagnostic Scorecard */}
          <div className="space-y-4">
            {/* Immunity Score Card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Imunitas Kognitif Digital
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-900">{currentScore}</span>
                <span className="text-sm font-semibold text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3 w-full rounded-full bg-zinc-200 h-2.5 overflow-hidden">
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
              <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                Skor meningkat ketika Anda menuntut verifikasi resmi, dan anjlok drastis jika Anda
                terbujuk menyetor uang atau menginstal file asing.
              </p>
            </div>

            {/* Final Result Card when finished */}
            {isCompleted && finalResult && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-orange-600">
                  <Trophy className="h-5 w-5" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Evaluasi Akhir</h4>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200">
                  <span className="text-xs font-bold text-zinc-800">{finalResult.verdict}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-700">Pelajaran Penting:</span>
                  <ul className="list-disc pl-4 text-xs text-zinc-600 space-y-1">
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
