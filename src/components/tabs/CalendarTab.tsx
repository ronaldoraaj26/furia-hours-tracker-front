import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { modalities, modalityNames, modalityIcons } from "@/lib/modalities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TrainingEvent {
  id: number;
  modality: string;
  title: string;
  date: string;
  time: string;
}

const initialEvents: TrainingEvent[] = [
  { id: 1, modality: "lol", title: "Treino LoL - Ranked 5v5", date: "2026-03-16", time: "19:00" },
  { id: 2, modality: "valorant", title: "Treino Valorant - Competitivo", date: "2026-03-17", time: "20:00" },
  { id: 3, modality: "cs2", title: "Treino CS2 - Aim e Tática", date: "2026-03-18", time: "18:30" },
  { id: 4, modality: "rocketleague", title: "Treino Rocket League", date: "2026-03-19", time: "21:00" },
  { id: 5, modality: "freefire", title: "Treino Free Fire - Squad", date: "2026-03-16", time: "15:00" },
];

const CalendarTab = () => {
  const [events, setEvents] = useState<TrainingEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newTitle, setNewTitle] = useState("");
  const [newModality, setNewModality] = useState("lol");
  const [newTime, setNewTime] = useState("19:00");
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedDateStr = selectedDate?.toISOString().slice(0, 10) || "";
  const dayEvents = events.filter((e) => e.date === selectedDateStr);

  const eventDates = [...new Set(events.map((e) => e.date))];

  const addEvent = () => {
    if (!newTitle.trim() || !selectedDate) { toast.error("Preencha o título"); return; }
    setEvents([...events, { id: Date.now(), modality: newModality, title: newTitle, date: selectedDateStr, time: newTime }]);
    setNewTitle("");
    setDialogOpen(false);
    toast.success("Treino agendado!");
  };

  const removeEvent = (id: number) => {
    setEvents(events.filter((e) => e.id !== id));
    toast.success("Treino removido");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Calendário de Treinos</h2>
          <p className="text-muted-foreground text-sm mt-1">Agende e visualize os treinos de todas as modalidades</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Agendar Treino</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">Novo Treino</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <select value={newModality} onChange={(e) => setNewModality(e.target.value)} className="w-full h-10 rounded-md border border-input bg-secondary px-3 text-sm font-body text-foreground">
                  {modalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Treino Ranked" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="bg-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Data: {selectedDate?.toLocaleDateString("pt-BR") || "Selecione no calendário"}</p>
              <Button onClick={addEvent} className="w-full">Agendar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
        {/* Calendar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{ hasEvent: (date: Date) => eventDates.includes(date.toISOString().slice(0, 10)) }}
            modifiersClassNames={{ hasEvent: "bg-primary/20 font-bold text-primary" }}
          />
        </div>

        {/* Day events */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </h3>

          {dayEvents.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground font-body">Nenhum treino agendado para este dia</p>
            </div>
          ) : (
            dayEvents.map((event) => {
              const Icon = modalityIcons[event.modality] || CalendarDays;
              return (
                <div key={event.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{modalityNames[event.modality]} • {event.time}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}

          {/* All upcoming */}
          <h3 className="font-display font-bold text-lg text-foreground pt-4">Próximos Treinos</h3>
          <div className="space-y-2">
            {events
              .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              .slice(0, 8)
              .map((event) => {
                const Icon = modalityIcons[event.modality] || CalendarDays;
                return (
                  <div key={event.id} className="bg-secondary/50 border border-border/50 rounded-lg p-3 flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-bold text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{modalityNames[event.modality]} • {event.date} às {event.time}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
