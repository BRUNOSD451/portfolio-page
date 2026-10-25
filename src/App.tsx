import { ArrowUp, CodeXml } from "lucide-react";
import { useEffect } from "react";
import { getProfile } from "./services/profile";
import { getProjects } from "./services/projects";
import { getTechnologies } from "./services/technologies";
import { useResource } from "./hooks/useResource";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TechnologyStrip } from "./components/TechnologyStrip";
import { Projects } from "./components/projects/Projects";
import { Chat } from "./components/Chat";
import { Contact } from "./components/Contact";
import { ReadingProgress } from "./components/ReadingProgress";
import { usePageMotion } from "./hooks/usePageMotion";

export function App() {
  const motionRoot = usePageMotion();
  // Consultas independentes permitem que cada seção trate sua carga e seus erros.
  const profile = useResource(getProfile);
  const projects = useResource(getProjects);
  const technologies = useResource(getTechnologies);
  const name = profile.data?.nome || "Bruno";

  useEffect(() => {
    document.title = `${name} — Desenvolvimento & IA`;
  }, [name]);

  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <Header name={name.split(" ")[0]} />
      <ReadingProgress />
      <main id="main" ref={motionRoot}>
        <Hero
          profile={profile}
          projects={projects}
          technologies={technologies}
        />
        <TechnologyStrip resource={technologies} />
        <Projects resource={projects} />
        <Chat name={name} />
        <Contact profile={profile} />
      </main>
      <footer className="site-footer container">
        <a className="wordmark" href="#sobre">
          <CodeXml size={21} />
          <span>
            {name.split(" ")[0].toLowerCase()}
            <b>.dev</b>
          </span>
        </a>
        <p>
          © {new Date().getFullYear()} {name}. Feito de ideias, código e café.
        </p>
        <a className="back-top" href="#sobre">
          De volta ao topo <ArrowUp size={15} />
        </a>
      </footer>
    </>
  );
}
