"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SelectProps<T extends string> = {
  id?: string;
  label: string;
  name?: string;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
};

export function Select<T extends string>({
  id,
  label,
  name,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const SelectedIcon = selected?.icon;

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="zt-select" ref={rootRef}>
      <label className="zt-label" htmlFor={fieldId}>
        {label}
      </label>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={fieldId}
        type="button"
        className="zt-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        {SelectedIcon ? <SelectedIcon aria-hidden className="zt-select-icon" /> : null}
        <span>{selected?.label}</span>
        <ChevronDown aria-hidden className="zt-select-chevron" />
      </button>
      {open ? (
        <ul id={listboxId} className="zt-select-list" role="listbox">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <li
                key={option.value}
                role="option"
                tabIndex={0}
                aria-selected={option.value === value}
                className="zt-select-option"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange(option.value);
                    setOpen(false);
                  }
                }}
              >
                {Icon ? <Icon aria-hidden className="zt-select-icon" /> : null}
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
