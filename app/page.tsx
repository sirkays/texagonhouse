import {Header} from "@/components/landing/header";
import {HeroSection} from "@/components/landing/hero-section";
import {DecorativeDots} from "@/components/landing/decorative-dots";
import {AboutSection} from "@/components/landing/about-section";
import {ProgramsSection} from "@/components/landing/programs-section";
import {ImpactSection} from "@/components/landing/impact-section";
import {TestimonialsSection} from "@/components/landing/testimonials-section";
import {Footer} from "@/components/landing/footer";
import {NiMetLanding} from "@/components/landing/nimet-landing";
import {getBrandConfig} from "@/lib/brand";

export default function Home() {
  const brand = getBrandConfig();
  if (brand.id === "nimet") {
    return <NiMetLanding />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <DecorativeDots />
      <Header />
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <ImpactSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
