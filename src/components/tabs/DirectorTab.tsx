import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllTimeEntries, fetchApprovals, fetchProjects, type TimeEntry } from "@/lib/backend";
import { ApiError } from "@/lib/api";
import { getModalityMetaByName, modalityIcons } from "@/lib/modalities";
import { toast } from "sonner";

const getProjectName = (entry: TimeEntry) =>
  typeof entry.project === "string" ? entry.project : entry.project?.name ?? "Projeto";

const getUserName = (entry: TimeEntry) =>
  typeof entry.user === "string" ? entry.user : entry.user?.name ?? "Usuário";

const getProjectId = (entry: TimeEntry) =>
  entry.project_id ?? (typeof entry.project === "string" ? undefined : entry.project?.id ?? undefined);

const DirectorTab = () => {
  const [filter, setFilter] = useState<string>("all");

  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const entriesQuery = useQuery({ queryKey: ["time-entries", "all"], queryFn: fetchAllTimeEntries });
  const approvalsQuery = useQuery({
    queryKey: ["approvals"],
    queryFn: fetchApprovals,
    retry: false,
  });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const filteredEntries = filter === "all" ? entries : entries.filter((entry) => getProjectId(entry) === filter);
  const totalHours = filteredEntries.reduce((acc, entry) => acc + Number(entry.hours_worked ?? 0), 0);

  const summary = useMemo(
    () =>
      projects
        .map((project) => {
          const projectEntries = entries.filter((entry) => getProjectId(entry) === project.id);
          return {
            ...project,
            totalHours: projectEntries.reduce((sum, entry) => sum + Number(entry.hours_worked ?? 0), 0),
            count: projectEntries.length,
          };
        })
        .filter((project) => project.count > 0),
    [entries, projects],
  );

  const generateReport = () => {
    const lines = [
      "RELATÓRIO DE HORAS COMPLEMENTARES - FURIA XV",
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      `Filtro: ${filter === "all" ? "Todas as Modalidades" : projects.find((project) => project.id === filter)?.name ?? filter}`,
      `Total de Horas: ${totalHours.toFixed(2)}h`,
      "",
      "Atividade | Modalidade | Responsável | Horas | Data | Participantes",
      "---------|-----------|-------------|-------|------|-------------",
      ...filteredEntries.map(
        (entry) =>
          `${entry.description} | ${getProjectName(entry)} | ${getUserName(entry)} | ${Number(entry.hours_worked).toFixed(2)}h | ${entry.work_date} | ${
            entry.participants?.length ?? 0
          }`,
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `relatorio-furia-xv-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório gerado com sucesso!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Diretoria</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral das atividades enviadas ao backend</p>
        </div>
        <Button onClick={generateReport} className="gap-2" disabled={entriesQuery.isLoading}>
          <Download className="w-4 h-4" /> Gerar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((project) => {
          const meta = getModalityMetaByName(project.name);
          const isActive = filter === project.id;

          return (
            <div
              key={project.id}
              className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setFilter(project.id === filter ? "all" : project.id)}
            >
              {meta?.image ? (
                <img
                  src={meta.image}
                  alt={project.name}
                  className={`w-8 h-8 mx-auto mb-2 object-contain transition-all duration-300 ${
                    isActive ? "brightness-110 scale-110" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                  }`}
                />
              ) : (
                <div className="w-8 h-8 mx-auto mb-2 rounded-md bg-secondary" />
              )}
              <p className="font-display font-extrabold text-xl text-primary">{project.totalHours.toFixed(2)}h</p>
              <p className="text-xs text-muted-foreground font-body">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.count} atividades</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          Todas
        </button>
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setFilter(project.id)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
              filter === project.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-primary/30 rounded-xl p-6 text-center glow-orange">
        <p className="text-3xl font-display font-extrabold text-primary text-glow">{totalHours.toFixed(2)}h</p>
        <p className="text-muted-foreground text-sm mt-1">
          Total - {filter === "all" ? "Todas as Modalidades" : projects.find((project) => project.id === filter)?.name ?? filter}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Atividades ({filteredEntries.length})
        </h3>
        {entriesQuery.isError ? (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Não foi possível carregar as atividades.</div>
        ) : entriesQuery.isLoading ? (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Carregando atividades...</div>
        ) : (
          filteredEntries.map((entry) => {
            const projectName = getProjectName(entry);
            const meta = getModalityMetaByName(projectName);
            const Icon = (meta?.name ? modalityIcons[meta.id] : undefined) || Clock;

            return (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-foreground truncate">{entry.description}</h4>
                  <p className="text-xs text-muted-foreground">
                    {projectName} • {getUserName(entry)} • {entry.participants?.length ?? 0} part. • {entry.work_date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold text-primary text-lg">{Number(entry.hours_worked).toFixed(2)}h</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <section className="space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground">Aprovações</h3>
        {approvalsQuery.isError && !(approvalsQuery.error instanceof ApiError && approvalsQuery.error.status === 403) ? (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Não foi possível carregar as aprovações.</div>
        ) : approvalsQuery.isLoading ? (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Carregando aprovações...</div>
        ) : approvalsQuery.error instanceof ApiError && approvalsQuery.error.status === 403 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">
            Você não tem permissão para visualizar aprovações.
          </div>
        ) : approvalsQuery.data && approvalsQuery.data.length > 0 ? (
          <div className="space-y-2">
            {approvalsQuery.data.map((approval, index) => (
              <div key={approval.id ?? index} className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
                <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(approval, null, 2)}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">Nenhuma aprovação encontrada.</div>
        )}
      </section>
    </div>
  );
};

export default DirectorTab;
