import { request } from "./http";
import { apiUrl } from "./config";
import type { Technology } from "../types";

export async function getTechnologies(
  signal: AbortSignal,
): Promise<Technology[]> {
  const technologies = await request<Technology[]>(
    `${apiUrl}/technologies/get`,
    { signal },
  );
  if (!Array.isArray(technologies))
    throw new Error("Não foi possível carregar as tecnologias.");
  return technologies;
}
