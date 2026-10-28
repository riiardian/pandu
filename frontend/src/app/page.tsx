import Header from "@/components/Header";
import HomeTab from "@/components/HomeTab";

export default function Home() {
  return (
    <div className="min-h-screen bg-black gemini-aura-bg text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <Header />
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <HomeTab />
      </main>
    </div>
  );
}
