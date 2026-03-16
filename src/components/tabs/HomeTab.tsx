import { useState, useEffect } from "react";
import { Instagram, MessageCircle, Newspaper, CalendarDays, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const slides = [
  {
    id: "instagram",
    icon: Instagram,
    title: "Siga a FURIA XV",
    subtitle: "@furiaesportsxv",
    description: "Acompanhe novidades, bastidores e resultados no Instagram!",
    link: "https://instagram.com/furiaesportsxv",
    gradient: "from-pink-600 to-purple-600",
  },
  {
    id: "news",
    icon: Newspaper,
    title: "FURIA nas Finais da Copa Aliança",
    subtitle: "UTFPR Cornélio Procópio",
    description: "A FURIA representou a UTFPR-CP nas finais do Circuito Universitário de Esports da Riot Games!",
    link: "https://www.utfpr.edu.br/noticias/cornelio-procopio/furia-representa-a-utfpr-cp-nas-finais-da-copa-alianca-circuito-universitario-de-esports-da-riot-games",
    gradient: "from-primary to-amber-600",
  },
  {
    id: "discord",
    icon: MessageCircle,
    title: "Entre no Discord",
    subtitle: "Comunidade FURIA XV",
    description: "Participe da comunidade, encontre treinos e converse com outros membros.",
    link: "#",
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    id: "schedule",
    icon: CalendarDays,
    title: "Jogos da Semana",
    subtitle: "Calendário de Competições",
    description: "Confira os próximos jogos e torneios que a FURIA XV participará esta semana.",
    link: "#",
    gradient: "from-emerald-600 to-teal-500",
  },
];

const HomeTab = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-extrabold text-foreground">
          Bem-vindo ao <span className="text-primary text-glow">FURIA XV</span>
        </h2>
        <p className="text-muted-foreground font-body">Projeto de Extensão — UTFPR Cornélio Procópio</p>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className={`bg-gradient-to-br ${slide.gradient} rounded-2xl p-8 min-h-[260px] flex items-center transition-all duration-500 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex items-center gap-8 w-full">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-white space-y-2">
              <p className="text-sm font-body opacity-80 uppercase tracking-wider">{slide.subtitle}</p>
              <h3 className="font-display font-bold text-2xl">{slide.title}</h3>
              <p className="font-body text-white/80 max-w-lg">{slide.description}</p>
              {slide.link !== "#" && (
                <a
                  href={slide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm font-body font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Acessar
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-primary w-8" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Modalidades", value: "8" },
          { label: "Membros Ativos", value: "45+" },
          { label: "Horas Registradas", value: "320h" },
          { label: "Competições", value: "12" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="font-display font-extrabold text-2xl text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
