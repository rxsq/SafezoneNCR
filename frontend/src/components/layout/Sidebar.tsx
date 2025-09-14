"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stats", label: "Stats" },
  { href: "/ncr/log", label: "NCR Log" },
  { href: "/ncr/new", label: "New NCR" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/products", label: "Products" },
  { href: "/suppliers", label: "Suppliers" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r bg-white">
      <div className="p-4 font-semibold">Safezone NCR</div>
      <nav className="px-2 py-2 space-y-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "block rounded px-3 py-2 text-sm hover:bg-gray-100",
              pathname.startsWith(it.href) && "bg-gray-100 font-medium"
            )}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
