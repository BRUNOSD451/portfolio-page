// 60 s cobre a primeira requisição depois que a API gratuita adormece (~50 s).
export async function request<T>(
  url: string,
  options: RequestInit = {},
  timeout = 60_000,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal
        ? AbortSignal.any([options.signal, timeoutSignal])
        : timeoutSignal,
    });
    if (!response.ok)
      throw new Error(
        "O serviço não conseguiu concluir a consulta. Tente novamente em instantes.",
      );
    return (await response.json()) as T;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (timeoutSignal.aborted)
      throw new Error(
        "A resposta demorou mais que o esperado. Tente novamente.",
      );
    if (error instanceof TypeError || error instanceof SyntaxError) {
      throw new Error(
        "Não foi possível conectar ao serviço. Tente novamente em instantes.",
      );
    }
    throw error;
  }
}
