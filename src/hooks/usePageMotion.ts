import { useEffect, useRef } from "react";

/** Entradas únicas por elemento; conteúdo continua visível sem animações. */
export function usePageMotion() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new WeakSet<Element>();
    const revealed = new WeakSet<Element>();
    const running = new Map<Element, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (revealed.has(entry.target)) continue;
          revealed.add(entry.target);
          if (
            preference.matches ||
            entry.target.contains(document.activeElement)
          )
            continue;
          const target = entry.target as HTMLElement;
          const delay = Number(target.dataset.revealDelay || 0);
          const animation = target.animate(
            [
              { opacity: 0, transform: "translateY(26px) scale(.985)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            {
              duration: 700,
              delay,
              easing: "cubic-bezier(.16, 1, .3, 1)",
              fill: "backwards",
            },
          );
          running.set(target, animation);
          animation.finished.then(
            () => running.delete(target),
            () => running.delete(target),
          );
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );

    const register = (node: Element) => {
      const targets = [...node.querySelectorAll<HTMLElement>("[data-reveal]")];
      if (node.matches("[data-reveal]")) targets.unshift(node as HTMLElement);
      for (const target of targets) {
        if (registered.has(target)) continue;
        registered.add(target);
        observer.observe(target);
      }
    };
    register(element);
    // Projetos carregados, filtrados ou expandidos também recebem a entrada.
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (node instanceof Element) register(node);
        }
      for (const [target, animation] of running) {
        if (!target.isConnected) {
          animation.cancel();
          running.delete(target);
        }
      }
    });
    mutations.observe(element, { childList: true, subtree: true });

    const reduce = () => {
      if (preference.matches) {
        for (const animation of running.values()) animation.cancel();
        running.clear();
      }
    };
    const focus = (event: FocusEvent) => {
      const target = (event.target as Element).closest("[data-reveal]");
      if (target) {
        revealed.add(target);
        observer.unobserve(target);
        running.get(target)?.cancel();
      }
    };
    preference.addEventListener("change", reduce);
    element.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", reduce);
      element.removeEventListener("focusin", focus);
      for (const animation of running.values()) animation.cancel();
    };
  }, []);

  return root;
}
