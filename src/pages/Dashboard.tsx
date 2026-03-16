import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-furia.jpg";
import { Gamepad2, Swords, Smartphone, Grid3X3, Clock, LogOut } from "lucide-react";

const modalities = [
  { id: "lol", name: "League of Legends", icon: Swords, color: "from-yellow-600 to-amber-500" },
  { id: "valorant", name: "Valorant", icon: Gamepad2, color: "from-red-600 to-rose-500" },
  { id: "wildrift", name: "Wild Rift", icon: Smartphone, color: "from-blue-600 to-cyan-500" },
  { id: "tft", name: "TFT", icon: Grid3X3, color: "from-purple-600 to-violet-500" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Furia" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h1 className="font-display font-bold text-primary text-lg leading-tight">FURIA E-SPORTS</h1>
              <p className="text-xs text-muted-foreground">Horas Complementares</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/hours")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
            >
              <Clock className="w-4 h-4" />
              Minhas Horas
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors font-body"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground">Selecione a Modalidade</h2>
          <p className="text-muted-foreground text-sm mt-1">Escolha o jogo para registrar atividades</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {modalities.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/add-hours/${mod.id}`)}
                className="group relative bg-card border border-border rounded-xl p-8 text-left hover:border-primary/50 transition-all duration-300 hover:glow-orange overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Registrar atividade</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
