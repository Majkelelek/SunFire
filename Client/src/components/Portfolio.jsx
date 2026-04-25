export default function Portfolio() {
  const projects = [
    { id: 1, title: "Projekt Brandingu" },
    { id: 2, title: "Strona WWW" },
    { id: 3, title: "Ilustracja Cyfrowa" }
  ];

  return (
    <section className="portfolio-grid">
      {projects.map(p => (
        <div key={p.id} className="work-card">{p.title}</div>
      ))}
    </section>
  );
}