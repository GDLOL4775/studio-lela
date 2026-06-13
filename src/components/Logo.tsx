import logoAsset from "@/assets/ls-nails-studio-logo.jpg.asset.json";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

/**
 * LS Nails Studio logo. The image already includes the wordmark, so we render
 * it standalone. `variant="light"` adds a subtle brightness for dark backgrounds.
 */
export function Logo({ className = "", variant = "dark" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoAsset.url}
        alt="LS Nails Studio – Beauty Salon"
        className={`h-14 md:h-16 w-auto object-cover rounded-2xl shadow-soft ${
          variant === "light" ? "ring-1 ring-background/20" : "ring-1 ring-border"
        }`}
      />
    </div>
  );
}
