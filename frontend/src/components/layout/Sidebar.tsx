"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { logout } from "@/lib/auth";
import {
  BsGrid,
  BsBarChart,
  BsJournalText,
  BsPlusSquare,
  BsPeople,
  BsBox,
  BsTruck,
  BsGear,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsBoxArrowRight,
} from "react-icons/bs";

const sections = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <BsGrid /> },
      { href: "/stats", label: "Stats", icon: <BsBarChart /> },
    ],
  },
  {
    title: "NCR",
    items: [
      { href: "/ncr/log", label: "NCR Log", icon: <BsJournalText /> },
      { href: "/ncr/new", label: "New NCR", icon: <BsPlusSquare /> },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/employees", label: "Employees", icon: <BsPeople /> },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: <BsBox /> },
      { href: "/suppliers", label: "Suppliers", icon: <BsTruck /> },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "#", label: "Settings", icon: <BsGear /> }],
  },
];

export function Sidebar({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem("sb.collapsed");
    if (v === "1") setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("sb.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={clsx(
        "border-r bg-white flex flex-col transition-[width] duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand + toggle */}
      <div className="h-14 border-b flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white grid place-items-center text-sm font-bold">
            S
          </div>
          {!collapsed && <span className="font-semibold">SafezoneNCR</span>}
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsed ? <BsChevronDoubleRight /> : <BsChevronDoubleLeft />}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-3">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-gray-500">
                {sec.title}
              </div>
            )}
            <div className="space-y-1">
              {sec.items.map((it) => {
                const active =
                  pathname === it.href || pathname.startsWith(it.href + "/");
                return (
                  <Link
                    key={it.label}
                    href={it.href}
                    className={clsx(
                      "group flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100",
                      active && "bg-gray-100 font-medium"
                    )}
                    title={collapsed ? it.label : undefined}
                  >
                    <span className="text-lg">{it.icon}</span>
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-2 py-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-sm font-semibold">
            {userName?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {userName || "Account"}
              </div>
              {userEmail && (
                <div className="text-xs text-gray-500 truncate">
                  {userEmail}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="mt-2 w-full flex items-center gap-2 rounded px-3 py-2 text-sm bg-gray-900 text-white hover:bg-black"
          title={collapsed ? "Logout" : undefined}
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <BsBoxArrowRight />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 border-t pt-3 text-[11px] text-gray-500 space-y-1">
            <div className="flex gap-3">
              <Link href="/legal/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/support" className="hover:underline">
                Support
              </Link>
            </div>
            <div className="mt-2">
              &copy; {new Date().getFullYear()} SafezoneNCR
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
