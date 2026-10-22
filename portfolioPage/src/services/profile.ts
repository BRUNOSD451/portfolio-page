import { request } from "./http";
import { apiUrl } from "./config";
import type { Profile } from "../types";

export async function getProfile(signal: AbortSignal): Promise<Profile | null> {
  const profiles = await request<Profile[]>(`${apiUrl}/user/get`, { signal });
  if (!Array.isArray(profiles))
    throw new Error("Não foi possível carregar o perfil.");
  // O mesmo proprietário utilizado pelo app e pelas ferramentas da IA.
  return profiles.find((profile) => profile.id === 1) || null;
}
