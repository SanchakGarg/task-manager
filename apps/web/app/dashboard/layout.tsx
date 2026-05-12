import { Sidebar } from "@/components/layout/Sidebar";

const DEMO_SESSION = {
  user: {
    id: "demo-user",
    name: "Alex Rivera",
    email: "alex@taskflow.app",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
  },
  expires: "2099-01-01",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="relative flex-shrink-0">
        <Sidebar session={DEMO_SESSION as never} />
      </div>
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
