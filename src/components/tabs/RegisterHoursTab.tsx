import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { createTimeEntry, fetchCategories, fetchProjects, uploadFileAttachment, type Category, type Participant, type Project } from "@/lib/backend";
import { getModalityMetaByName, modalities } from "@/lib/modalities";

type ParticipantForm = Participant & { localId: number };

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildLocalIso = (workDate: string, time: string) => {
  const [year, month, day] = workDate.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMins = String(absOffset % 60).padStart(2, "0");

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(
    localDate.getHours(),
  )}:${pad(localDate.getMinutes())}:00${sign}${offsetHours}:${offsetMins}`;
};

const toHoursWorked = (workDate: string, startTime: string, endTime: string) => {
  const start = new Date(`${workDate}T${startTime}:00`);
  const end = new Date(`${workDate}T${endTime}:00`);
  const diff = end.getTime() - start.getTime();
  return diff > 0 ? (diff / (1000 * 60 * 60)).toFixed(2) : "0.00";
};

const getProjectLabel = (project: Project) => project.name || "Projeto";

const RegisterHoursTab = () => {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const displayProjects = useMemo(
    () =>
      projects.length > 0
        ? projects
        : modalities.map((modality) => ({
            id: modality.id,
            name: modality.name,
            description: "Cadastre este projeto no backend para habilitar o envio.",
          })),
    [projects],
  );
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [workDate, setWorkDate] = useState(formatLocalDate());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    { localId: 0, name: "", ra: "", participated_at: buildLocalIso(formatLocalDate(), "18:00") },
  ]);

  const selectedProject = useMemo(() => displayProjects.find((project) => project.id === selectedProjectId) ?? null, [displayProjects, selectedProjectId]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const resetForm = () => {
    setSelectedProjectId("");
    setSelectedCategoryId("");
    setDescription("");
    setImages([]);
    setWorkDate(formatLocalDate());
    setStartTime("18:00");
    setEndTime("20:00");
    setParticipants([
      { localId: 0, name: "", ra: "", participated_at: buildLocalIso(formatLocalDate(), "18:00") },
    ]);
  };

  const addParticipant = () => {
    setParticipants((current) => [
      ...current,
      {
        localId: Date.now(),
        name: "",
        ra: "",
        participated_at: buildLocalIso(workDate, startTime),
      },
    ]);
  };

  const removeParticipant = (localId: number) => {
    setParticipants((current) => (current.length <= 1 ? current : current.filter((participant) => participant.localId !== localId)));
  };

  const updateParticipant = (localId: number, field: "name" | "ra", value: string) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.localId === localId
          ? {
              ...participant,
              [field]: value,
              participated_at: buildLocalIso(workDate, startTime),
            }
          : participant,
      ),
    );
  };

  const createMutation = useMutation({
      mutationFn: async () => {
      if (projects.length === 0) {
        throw new ApiError(400, "Nenhuma modalidade cadastrada no backend. Rode a migration/seed de projects antes de registrar horas.");
      }

      if (!selectedProjectId) {
        throw new ApiError(400, "Selecione uma modalidade.");
      }

      if (!selectedCategoryId) {
        throw new ApiError(400, "Selecione uma categoria.");
      }

      if (!description.trim()) {
        throw new ApiError(400, "Informe a descrição da atividade.");
      }

      if (!workDate || !startTime || !endTime) {
        throw new ApiError(400, "Preencha data, horário inicial e final.");
      }

      const payloadParticipants = participants.map(({ name, ra }) => ({
        name: name.trim(),
        ra: ra.trim(),
        participated_at: buildLocalIso(workDate, startTime),
      }));

      if (payloadParticipants.some((participant) => !participant.name || !participant.ra)) {
        throw new ApiError(400, "Preencha nome e RA de todos os participantes.");
      }

      const hoursWorked = toHoursWorked(workDate, startTime, endTime);
      const timeEntry = await createTimeEntry({
        project_id: selectedProjectId,
        category_id: selectedCategoryId,
        work_date: workDate,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        hours_worked: hoursWorked,
        description: description.trim(),
        participants: payloadParticipants,
      });

      if (images.length > 0) {
        await Promise.all(images.map((file) => uploadFileAttachment(timeEntry.id, file)));
      }

      return timeEntry;
    },
    onSuccess: async () => {
      toast.success("Atividade registrada com sucesso!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["time-entries"] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
      resetForm();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error(error instanceof Error ? error.message : "Não foi possível registrar a atividade");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages((current) => [...current, ...Array.from(event.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Registrar Atividade</h2>
        <p className="text-muted-foreground text-sm mt-1">Selecione a modalidade, categoria e envie os comprovantes</p>
      </div>

      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Modalidades</h3>
            <p className="text-sm text-muted-foreground">Projetos carregados do backend</p>
          </div>
          {selectedProject && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Selecionada</p>
              <p className="text-sm font-semibold text-primary">{getProjectLabel(selectedProject)}</p>
            </div>
          )}
        </div>

        {projectsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando modalidades...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayProjects.map((project) => {
              const meta = getModalityMetaByName(project.name);
              const isActive = selectedProjectId === project.id;
              const isFallback = projects.length === 0;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                    isActive ? "border-primary bg-primary/10" : "border-border bg-secondary/20 hover:border-primary/40"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta?.color ?? "from-muted-foreground to-muted"} opacity-0 ${isActive ? "opacity-15" : "group-hover:opacity-10"} transition-opacity`} />
                  <div className="relative z-10 flex items-center gap-3">
                    {meta?.image ? (
                      <img src={meta.image} alt={project.name} className="h-9 w-9 rounded-md object-contain" />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-secondary" />
                    )}
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-foreground truncate">{project.name}</p>
                      {project.description ? <p className="text-xs text-muted-foreground truncate">{project.description}</p> : null}
                      {isFallback ? <p className="text-[11px] text-amber-400 mt-1">Pendente de migration no backend</p> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {projects.length === 0 ? (
          <p className="text-xs text-amber-400">
            O backend ainda não retornou `projects`. A lista acima é um fallback visual; o salvamento ficará bloqueado até a migration/seed criar os UUIDs reais.
          </p>
        ) : null}
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">Informações da Atividade</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-body">Categoria</Label>
              <select
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-secondary px-3 text-sm font-body text-foreground"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {selectedCategory ? (
                <p className="text-xs text-muted-foreground">
                  {selectedCategory.description ?? "Sem descrição"} {selectedCategory.max_hours ? `• Máx. ${selectedCategory.max_hours}h` : ""}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-body">Descrição</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Treino semanal"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-body">Data</Label>
              <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="bg-secondary" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-body">Horas trabalhadas</Label>
              <Input
                type="number"
                value={toHoursWorked(workDate, startTime, endTime)}
                readOnly
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-body">Início</Label>
              <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="bg-secondary" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-body">Fim</Label>
              <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="bg-secondary" />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">Comprovantes</h3>
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={`${image.name}-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                <img src={URL.createObjectURL(image)} alt={`Comprovante ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Cada arquivo será enviado separadamente após salvar a atividade.</p>
        </section>

        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Participantes</h3>
              <p className="text-sm text-muted-foreground">Os participantes são enviados junto com a atividade</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addParticipant} className="gap-1">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.localId} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 bg-secondary/50 rounded-lg p-4 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={participant.name}
                    onChange={(event) => updateParticipant(participant.localId, "name", event.target.value)}
                    placeholder="Nome completo"
                    className="bg-secondary h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">R.A.</Label>
                  <Input
                    value={participant.ra}
                    onChange={(event) => updateParticipant(participant.localId, "ra", event.target.value)}
                    placeholder="Registro Acadêmico"
                    className="bg-secondary h-9 text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(participant.localId)}
                    disabled={participants.length <= 1}
                    className="text-muted-foreground hover:text-destructive h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={createMutation.isPending} className="w-full font-display font-bold text-lg h-12 tracking-wider">
          {createMutation.isPending ? "SALVANDO..." : "REGISTRAR ATIVIDADE"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterHoursTab;
