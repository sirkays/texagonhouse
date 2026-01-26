import {Header} from "@/components/landing/header";
import {HeroSection} from "@/components/landing/hero-section";
import {DecorativeDots} from "@/components/landing/decorative-dots";
import {AboutSection} from "@/components/landing/about-section";
import {ProgramsSection} from "@/components/landing/programs-section";
import {ImpactSection} from "@/components/landing/impact-section";
import {TestimonialsSection} from "@/components/landing/testimonials-section";
import {Footer} from "@/components/landing/footer";

export default function Home() {
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
