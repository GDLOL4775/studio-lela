import { ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Sparkles,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Users,
  UserCog,
  DollarSign,
  Star,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { url: "/admin", label: "Visão Geral", icon: LayoutDashboard, end: true },
  { url: "/admin/servicos", label: "Serviços", icon: Sparkles },
  { url: "/admin/galeria", label: "Galeria", icon: ImageIcon },
  { url: "/admin/agenda", label: "Agenda", icon: CalendarIcon },
  { url: "/admin/clientes", label: "Clientes", icon: Users },
  { url: "/admin/funcionarios", label: "Funcionários", icon: UserCog },
  { url: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { url: "/admin/depoimentos", label: "Depoimentos", icon: Star },
];

function AdminSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Logo showText />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs">{user?.email}</span>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.open("/", "_blank")}>
          <ExternalLink className="w-4 h-4" /> Ver site
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/auth"); }}>
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <h1 className="ml-3 font-serif text-lg font-semibold">Painel LS Nails Studio</h1>
          </header>
          <main className="flex-1 p-4 md:p-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
