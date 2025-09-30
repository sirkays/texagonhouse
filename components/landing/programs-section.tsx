import {Button} from "@/components/ui/button";
import {Code, Cpu, Lightbulb, Rocket} from "lucide-react";

export function ProgramsSection() {
  const programs = [
    {
      icon: Code,
      title: "Coding & Programming",
      description:
        "Learn Python, JavaScript, and web development fundamentals through hands-on projects.",
      topics: ["Python Basics", "Web Development", "App Creation"],
    },
    {
      icon: Cpu,
      title: "Artificial Intelligence",
      description:
        "Explore machine learning, neural networks, and AI applications in everyday life.",
      topics: ["Machine Learning", "AI Ethics", "Data Science"],
    },
    {
      icon: Lightbulb,
      title: "Innovation & Design",
      description:
        "Develop creative problem-solving skills and learn design thinking methodologies.",
      topics: ["Design Thinking", "Prototyping", "User Experience"],
    },
    {
      icon: Rocket,
      title: "Robotics & IoT",
      description:
        "Build and program robots while learning about the Internet of Things ecosystem.",
      topics: ["Robot Building", "Sensors", "Smart Devices"],
    },
  ];

  return (
    <section className="relative z-10 px-6 py-16 lg:px-12 lg:py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our 4IR Programs
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Comprehensive curriculum designed to equip students with essential
            skills for the digital age.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-3xl border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <program.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {program.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {program.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-full">
            Explore All Programs
          </Button>
        </div>
      </div>
    </section>
  );
}
