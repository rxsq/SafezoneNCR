"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type Option = { value: string | number; label: string };

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  loading = false,
  error,
  disabled,
}: {
  value: string | number | null;
  onChange: (v: string | number | null) => void;
  options: Option[];
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (selected && !query) setQuery(selected.label);
    if (!selected && query && !open) setQuery("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.value]);

  const choose = (opt: Option | null) => {
    onChange(opt ? opt.value : null);
    setQuery(opt ? opt.label : "");
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="relative" aria-disabled={disabled || undefined}>
      <div className="flex items-center">
        <input
          ref={inputRef}
          className={clsx(
            "w-full rounded border px-2 h-9 text-sm bg-white",
            "focus:outline-none focus:ring-2 focus:ring-gray-200",
            disabled && "opacity-60 pointer-events-none"
          )}
          placeholder={loading ? "Loading..." : placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp"))
              setOpen(true);
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const opt = filtered[activeIndex];
              if (opt) choose(opt);
            } else if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls="ss-listbox"
        />
        {selected && (
          <button
            type="button"
            className="ml-[-28px] h-6 w-6 rounded text-gray-500 hover:bg-gray-100"
            aria-label="Clear selection"
            onClick={() => {
              choose(null);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            tabIndex={-1}
          >
            x
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow">
          {error ? (
            <div className="p-2 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No matches</div>
          ) : (
            <ul
              id="ss-listbox"
              role="listbox"
              className="divide-y divide-gray-50"
            >
              {filtered.map((o, idx) => {
                const active = idx === activeIndex;
                const isSelected = value === o.value;
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={isSelected}
                    className={clsx(
                      "cursor-pointer px-2 py-1.5 text-sm",
                      active ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    title={o.label}
                  >
                    {o.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
