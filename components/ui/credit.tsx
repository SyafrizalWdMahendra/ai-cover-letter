import { getCredits } from "@/app/actions/getCredits";

export default async function CreditCounter() {
  const credits = await getCredits();
  const MAX_CREDITS = 3;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200">
      <span className="text-sm font-medium text-slate-600">Credits</span>
      <div className="text-sm font-bold text-slate-900">
        {credits}
        <span className="text-slate-400 font-normal">/{MAX_CREDITS}</span>
      </div>
    </div>
  );
}
