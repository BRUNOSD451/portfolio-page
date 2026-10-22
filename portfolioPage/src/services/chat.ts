import { request } from "./http";
import { aiUrl } from "./config";

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export function trimHistory(history: HistoryMessage[]): HistoryMessage[] {
  const recent = history.slice(-12);
  while (recent.reduce((total, item) => total + item.content.length, 0) > 12000) {
    recent.splice(0, 2);
  }
  return recent;
}

export async function sendChatMessage(
  message: string,
  signal: AbortSignal,
  history: HistoryMessage[] = [],
): Promise<string> {
  const response = await request<{ answer: string }>(
    `${aiUrl}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: trimHistory(history) }),
      signal,
    },
    90_000,
  );
  if (typeof response.answer !== "string" || !response.answer.trim()) {
    throw new Error("O assistente não retornou uma resposta. Tente novamente.");
  }
  return response.answer;
}
