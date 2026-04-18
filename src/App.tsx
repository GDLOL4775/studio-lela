import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import AccessPending from "./pages/AccessPending.tsx";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminServices from "./pages/admin/AdminServices.tsx";
import AdminGallery from "./pages/admin/AdminGallery.tsx";
import AdminAgenda from "./pages/admin/AdminAgenda.tsx";
import AdminClients from "./pages/admin/AdminClients.tsx";
import AdminTeam from "./pages/admin/AdminTeam.tsx";
import AdminFinance from "./pages/admin/AdminFinance.tsx";
import AdminTestimonials from "./pages/admin/AdminTestimonials.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/acesso-pendente" element={<AccessPending />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="servicos" element={<AdminServices />} />
              <Route path="galeria" element={<AdminGallery />} />
              <Route path="agenda" element={<AdminAgenda />} />
              <Route path="clientes" element={<AdminClients />} />
              <Route path="funcionarios" element={<AdminTeam />} />
              <Route path="financeiro" element={<AdminFinance />} />
              <Route path="depoimentos" element={<AdminTestimonials />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
