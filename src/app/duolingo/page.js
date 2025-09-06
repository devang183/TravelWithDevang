import VisitorsChart from "@/components/VisitorsChart";

export default function HomePage() {
  return (
    <main className="px-4 sm:px-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Duolingo Streak</h1>
      <VisitorsChart />
    </main>
  );
}