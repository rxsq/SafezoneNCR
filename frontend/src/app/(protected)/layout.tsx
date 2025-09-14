"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getMe, type Me } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const user = await getMe();
      if (!user) {
        router.replace("/login");
        return;
      }
      setMe(user);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  const userName = `${me?.empFirst ?? ""} ${me?.empLast ?? ""}`.trim();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
