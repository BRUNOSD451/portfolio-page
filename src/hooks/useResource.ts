import { useCallback, useEffect, useState } from "react";

export interface Resource<T> {
  data: T | null;
  status: "loading" | "ready" | "error";
  error: string | null;
  reload: () => void;
}

export function useResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
): Resource<T> {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<Omit<Resource<T>, "reload">>({
    data: null,
    status: "loading",
    error: null,
  });
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, status: "loading", error: null }));
    setVersion((previous) => previous + 1);
  }, []);

  useEffect(() => {
    // Descarta respostas antigas ao desmontar a seção ou iniciar uma nova consulta.
    const controller = new AbortController();
    loader(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, status: "ready", error: null });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            data: null,
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Não foi possível carregar os dados.",
          });
      },
    );
    return () => controller.abort();
  }, [loader, version]);

  return { ...state, reload };
}
