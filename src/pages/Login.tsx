import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo-furia.jpg";
import { Lock, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Furia E-Sports UTFPR"
            className="w-32 h-32 rounded-2xl object-cover mb-4 glow-orange"
          />
          <h1 className="font-display text-3xl font-extrabold text-primary text-glow tracking-wider">
            FURIA E-SPORTS
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-body tracking-wide">
            UTFPR — Cornélio Procópio
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Controle de Horas Complementares
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 bg-card border border-border rounded-xl p-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-body text-sm tracking-wide">
              Usuário / E-mail
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="text"
                placeholder="seu.email@alunos.utfpr.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-body text-sm tracking-wide">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-display font-bold text-lg tracking-wider h-12 animate-pulse-glow"
          >
            ENTRAR
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
