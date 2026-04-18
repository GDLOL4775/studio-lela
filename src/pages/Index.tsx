import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSection } from "@/components/site/HeroSection";
import { AboutSection } from "@/components/site/AboutSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { GallerySection } from "@/components/site/GallerySection";
import { LocationsSection } from "@/components/site/LocationsSection";
import { BookingSection } from "@/components/site/BookingSection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { SiteFooter } from "@/components/site/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <GallerySection />
        <LocationsSection />
        <BookingSection />
        <TestimonialsSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
