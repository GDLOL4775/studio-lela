import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? "/admin" : "/acesso-pendente", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      toast.error("Erro ao entrar: " + result.error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-elegant border-border/50">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-center mb-2">Painel Studio Lela</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Entre com sua conta Google para acessar o painel administrativo.
        </p>

        <Button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full gradient-primary text-primary-foreground border-0 shadow-soft"
          size="lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar com Google"}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Apenas usuárias autorizadas têm acesso. Em caso de dúvida, entre em contato com a Letícia.
        </p>
      </Card>
    </div>
  );
}
