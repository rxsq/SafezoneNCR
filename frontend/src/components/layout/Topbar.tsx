"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function Topbar({ userName }: { userName?: string }) {
  const router = useRouter();
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{userName || ""}</span>
        <button
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="text-sm px-3 py-1 rounded bg-gray-900 text-white hover:bg-black"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
