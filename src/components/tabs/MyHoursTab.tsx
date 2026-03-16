import { Clock } from "lucide-react";
import { modalityNames, modalityIcons } from "@/lib/modalities";

const mockData = [
  { id: 1, modality: "lol", description: "Treino semanal", hours: 3, date: "2026-03-10", participants: 6 },
  { id: 2, modality: "valorant", description: "Campeonato interno", hours: 5, date: "2026-03-08", participants: 8 },
  { id: 3, modality: "tft", description: "Sessão de análise", hours: 2, date: "2026-03-05", participants: 5 },
  { id: 4, modality: "cs2", description: "Treino tático", hours: 4, date: "2026-03-04", participants: 5 },
  { id: 5, modality: "rocketleague", description: "Amistoso", hours: 2, date: "2026-03-02", participants: 3 },
  { id: 6, modality: "freefire", description: "Campeonato regional", hours: 3.5, date: "2026-03-01", participants: 4 },
];

const MyHoursTab = () => {
  const totalHours = mockData.reduce((acc, d) => acc + d.hours, 0);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Minhas Horas</h2>
        <p className="text-muted-foreground text-sm mt-1">Consulta de horas complementares</p>
      </div>

      <div className="bg-card border border-primary/30 rounded-xl p-8 text-center glow-orange">
        <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-4xl font-display font-extrabold text-primary text-glow">{totalHours}h</p>
        <p className="text-muted-foreground text-sm mt-1">Total de horas registradas</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground">Atividades Registradas</h3>
        {mockData.map((activity) => {
          const Icon = modalityIcons[activity.modality] || Clock;
          return (
            <div key={activity.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-foreground truncate">{activity.description}</h4>
                <p className="text-xs text-muted-foreground">
                  {modalityNames[activity.modality]} • {activity.participants} participantes • {activity.date}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display font-bold text-primary text-lg">{activity.hours}h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyHoursTab;
