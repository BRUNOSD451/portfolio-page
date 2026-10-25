// Dados cadastrados podem conter URLs inválidas; links e mídias aceitam apenas HTTP(S).
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function plainText(value: string | null): string {
  return (value || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

export function phoneLink(
  value: string | null | undefined,
): string | undefined {
  const digits = value?.replace(/[^\d+]/g, "");
  return digits && /\d{8,}/.test(digits.replace(/\+/g, ""))
    ? `tel:${digits}`
    : undefined;
}

export function emailLink(
  value: string | null | undefined,
): string | undefined {
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? `mailto:${encodeURIComponent(value)}`
    : undefined;
}
