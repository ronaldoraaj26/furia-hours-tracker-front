import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { ApiError } from "@/lib/api";
import { fetchCalendarEvents } from "@/lib/backend";
import { getModalityMetaByName, modalityIcons } from "@/lib/modalities";
import EventForm from "@/components/tabs/EventForm";

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatEventTime = (value: string) => value.slice(0, 5);

const CalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const eventsQuery = useQuery({ queryKey: ["calendar-events"], queryFn: fetchCalendarEvents });
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

  const selectedDateStr = selectedDate ? formatLocalDate(selectedDate) : "";

  const normalizedEvents = useMemo(
    () =>
      events.map((event) => {
        const projectName = typeof event.project === "string" ? event.project : event.project?.name ?? "Projeto";
        const meta = getModalityMetaByName(projectName);

        return {
          ...event,
          projectName,
          meta,
        };
      }),
    [events],
  );

  const dayEvents = normalizedEvents.filter((event) => event.event_date === selectedDateStr);
  const eventDates = [...new Set(normalizedEvents.map((event) => event.event_date))];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Calendario de Treinos</h2>
          <p className="text-muted-foreground text-sm mt-1">Eventos sincronizados com o backend</p>
        </div>

        <EventForm defaultDate={selectedDate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{ hasEvent: (date: Date) => eventDates.includes(formatLocalDate(date)) }}
            modifiersClassNames={{ hasEvent: "bg-primary/20 font-bold text-primary" }}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </h3>

          {eventsQuery.isError ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground font-body">
                {eventsQuery.error instanceof ApiError && eventsQuery.error.status === 403
                  ? "Voce nao tem permissao para ver os eventos."
                  : "Nao foi possivel carregar os eventos."}
              </p>
            </div>
          ) : eventsQuery.isLoading ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground font-body">Carregando eventos...</p>
            </div>
          ) : dayEvents.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground font-body">Nenhum evento agendado para este dia</p>
            </div>
          ) : (
            dayEvents.map((event) => {
              const Icon = (event.meta?.name ? modalityIcons[event.meta.id] : undefined) || CalendarDays;

              return (
                <div key={event.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {event.projectName} • {formatEventTime(event.event_time)}
                    </p>
                    {event.description ? <p className="text-xs text-muted-foreground mt-1">{event.description}</p> : null}
                  </div>
                </div>
              );
            })
          )}

          <h3 className="font-display font-bold text-lg text-foreground pt-4">Proximos Eventos</h3>
          <div className="space-y-2">
            {normalizedEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground font-body">
                  Nenhum evento retornado por `GET /api/calendar-events/`. E preciso seedar eventos no backend.
                </p>
              </div>
            ) : (
              normalizedEvents
                .filter((event) => event.event_date >= formatLocalDate())
                .sort((a, b) => a.event_date.localeCompare(b.event_date) || a.event_time.localeCompare(b.event_time))
                .slice(0, 8)
                .map((event) => {
                  const Icon = (event.meta?.name ? modalityIcons[event.meta.id] : undefined) || CalendarDays;
                  return (
                    <div key={event.id} className="bg-secondary/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-bold text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.projectName} • {event.event_date} as {formatEventTime(event.event_time)}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
