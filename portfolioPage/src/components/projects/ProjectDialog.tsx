import { ChevronLeft, ChevronRight, Images, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProjectDetail } from "../../services/projects";
import { plainText, safeUrl } from "../../utils/format";
import { useResource } from "../../hooks/useResource";
import type { Project, ProjectMedia } from "../../types";
import { ErrorState, SafeImage } from "../ui";

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const loader = useCallback(
    (signal: AbortSignal) => getProjectDetail(project.id, signal),
    [project.id],
  );
  const details = useResource(loader);
  const media = (details.data?.midias || project.midias).filter((item) =>
    safeUrl(item.url),
  );
  const technologies = details.data?.tecnologias || project.tecnologias;
  const currentIndex = Math.min(index, Math.max(media.length - 1, 0));
  const current = media[currentIndex];

  useEffect(() => {
    // Bloqueia a rolagem de fundo e devolve o foco ao card quando o modal fecha.
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const move = (direction: number) => {
    if (media.length > 1)
      setIndex((currentIndex + direction + media.length) % media.length);
  };

  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], video[controls], [tabindex="0"]',
            ),
          ].filter((element) => element.getClientRects().length);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
          return;
        }
        if (
          (event.target as HTMLElement).closest(
            "video, input, textarea, select",
          ) ||
          media.length < 2
        )
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">POR DENTRO DO PROJETO</p>
            <h2 id="project-dialog-title">{project.nome}</h2>
          </div>
          <button
            className="icon-button dialog-close"
            onClick={onClose}
            aria-label="Fechar projeto"
            autoFocus
          >
            <X size={23} />
          </button>
        </div>
        <div className="dialog-body">
          {details.status === "error" && (
            <ErrorState
              message="Não foi possível atualizar as mídias do projeto."
              retry={details.reload}
            />
          )}
          {current ? (
            <div className="gallery">
              <div
                className="gallery-stage"
                onTouchStart={(event) => {
                  if (current.tipo !== "imagem" || event.touches.length !== 1) {
                    touchStart.current = null;
                    return;
                  }
                  touchStart.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY,
                  };
                }}
                onTouchCancel={() => {
                  touchStart.current = null;
                }}
                onTouchEnd={(event) => {
                  const start = touchStart.current;
                  touchStart.current = null;
                  if (!start || !event.changedTouches.length) return;
                  const dx = event.changedTouches[0].clientX - start.x;
                  const dy = event.changedTouches[0].clientY - start.y;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
                    move(dx < 0 ? 1 : -1);
                }}
              >
                <GalleryMedia
                  key={current.id}
                  media={current}
                  name={project.nome}
                />
                <span className="gallery-counter" aria-live="polite">
                  {currentIndex + 1} / {media.length}
                </span>
                {media.length > 1 && (
                  <>
                    <button
                      className="gallery-arrow gallery-arrow-previous"
                      aria-label="Mídia anterior"
                      onClick={() => move(-1)}
                    >
                      <ChevronLeft size={26} />
                    </button>
                    <button
                      className="gallery-arrow gallery-arrow-next"
                      aria-label="Próxima mídia"
                      onClick={() => move(1)}
                    >
                      <ChevronRight size={26} />
                    </button>
                  </>
                )}
              </div>
              {media.length > 1 && (
                <>
                  <div className="gallery-navigation">
                    <span>Use as setas ou selecione uma miniatura</span>
                  </div>
                  <div
                    className="gallery-thumbnails"
                    aria-label="Selecionar mídia"
                  >
                    {media.map((item, position) => (
                      <button
                        key={item.id}
                        className={position === currentIndex ? "selected" : ""}
                        onClick={() => setIndex(position)}
                        aria-label={`${item.tipo === "video" ? "Vídeo" : "Imagem"} ${position + 1}`}
                        aria-pressed={position === currentIndex}
                      >
                        {item.tipo === "imagem" ? (
                          <SafeImage
                            src={item.url}
                            alt=""
                            loading="lazy"
                            fallback={<Images size={19} />}
                          />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="gallery-empty">
              <Images size={30} />
              <p>
                {details.status === "loading"
                  ? "Carregando mídias..."
                  : details.status === "error"
                    ? "As mídias não estão disponíveis no momento."
                    : "Este projeto ainda não tem mídias para exibir."}
              </p>
            </div>
          )}
          <div className="dialog-description">
            <div>
              <h3>Sobre o projeto</h3>
              <p>
                {plainText(project.descricao) ||
                  "A descrição deste projeto ainda não foi adicionada."}
              </p>
            </div>
            <aside>
              <h3>Tecnologias</h3>
              <div className="technology-tags">
                {technologies.map((technology) => (
                  <span key={technology.nome}>{technology.nome}</span>
                ))}
              </div>
              {!technologies.length && (
                <p>
                  {details.status === "error" ||
                  (project.detailsUnavailable && !details.data)
                    ? "Tecnologias indisponíveis no momento."
                    : "Nenhuma tecnologia informada."}
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function GalleryMedia({ media, name }: { media: ProjectMedia; name: string }) {
  const [failed, setFailed] = useState(false);
  const fallback = (
    <div className="gallery-empty">
      <Images size={32} />
      <p>Não foi possível carregar esta mídia.</p>
    </div>
  );
  if (media.tipo === "imagem")
    return (
      <SafeImage
        src={media.url}
        alt={`Imagem do projeto ${name}`}
        fallback={fallback}
      />
    );
  if (failed) return fallback;
  return (
    <video
      controls
      playsInline
      preload="metadata"
      src={safeUrl(media.url)}
      onError={() => setFailed(true)}
      aria-label={`Vídeo do projeto ${name}`}
    />
  );
}
