import { ArrowUpRight, Images, Play } from "lucide-react";
import type { Project } from "../../types";
import { plainText, safeUrl } from "../../utils/format";
import { SafeImage } from "../ui";

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const cover = project.midias.find((media) => safeUrl(media.url));
  const fallback = (
    <div className="project-placeholder">
      <span className="placeholder-code">{"{ }"}</span>
      <strong>{project.nome}</strong>
      <span>
        {project.detailsUnavailable
          ? "Explore a descrição do projeto"
          : "Uma ideia transformada em código"}
      </span>
    </div>
  );
  return (
    <article
      className={`project-card project-tone-${index % 3}`}
      data-reveal
      data-reveal-delay={(index % 2) * 90}
    >
      <div className="project-cover">
        <span className="cover-grid" />
        {cover?.tipo === "imagem" ? (
          <SafeImage
            src={cover.url}
            alt={`Prévia do projeto ${project.nome}`}
            loading="lazy"
            className="project-preview"
            fallback={fallback}
          />
        ) : cover?.tipo === "video" ? (
          <div className="video-cover">
            <Play size={46} strokeWidth={1} />
            <span>Conheça o projeto em vídeo</span>
          </div>
        ) : (
          fallback
        )}
        <span className="project-index">
          {String(index + 1).padStart(2, "0")} / PROJETO
        </span>
        <span className="cover-open">
          <ArrowUpRight size={22} />
        </span>
        {!!project.midias.length && (
          <span className="media-count">
            <Images size={13} />
            {project.midias.length}{" "}
            {project.midias.length === 1 ? "mídia" : "mídias"}
          </span>
        )}
      </div>
      <div className="project-information">
        <div className="project-title-row">
          <h3>
            <button
              onClick={onOpen}
              aria-label={`Ver projeto ${project.nome}`}
              aria-haspopup="dialog"
            >
              {project.nome}
            </button>
          </h3>
          <ArrowUpRight size={19} aria-hidden="true" />
        </div>
        <p className="project-summary">
          {plainText(project.descricao) ||
            "Conheça os detalhes e as tecnologias deste projeto."}
        </p>
        <div className="technology-tags">
          {project.tecnologias.slice(0, 4).map((technology) => (
            <span key={technology.nome}>{technology.nome}</span>
          ))}
          {project.tecnologias.length > 4 && (
            <span
              title={project.tecnologias
                .slice(4)
                .map((technology) => technology.nome)
                .join(", ")}
            >
              +{project.tecnologias.length - 4}
            </span>
          )}
        </div>
        <span className="project-details-hint">
          Ver projeto completo <ArrowUpRight size={14} />
        </span>
      </div>
    </article>
  );
}
