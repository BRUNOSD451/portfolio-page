import { request } from "./http";
import { apiUrl } from "./config";
import type { Project, ProjectDetail, ProjectSummary } from "../types";

export async function getProjectDetail(
  id: number,
  signal: AbortSignal,
): Promise<ProjectDetail> {
  const detail = await request<ProjectDetail>(`${apiUrl}/projects/get/${id}`, {
    signal,
  });
  if (!Array.isArray(detail.midias) || !Array.isArray(detail.tecnologias)) {
    throw new Error("Não foi possível carregar os detalhes do projeto.");
  }
  return {
    ...detail,
    midias: [...detail.midias].sort(
      (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id,
    ),
  };
}

export async function getProjects(signal: AbortSignal): Promise<Project[]> {
  const summaries = await request<ProjectSummary[]>(`${apiUrl}/projects/get`, {
    signal,
  });
  if (!Array.isArray(summaries))
    throw new Error("Não foi possível carregar os projetos.");
  const projects: Project[] = [];
  // A API atual oferece detalhes individuais. Limite a quatro consultas simultâneas.
  for (let offset = 0; offset < summaries.length; offset += 4) {
    signal.throwIfAborted();
    const batch = await Promise.all(
      summaries.slice(offset, offset + 4).map(async (project) => {
        try {
          return {
            ...project,
            ...(await getProjectDetail(project.id, signal)),
          };
        } catch (error) {
          if (signal.aborted) throw error;
          return {
            ...project,
            tecnologias: [],
            midias: [],
            detailsUnavailable: true,
          };
        }
      }),
    );
    projects.push(...batch);
  }
  return projects;
}
