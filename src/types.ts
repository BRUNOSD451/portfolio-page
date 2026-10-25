export interface Profile {
  id: number;
  nome: string;
  descricao: string | null;
  email: string;
  telefone: string | null;
  idade: number | null;
  curriculo: string | null;
  imageUrl: string | null;
}

export interface Technology {
  id: number;
  nome: string;
  imagem: string | null;
}

export interface ProjectMedia {
  id: number;
  url: string;
  tipo: "imagem" | "video";
  ordem: number | null;
}

export interface ProjectSummary {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface ProjectDetail {
  nome: string;
  tecnologias: Omit<Technology, "id">[];
  midias: ProjectMedia[];
}

export interface Project extends ProjectSummary, ProjectDetail {
  detailsUnavailable?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
