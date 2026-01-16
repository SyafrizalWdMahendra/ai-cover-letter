import CreditCounter from "@/components/ui/credit";
import HomeContent from "@/components/ui/homeContent";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans">
      <HomeContent creditCounterSlot={<CreditCounter />} />
    </main>
  );
}
