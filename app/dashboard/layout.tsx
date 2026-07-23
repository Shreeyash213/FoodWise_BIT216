import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#08120b] text-paper">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(231,172,63,0.14),_transparent_25%),linear-gradient(#08120b,_#0f1810)]">
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
