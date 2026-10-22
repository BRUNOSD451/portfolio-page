import {
  ArrowDown,
  ArrowUpRight,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import type { Resource } from "../hooks/useResource";
import { apiUrl } from "../services/config";
import type { Profile, Project, Technology } from "../types";
import { plainText, safeUrl } from "../utils/format";
import { ErrorState, ExternalLink } from "./ui";

export function Hero({
  profile,
  projects,
  technologies,
}: {
  profile: Resource<Profile | null>;
  projects: Resource<Project[]>;
  technologies: Resource<Technology[]>;
}) {
  const user = profile.data;
  // O PDF guardado no servidor vem como caminho relativo à API.
  const resume = user?.curriculo?.startsWith("/")
    ? `${apiUrl}${user.curriculo}`
    : safeUrl(user?.curriculo);
  const name = user?.nome || "Bruno";

  return (
    <section id="sobre" className="hero container" aria-labelledby="hero-title">
      <div className="hero-ambience" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="orange-dot" /> DESENVOLVIMENTO & INTELIGÊNCIA
          ARTIFICIAL
        </p>
        <p className="hero-intro">
          Olá, eu sou{" "}
          <span>
            {profile.status === "loading" ? (
              <span className="inline-skeleton" />
            ) : (
              name
            )}
          </span>
          <span className="intro-wave" aria-hidden="true">
            ✳
          </span>
        </p>
        <h1 id="hero-title">
          Transformando
          <br />
          ideias em
          <br />
          <span className="accent-word">
            experiências<span className="title-dot">.</span>
          </span>
        </h1>
        <div className="hero-description">
          {profile.status === "loading" ? (
            <div className="text-skeleton" aria-label="Carregando apresentação">
              <span />
              <span />
            </div>
          ) : profile.status === "error" ? (
            <ErrorState
              message="Não consegui carregar a apresentação agora."
              retry={profile.reload}
            />
          ) : (
            <p>
              {plainText(user?.descricao ?? null) ||
                "Bem-vindo ao meu espaço. Explore os projetos e conheça um pouco do que construo."}
            </p>
          )}
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="#projetos">
            Explore meus projetos <ArrowUpRight size={18} />
          </a>
          {resume && (
            <>
              <ExternalLink href={resume}>
                <FileText size={16} /> Ver currículo
              </ExternalLink>
              <a
                className="button button-outline"
                href={`${apiUrl}/user/resume/download`}
                download
              >
                <Download size={16} /> Baixar PDF
              </a>
            </>
          )}
        </div>
        <div className="hero-proof">
          <div>
            <strong>
              {projects.status === "ready"
                ? String(projects.data?.length || 0).padStart(2, "0")
                : "—"}
              <span> /</span>
            </strong>
            <span>projetos para explorar</span>
          </div>
          <span className="proof-divider" />
          <div>
            <strong>
              {technologies.status === "ready"
                ? String(technologies.data?.length || 0).padStart(2, "0")
                : "—"}
              <span> /</span>
            </strong>
            <span>tecnologias na bagagem</span>
          </div>
          <a href="#assistente" className="hero-ai-link">
            <Sparkles size={19} />
            <span>
              Quer me conhecer?
              <br />
              <b>
                Pergunte à minha IA <ArrowUpRight size={13} />
              </b>
            </span>
          </a>
        </div>
      </div>
      <a className="scroll-cue" href="#projetos">
        <span className="scroll-line" /> CONTINUE EXPLORANDO{" "}
        <ArrowDown size={13} />
      </a>
    </section>
  );
}
