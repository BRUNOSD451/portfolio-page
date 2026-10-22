import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export function TechnologyFilter({
  value,
  technologies,
  onChange,
}: {
  value: string;
  technologies: string[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = [
    { value: "all", label: "Todas as tecnologias" },
    ...technologies.map((name) => ({ value: name, label: name })),
  ];
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      setActive(
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : !open
              ? selected
              : (active +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  options.length) %
                options.length,
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(active);
      else {
        setActive(selected);
        setOpen(true);
      }
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now();
      typed.current = {
        text:
          (now - typed.current.time < 700 ? typed.current.text : "") +
          event.key.toLocaleLowerCase(),
        time: now,
      };
      const match = options.findIndex((option) =>
        option.label.toLocaleLowerCase().startsWith(typed.current.text),
      );
      if (match >= 0) {
        event.preventDefault();
        setActive(match);
        setOpen(true);
      }
    }
  };

  return (
    <div
      className="technology-select"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        id="technology-filter"
        type="button"
        className={`technology-select-trigger ${open ? "is-open" : ""}`}
        ref={trigger}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onKeyDown={onKeyDown}
        onClick={() => {
          setActive(selected);
          setOpen(!open);
        }}
      >
        <SlidersHorizontal size={16} />
        <span>{options[selected].label}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label="Tecnologias"
          className="technology-select-options"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              id={`${id}-option-${index}`}
              type="button"
              role="option"
              aria-selected={value === option.value}
              tabIndex={-1}
              className={active === index ? "is-active" : ""}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              onMouseMove={() => setActive(index)}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
