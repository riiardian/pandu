import Header from "@/components/Header";
import HomeTab from "@/components/HomeTab";
import GeminiBackground from "@/components/GeminiBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <GeminiBackground />
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <HomeTab />
      </main>
    </div>
  );
}
