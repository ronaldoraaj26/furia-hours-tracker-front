import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import logo from "@/assets/logo-furia.jpg";
import { toast } from "sonner";

const modalityNames: Record<string, string> = {
  lol: "League of Legends",
  valorant: "Valorant",
  wildrift: "Wild Rift",
  tft: "TFT",
};

interface Participant {
  id: number;
  name: string;
  ra: string;
  dateTime: string;
}

const AddHours = () => {
  const navigate = useNavigate();
  const { modality } = useParams<{ modality: string }>();
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [participants, setParticipants] = useState<Participant[]>(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: "",
      ra: "",
      dateTime: new Date().toISOString().slice(0, 16),
    }))
  );

  const addParticipant = () => {
    if (participants.length >= 10) {
      toast.error("Máximo de 10 participantes atingido");
      return;
    }
    setParticipants([
      ...participants,
      { id: Date.now(), name: "", ra: "", dateTime: new Date().toISOString().slice(0, 16) },
    ]);
  };

  const removeParticipant = (id: number) => {
    if (participants.length <= 5) {
      toast.error("Mínimo de 5 participantes");
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (id: number, field: keyof Participant, value: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Atividade registrada com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logo} alt="Furia" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <h1 className="font-display font-bold text-primary text-base leading-tight">
              {modalityNames[modality || ""] || "Modalidade"}
            </h1>
            <p className="text-xs text-muted-foreground">Registrar Atividade</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Activity Info */}
          <section className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Informações da Atividade</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-body">Descrição</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Treino semanal"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-body">Horas</Label>
                <Input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Ex: 2"
                  min="0.5"
                  step="0.5"
                  className="bg-secondary"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Fotos / Comprovantes</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Participants */}
          <section className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-foreground">
                Participantes ({participants.length}/10)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParticipant}
                disabled={participants.length >= 10}
                className="gap-1"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {participants.map((p, index) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 bg-secondary/50 rounded-lg p-4 border border-border/50"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={p.name}
                      onChange={(e) => updateParticipant(p.id, "name", e.target.value)}
                      placeholder="Nome completo"
                      className="bg-secondary h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">R.A.</Label>
                    <Input
                      value={p.ra}
                      onChange={(e) => updateParticipant(p.id, "ra", e.target.value)}
                      placeholder="Registro Acadêmico"
                      className="bg-secondary h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data/Hora</Label>
                    <Input
                      type="datetime-local"
                      value={p.dateTime}
                      onChange={(e) => updateParticipant(p.id, "dateTime", e.target.value)}
                      className="bg-secondary h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParticipant(p.id)}
                      disabled={participants.length <= 5}
                      className="text-muted-foreground hover:text-destructive h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Button type="submit" className="w-full font-display font-bold text-lg h-12 tracking-wider">
            REGISTRAR ATIVIDADE
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AddHours;
