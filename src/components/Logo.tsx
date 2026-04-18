import { Sparkles } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

/**
 * Studio Lela logo placeholder.
 * Replace `<Sparkles />` icon with the real logo image when available.
 */
export function Logo({ className = "", showText = true, variant = "dark" }: LogoProps) {
  const textColor = variant === "light" ? "text-primary-foreground" : "text-foreground";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-serif text-xl font-semibold tracking-wide ${textColor}`}>
            Studio Lela
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            nail studio
          </span>
        </div>
      )}
    </div>
  );
}
