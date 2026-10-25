import { ProjectCard } from "./ProjectCard";
import { ArrowDown, CodeXml, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Resource } from "../../hooks/useResource";
import type { Project } from "../../types";
import { ErrorState, SectionLabel } from "../ui";
import { ProjectDialog } from "./ProjectDialog";
import { TechnologyFilter } from "./TechnologyFilter";

const PAGE_SIZE = 6;

export function Projects({ resource }: { resource: Resource<Project[]> }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Project | null>(null);
  const technologies = useMemo(
    () =>
      [
        ...new Set(
          resource.data?.flatMap((project) =>
            project.tecnologias.map((technology) => technology.nome),
          ) || [],
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [resource.data],
  );
  const filtered = useMemo(() => {
    const normalize = (text: string) =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (resource.data || []).filter(
      (project) =>
        (filter === "all" ||
          project.tecnologias.some(
            (technology) => technology.nome === filter,
          )) &&
        normalize(`${project.nome} ${project.descricao || ""}`).includes(
          normalize(search.trim()),
        ),
    );
  }, [resource.data, search, filter]);
  const setQuery = (value: string) => {
    setSearch(value);
    setLimit(PAGE_SIZE);
  };

  return (
    <section
      id="projetos"
      className="projects-section section container"
      aria-labelledby="projects-title"
    >
      <SectionLabel number="01">DO CONCEITO AO CÓDIGO</SectionLabel>
      <div className="section-heading" data-reveal>
        <h2 id="projects-title">
          Projetos que
          <br />
          <span>saíram do papel.</span>
        </h2>
        <p>
          Cada projeto, um desafio diferente.
          <br />
          Explore as ideias, os detalhes e as tecnologias
          <br className="desktop-break" /> por trás de cada construção.
        </p>
      </div>
      <div className="project-toolbar" data-reveal>
        <div className="project-filter">
          <label htmlFor="technology-filter">Explorar por</label>
          <TechnologyFilter
            value={filter}
            technologies={technologies}
            onChange={(value) => {
              setFilter(value);
              setLimit(PAGE_SIZE);
            }}
          />
        </div>
        <div className="project-search">
          <Search size={16} />
          <input
            aria-label="Buscar projetos"
            placeholder="Encontre um projeto..."
            value={search}
            onChange={(event) => setQuery(event.target.value)}
          />
          {search && (
            <button
              className="icon-button"
              aria-label="Limpar busca"
              onClick={() => setQuery("")}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      {resource.status === "loading" ? (
        <div
          className="project-grid"
          aria-label="Carregando projetos"
          aria-busy="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div className="project-skeleton" key={index}>
              <div />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : resource.status === "error" ? (
        <ErrorState message={resource.error!} retry={resource.reload} />
      ) : (
        <>
          <p className="sr-only" role="status">
            {filtered.length} projetos encontrados
          </p>
          {resource.data?.some((project) => project.detailsUnavailable) && (
            <div className="partial-error">
              <p>
                Algumas mídias e tecnologias não carregaram. Os demais projetos
                continuam disponíveis.
              </p>
              <button className="text-button" onClick={resource.reload}>
                Recarregar
              </button>
            </div>
          )}
          {filtered.length ? (
            <div className="project-grid">
              {filtered.slice(0, limit).map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpen={() => setSelected(project)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CodeXml size={35} strokeWidth={1.25} />
              <h3>
                {resource.data?.length
                  ? "Nenhum projeto por aqui."
                  : "Novas ideias estão a caminho."}
              </h3>
              <p>
                {resource.data?.length
                  ? "Experimente outro termo ou outra tecnologia."
                  : "Os projetos aparecerão aqui assim que estiverem disponíveis."}
              </p>
              {!!resource.data?.length && (
                <button
                  className="button button-outline"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
          {filtered.length > limit && (
            <div className="projects-more">
              <button
                className="button button-outline"
                onClick={() => setLimit(limit + PAGE_SIZE)}
              >
                Explorar mais projetos <span>{filtered.length - limit}</span>
                <ArrowDown size={16} />
              </button>
            </div>
          )}
        </>
      )}
      {selected && (
        <ProjectDialog
          key={selected.id}
          project={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
