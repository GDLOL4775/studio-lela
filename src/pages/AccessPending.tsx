import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccessPending() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-elegant border-border/50 text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-accent" />
        </div>
        <h1 className="font-serif text-2xl font-semibold mb-2">Acesso pendente</h1>
        <p className="text-muted-foreground mb-6">
          Olá <strong>{user?.email}</strong>! Sua conta foi criada, mas ainda não tem permissão de administradora.
          Peça à Letícia para liberar seu acesso.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={async () => { await signOut(); navigate("/auth"); }}>
            Sair
          </Button>
          <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground border-0">
            Voltar ao site
          </Button>
        </div>
      </Card>
    </div>
  );
}
