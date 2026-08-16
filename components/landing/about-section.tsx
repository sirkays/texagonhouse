import {BookOpen, Users, Award, CloudSun, Compass, ShieldCheck} from "lucide-react";
import {getBrandConfig} from "@/lib/brand";

export function AboutSection() {
  const brand = getBrandConfig();
  const isNiMet = brand.id === "nimet";

  return (
    <section className="relative z-10 px-6 py-16 lg:px-12 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {isNiMet
              ? "Advancing Meteorological Knowledge & Skills Across Nigeria"
              : "Empowering Africa's Future Through Education"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            {isNiMet
              ? "The Nigerian Meteorological Agency (NiMet) training platform provides specialized technical curricula, live climate simulations, and professional education for researchers, students, and practitioners."
              : "Techxagon Academy is pioneering the future of education in Africa by developing cutting-edge Fourth Industrial Revolution (4IR) curriculum designed specifically for secondary school students."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              {isNiMet ? (
                <CloudSun className="w-7 h-7 text-primary" />
              ) : (
                <BookOpen className="w-7 h-7 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              {isNiMet ? "Meteorological Training" : "Innovative Curriculum"}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {isNiMet
                ? "Specialized modules covering weather forecasting, climatology, aeronautical meteorology, and climate risk resilience."
                : "Our 4IR curriculum integrates AI, robotics, coding, and digital literacy to prepare students for the jobs of tomorrow."}
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              {isNiMet ? (
                <Compass className="w-7 h-7 text-primary" />
              ) : (
                <Users className="w-7 h-7 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              {isNiMet ? "Certified Scientists & Specialists" : "Expert Educators"}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {isNiMet
                ? "Learn directly from WMO-recognized experts, principal meteorologists, and data analysts with decades of field experience."
                : "Our team of experienced educators and industry professionals bring real-world expertise to the classroom."}
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              {isNiMet ? (
                <ShieldCheck className="w-7 h-7 text-primary" />
              ) : (
                <Award className="w-7 h-7 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              {isNiMet ? "National Accreditation" : "Proven Results"}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {isNiMet
                ? "Official competency certifications verified under federal standards and international meteorological protocols."
                : "Students who complete our programs show significant improvement in critical thinking, problem-solving, and technical skills."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

