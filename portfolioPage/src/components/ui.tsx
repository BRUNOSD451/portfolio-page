import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { safeUrl } from "../utils/format";

export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <p className="section-label">
      <span>{number}</span>
      <span className="label-line" />
      {children}
    </p>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      <button className="text-button" onClick={retry}>
        <RefreshCw size={15} /> Tentar novamente
      </button>
    </div>
  );
}

export function SafeImage({
  src,
  alt,
  fallback,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { fallback?: ReactNode }) {
  const [failedSource, setFailedSource] = useState<string>();
  const url = safeUrl(src);
  if (!url || failedSource === src) return <>{fallback}</>;
  return (
    <img
      {...props}
      src={url}
      alt={alt || ""}
      onError={() => setFailedSource(src)}
    />
  );
}

export function ExternalLink({
  href,
  children,
  className = "button button-outline",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
