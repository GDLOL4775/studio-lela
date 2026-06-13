import logoImg from "@/assets/studio-lela-logo.png";

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
        src={logoImg}
        alt="LS Nails Studio – Beauty Salon"
        className={`h-14 md:h-16 w-auto object-contain ${
          variant === "light" ? "brightness-0 invert" : ""
        }`}
      />
    </div>
  );
}
