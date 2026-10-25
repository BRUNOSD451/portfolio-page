import { CodeXml } from "lucide-react";
import type { Technology } from "../types";
import type { Resource } from "../hooks/useResource";
import { ErrorState, SafeImage } from "./ui";

export function TechnologyStrip({
  resource,
}: {
  resource: Resource<Technology[]>;
}) {
  if (resource.status === "ready" && !resource.data?.length) return null;
  return (
    <div className="technology-section">
      <div className="container technology-inner" data-reveal>
        <p>
          IDEIAS GANHAM VIDA
          <br />
          <strong>COM AS FERRAMENTAS CERTAS</strong>
        </p>
        {resource.status === "error" ? (
          <ErrorState
            message="Tecnologias indisponíveis no momento."
            retry={resource.reload}
          />
        ) : (
          <div
            className="technology-list"
            aria-label="Tecnologias utilizadas"
            tabIndex={0}
          >
            {resource.status === "loading"
              ? Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="technology-skeleton" />
                ))
              : resource.data?.map((technology) => (
                  <div className="technology" key={technology.id}>
                    <SafeImage
                      src={technology.imagem || undefined}
                      alt=""
                      loading="lazy"
                      fallback={<CodeXml size={21} />}
                    />
                    <span>{technology.nome}</span>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
