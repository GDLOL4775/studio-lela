import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AccessPending() {
  const { user, isAdmin, signOut, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);

  async function handleRetry() {
    setChecking(true);
    await refreshRole();
    setChecking(false);
  }

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
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} disabled={checking} className="gradient-primary text-primary-foreground border-0">
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Verificando..." : "Já tenho acesso, tentar novamente"}
          </Button>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/auth"); }}>
              Sair
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Voltar ao site
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
