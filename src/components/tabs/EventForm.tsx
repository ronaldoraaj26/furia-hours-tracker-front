import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createCalendarEvent, fetchProjects, type CalendarEvent, type Project } from "@/lib/backend";

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatLocalTime = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const normalizeTimeValue = (value: string) => value.slice(0, 5);

type EventFormProps = {
  defaultDate?: Date;
  onCreated?: (event: CalendarEvent) => void;
};

const EventForm = ({ defaultDate, onCreated }: EventFormProps) => {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(formatLocalDate(defaultDate));
  const [eventTime, setEventTime] = useState("18:00");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setEventDate(formatLocalDate(defaultDate));
  }, [defaultDate]);

  const resetForm = () => {
    setProjectId("");
    setTitle("");
    setDescription("");
    setEventDate(formatLocalDate(defaultDate));
    setEventTime(formatLocalTime(new Date()));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (projects.length === 0) {
        throw new ApiError(400, "Nenhum projeto retornado pelo backend. Cadastre os projetos antes de criar eventos.");
      }

      if (!projectId) {
        throw new ApiError(400, "Selecione um projeto.");
      }

      if (!title.trim()) {
        throw new ApiError(400, "Informe o titulo do evento.");
      }

      if (!eventDate) {
        throw new ApiError(400, "Informe a data do evento.");
      }

      if (!eventTime) {
        throw new ApiError(400, "Informe o horario do evento.");
      }

      return createCalendarEvent({
        project_id: projectId,
        title: title.trim(),
        event_date: eventDate,
        event_time: `${normalizeTimeValue(eventTime)}:00`,
        description: description.trim() || undefined,
      });
    },
    onSuccess: async (createdEvent) => {
      toast.success("Evento criado com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      onCreated?.(createdEvent);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error(error instanceof Error ? error.message : "Nao foi possivel criar o evento");
    },
  });

  const isDisabled = createMutation.isPending || projectsQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar evento
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar evento</DialogTitle>
          <DialogDescription>Crie um evento para o calendario e sincronize com o backend.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="event-project">Projeto</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={projectsQuery.isLoading || projects.length === 0}>
              <SelectTrigger id="event-project">
                <SelectValue placeholder={projectsQuery.isLoading ? "Carregando projetos..." : "Selecione um projeto"} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projects.length === 0 && !projectsQuery.isLoading ? (
              <p className="text-xs text-amber-400">Nenhum projeto retornado pelo backend. O cadastro depende disso.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-title">Titulo</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Treino coletivo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Data</Label>
              <Input id="event-date" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-time">Horario</Label>
              <Input id="event-time" type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Descricao</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Detalhes opcionais do evento"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isDisabled} className="gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
              Salvar evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
