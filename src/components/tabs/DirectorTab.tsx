import { useState } from "react";
import { Clock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { modalities, modalityNames, modalityIcons } from "@/lib/modalities";
import { toast } from "sonner";

const allActivities = [
  { id: 1, modality: "lol", user: "João Silva", description: "Treino semanal", hours: 3, date: "2026-03-10", participants: 6 },
  { id: 2, modality: "valorant", user: "Ana Souza", description: "Campeonato interno", hours: 5, date: "2026-03-08", participants: 8 },
  { id: 3, modality: "tft", user: "Carlos Lima", description: "Sessão de análise", hours: 2, date: "2026-03-05", participants: 5 },
  { id: 4, modality: "cs2", user: "Maria Fernanda", description: "Treino tático", hours: 4, date: "2026-03-04", participants: 5 },
  { id: 5, modality: "rocketleague", user: "Pedro Alves", description: "Amistoso", hours: 2, date: "2026-03-02", participants: 3 },
  { id: 6, modality: "freefire", user: "Lucas Gomes", description: "Campeonato regional", hours: 3.5, date: "2026-03-01", participants: 4 },
  { id: 7, modality: "eafc", user: "Bruno Costa", description: "Torneio interno", hours: 2, date: "2026-02-28", participants: 2 },
  { id: 8, modality: "wildrift", user: "Fernanda Reis", description: "Treino competitivo", hours: 3, date: "2026-02-25", participants: 5 },
  { id: 9, modality: "lol", user: "Rafael Mendes", description: "Scrim contra UFPR", hours: 4, date: "2026-02-22", participants: 5 },
  { id: 10, modality: "valorant", user: "Juliana Prado", description: "Treino aim", hours: 2, date: "2026-02-20", participants: 4 },
];

const DirectorTab = () => {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? allActivities : allActivities.filter((a) => a.modality === filter);
  const totalHours = filtered.reduce((acc, a) => acc + a.hours, 0);

  const generateReport = () => {
    const lines = [
      "RELATÓRIO DE HORAS COMPLEMENTARES - FURIA XV",
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      `Filtro: ${filter === "all" ? "Todas as Modalidades" : modalityNames[filter]}`,
      `Total de Horas: ${totalHours}h`,
      "",
      "Atividade | Modalidade | Responsável | Horas | Data | Participantes",
      "---------|-----------|-------------|-------|------|-------------",
      ...filtered.map((a) => `${a.description} | ${modalityNames[a.modality]} | ${a.user} | ${a.hours}h | ${a.date} | ${a.participants}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-furia-xv-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório gerado com sucesso!");
  };

  // Summary per modality
  const summary = modalities.map((m) => {
    const acts = allActivities.filter((a) => a.modality === m.id);
    return { ...m, totalHours: acts.reduce((s, a) => s + a.hours, 0), count: acts.length };
  }).filter((m) => m.count > 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Diretoria</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral de todas as modalidades</p>
        </div>
        <Button onClick={generateReport} className="gap-2">
          <Download className="w-4 h-4" /> Gerar Relatório
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((m) => {
          const Icon = m.icon;
          const active = filter === m.id;
          return (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setFilter(m.id === filter ? "all" : m.id)}>
            <img src={m.image} alt={m.name} className={`w-8 h-8 mx-auto mb-2 object-contain transition-all duration-300 ${active ? "brightness-110 scale-110" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`} />
              <p className="font-display font-extrabold text-xl text-primary">{m.totalHours}h</p>
              <p className="text-xs text-muted-foreground font-body">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.count} atividades</p>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
          Todas
        </button>
        {modalities.map((m) => (
          <button key={m.id} onClick={() => setFilter(m.id)} className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${filter === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {m.name}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="bg-card border border-primary/30 rounded-xl p-6 text-center glow-orange">
        <p className="text-3xl font-display font-extrabold text-primary text-glow">{totalHours}h</p>
        <p className="text-muted-foreground text-sm mt-1">
          Total — {filter === "all" ? "Todas as Modalidades" : modalityNames[filter]}
        </p>
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Atividades ({filtered.length})
        </h3>
        {filtered.map((activity) => {
          const Icon = modalityIcons[activity.modality] || Clock;
          return (
            <div key={activity.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-foreground truncate">{activity.description}</h4>
                <p className="text-xs text-muted-foreground">
                  {modalityNames[activity.modality]} • {activity.user} • {activity.participants} part. • {activity.date}
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

export default DirectorTab;
