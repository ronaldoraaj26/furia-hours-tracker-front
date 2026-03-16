import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Gamepad2, Swords, Smartphone, Grid3X3 } from "lucide-react";
import logo from "@/assets/logo-furia.jpg";

const mockData = [
  { id: 1, modality: "lol", description: "Treino semanal", hours: 3, date: "2026-03-10", participants: 6 },
  { id: 2, modality: "valorant", description: "Campeonato interno", hours: 5, date: "2026-03-08", participants: 8 },
  { id: 3, modality: "tft", description: "Sessão de análise", hours: 2, date: "2026-03-05", participants: 5 },
  { id: 4, modality: "wildrift", description: "Treino tático", hours: 2.5, date: "2026-03-01", participants: 7 },
];

const icons: Record<string, any> = {
  lol: Swords,
  valorant: Gamepad2,
  wildrift: Smartphone,
  tft: Grid3X3,
};

const names: Record<string, string> = {
  lol: "LoL",
  valorant: "Valorant",
  wildrift: "Wild Rift",
  tft: "TFT",
};

const MyHours = () => {
  const navigate = useNavigate();
  const totalHours = mockData.reduce((acc, d) => acc + d.hours, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logo} alt="Furia" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <h1 className="font-display font-bold text-primary text-base leading-tight">Minhas Horas</h1>
            <p className="text-xs text-muted-foreground">Consulta de horas complementares</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Total card */}
        <div className="bg-card border border-primary/30 rounded-xl p-8 text-center glow-orange">
          <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-4xl font-display font-extrabold text-primary text-glow">{totalHours}h</p>
          <p className="text-muted-foreground text-sm mt-1">Total de horas registradas</p>
        </div>

        {/* Activity list */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-lg text-foreground">Atividades Registradas</h2>
          {mockData.map((activity) => {
            const Icon = icons[activity.modality] || Clock;
            return (
              <div
                key={activity.id}
                className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground truncate">{activity.description}</h3>
                  <p className="text-xs text-muted-foreground">
                    {names[activity.modality]} • {activity.participants} participantes • {activity.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold text-primary text-lg">{activity.hours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MyHours;
