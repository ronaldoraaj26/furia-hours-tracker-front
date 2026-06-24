import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-furia.jpg";
import { Home, PlusCircle, Clock, Shield, CalendarDays, LogOut } from "lucide-react";
import HomeTab from "@/components/tabs/HomeTab";
import RegisterHoursTab from "@/components/tabs/RegisterHoursTab";
import MyHoursTab from "@/components/tabs/MyHoursTab";
import DirectorTab from "@/components/tabs/DirectorTab";
import CalendarTab from "@/components/tabs/CalendarTab";
import { clearAuth } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/backend";

const tabs = [
  { id: "home", label: "Início", icon: Home },
  { id: "register", label: "Registrar Horas", icon: PlusCircle },
  { id: "hours", label: "Minhas Horas", icon: Clock },
  { id: "director", label: "Diretoria", icon: Shield },
  { id: "calendar", label: "Calendário", icon: CalendarDays },
];

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        if (!mounted) {
          return;
        }

        const status = error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;
        if (status === 401 || status === 403) {
          clearAuth();
          navigate("/");
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={logo} alt="Furia XV" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h1 className="font-display font-bold text-primary text-lg leading-tight">FURIA XV</h1>
            <p className="text-xs text-muted-foreground">Horas Complementares</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "register" && <RegisterHoursTab />}
        {activeTab === "hours" && <MyHoursTab />}
        {activeTab === "director" && <DirectorTab />}
        {activeTab === "calendar" && <CalendarTab />}
      </main>
    </div>
  );
};

export default MainLayout;
