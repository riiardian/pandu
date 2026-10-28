import Header from "@/components/Header";
import HomeTab from "@/components/HomeTab";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Gemini ambient cosmic navy glow background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-full max-w-5xl rounded-full bg-gradient-to-b from-blue-900/25 via-indigo-950/20 to-transparent blur-3xl" />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <HomeTab />
      </main>
    </div>
  );
}
