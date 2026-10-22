import { ArrowUpRight, Check, Copy, Mail, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Resource } from "../hooks/useResource";
import type { Profile } from "../types";
import { emailLink, phoneLink } from "../utils/format";
import { ErrorState, SectionLabel } from "./ui";

export function Contact({ profile }: { profile: Resource<Profile | null> }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const email = emailLink(profile.data?.email);
  const phone = phoneLink(profile.data?.telefone);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.data!.email);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 3500);
  };

  return (
    <section
      id="contato"
      className="contact-section section container"
      aria-labelledby="contact-title"
    >
      <SectionLabel number="03">
        O PRÓXIMO PROJETO COMEÇA COM UM OLÁ
      </SectionLabel>
      <div className="contact-layout" data-reveal>
        <div>
          <h2 id="contact-title">
            Uma ideia em mente?
            <br />
            <span>Vamos conversar.</span>
            <ArrowUpRight className="contact-arrow" strokeWidth={1} />
          </h2>
          <p>
            Uma oportunidade, um projeto ou uma boa troca de ideias.
            <br />
            Vai ser um prazer conhecer o que você está pensando.
          </p>
        </div>
        <div className="contact-links">
          {profile.status === "loading" ? (
            <div className="text-skeleton">
              <span />
              <span />
            </div>
          ) : profile.status === "error" ? (
            <ErrorState
              message="Os contatos estão indisponíveis no momento."
              retry={profile.reload}
            />
          ) : (
            <>
              {email && (
                <div className="contact-item">
                  <span className="contact-icon">
                    <Mail size={21} />
                  </span>
                  <a href={email}>
                    <span>ME MANDE UM E-MAIL</span>
                    <strong>{profile.data?.email}</strong>
                  </a>
                  <button
                    className="icon-button"
                    aria-label="Copiar e-mail"
                    title="Copiar e-mail"
                    onClick={() => void copy()}
                  >
                    {copyState === "copied" ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              )}
              {phone && (
                <a className="contact-item" href={phone}>
                  <span className="contact-icon">
                    <Phone size={21} />
                  </span>
                  <span>
                    <span>OU ENTRE EM CONTATO</span>
                    <strong>{profile.data?.telefone}</strong>
                  </span>
                  <ArrowUpRight size={20} />
                </a>
              )}
              {!email && !phone && (
                <p>Os canais de contato serão disponibilizados em breve.</p>
              )}
              <p className="copy-feedback" role="status">
                {copyState === "copied"
                  ? "E-mail copiado!"
                  : copyState === "error"
                    ? "Não foi possível copiar. Você pode selecionar o e-mail acima."
                    : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
