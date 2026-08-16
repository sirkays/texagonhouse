import {Button} from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {getBrandConfig} from "@/lib/brand";

export function HeroSection() {
  const brand = getBrandConfig();
  const isNiMet = brand.id === "nimet";

  return (
    <section className="relative z-10 px-6 py-12 lg:px-12 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {isNiMet ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase">
                    Federal Ministry of Aviation & Aerospace Development
                  </div>
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight text-balance">
                    Authoritative Weather, Climate Science & Technical Training Platform.
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Delivering state-of-the-art educational simulations, meteorological data training, and interactive learning across Nigeria.
                  </p>
                </>
              ) : (
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight text-balance">
                  First Company in Africa to Develop a 4IR Curriculum for
                  Secondary School Students.
                </h1>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-full shadow-lg">
                  {isNiMet ? "ACCESS LEARNING PORTAL" : "SEE HOW WE WORK"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Curved Image */}
          <div className="relative">
            <div className="relative aspect-square w-full max-w-lg mx-auto lg:ml-auto">
              {/* Curved frame effect */}
              <div className="absolute inset-0 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] overflow-hidden border-8 border-primary/20">
                <Image
                  src="/happy-african-student-with-headphones-using-laptop.jpg"
                  alt="Student learning with technology"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

