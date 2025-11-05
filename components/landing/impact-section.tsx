export function ImpactSection() {
  const stats = [
    {number: "5,000+", label: "Students Trained"},
    {number: "50+", label: "Partner Schools"},
    {number: "15", label: "African Countries"},
    {number: "95%", label: "Success Rate"},
  ];

  return (
    <section className="relative z-10 px-6 py-16 lg:px-12 lg:py-24 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Our Impact Across Africa
          </h2>
          <p className="text-lg opacity-90 max-w-3xl mx-auto text-pretty">
            Making a difference in education, one student at a time.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-base lg:text-lg opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
