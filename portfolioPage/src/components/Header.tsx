import { ArrowUpRight, CodeXml, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { id: "sobre", label: "Sobre mim" },
  { id: "projetos", label: "Projetos" },
  { id: "assistente", label: "Converse com a IA" },
  { id: "contato", label: "Contato" },
];

export function Header({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("sobre");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    links.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          href="#sobre"
          className="wordmark"
          aria-label="Ir ao início"
          onClick={() => setOpen(false)}
        >
          <CodeXml size={25} strokeWidth={1.8} />
          <span>
            {name.toLowerCase()}
            <b>.dev</b>
          </span>
        </a>
        <nav
          id="main-navigation"
          className={`navigation ${open ? "is-open" : ""}`}
          aria-label="Navegação principal"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document.getElementById("menu-toggle")?.focus();
            }
          }}
        >
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "active" : ""}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a href="#contato" className="header-cta">
          Vamos conversar <ArrowUpRight size={16} />
        </a>
        <button
          id="menu-toggle"
          className="icon-button menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
