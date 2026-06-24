import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { fetchMineTimeEntries, type TimeEntry } from "@/lib/backend";
import { getModalityMetaByName, modalityIcons } from "@/lib/modalities";
import { ApiError } from "@/lib/api";

const getProjectName = (entry: TimeEntry) =>
  typeof entry.project === "string" ? entry.project : entry.project?.name ?? "Projeto";

const getCategoryName = (entry: TimeEntry) =>
  typeof entry.category === "string" ? entry.category : entry.category?.name ?? "Categoria";

const MyHoursTab = () => {
  const mineQuery = useQuery({ queryKey: ["time-entries", "mine"], queryFn: fetchMineTimeEntries });
  const entries = mineQuery.data ?? [];
  const totalHours = entries.reduce((acc, entry) => acc + Number(entry.hours_worked ?? 0), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Minhas Horas</h2>
        <p className="text-muted-foreground text-sm mt-1">Consulta dos registros enviados para o backend</p>
      </div>

      <div className="bg-card border border-primary/30 rounded-xl p-8 text-center glow-orange">
        <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-4xl font-display font-extrabold text-primary text-glow">{totalHours.toFixed(2)}h</p>
        <p className="text-muted-foreground text-sm mt-1">Total de horas registradas</p>
      </div>

      {mineQuery.isLoading ? (
        <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Carregando atividades...</div>
      ) : entries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Nenhuma atividade encontrada.</div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-foreground">Atividades Registradas</h3>
          {entries.map((entry) => {
            const projectName = getProjectName(entry);
            const meta = getModalityMetaByName(projectName);
            const Icon = (meta?.name ? modalityIcons[meta.id] : undefined) || Clock;
            const participantsCount = entry.participants?.length ?? 0;

            return (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-foreground truncate">{entry.description}</h4>
                  <p className="text-xs text-muted-foreground">
                    {projectName} • {getCategoryName(entry)} • {participantsCount} participantes • {entry.work_date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold text-primary text-lg">{Number(entry.hours_worked).toFixed(2)}h</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mineQuery.error ? (
        <div className="text-sm text-destructive">
          {mineQuery.error instanceof ApiError && mineQuery.error.status === 403
            ? "Você não tem permissão para visualizar estes registros."
            : "Não foi possível carregar seus registros."}
        </div>
      ) : null}
    </div>
  );
};

export default MyHoursTab;
