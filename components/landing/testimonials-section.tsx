import {Quote} from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Techxagon Academy has transformed how our students engage with technology. The 4IR curriculum is exactly what African education needs.",
      author: "Dr. Amara Okonkwo",
      role: "Principal, Lagos Secondary School",
    },
    {
      quote:
        "My daughter's confidence in coding and problem-solving has grown tremendously. She's now building her own apps!",
      author: "Kwame Mensah",
      role: "Parent, Ghana",
    },
    {
      quote:
        "The hands-on approach and real-world projects make learning exciting. I never thought I'd be programming robots at 15!",
      author: "Zainab Mohammed",
      role: "Student, Nigeria",
    },
  ];

  return (
    <section className="relative z-10 px-6 py-16 lg:px-12 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What People Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Hear from students, parents, and educators who have experienced our
            programs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-3xl border border-border relative">
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-bold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
