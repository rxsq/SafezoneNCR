"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link";
};

export function ErrorPage({
  code,
  title,
  description,
  actions = [],
}: {
  code?: string | number;
  title: string;
  description?: string;
  actions?: Action[];
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-muted/40">
      <Card className="w-full max-w-xl rounded-2xl border shadow-sm">
        <CardHeader className="space-y-1 text-center">
          {code ? (
            <div className="text-muted-foreground text-xs tracking-[0.25em]">
              {code}
            </div>
          ) : null}
          <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 text-center">
          {description ? (
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {actions.map((a, i) => {
                const base =
                  "h-11 px-5 rounded-xl min-w-[9.5rem] flex items-center justify-center transition";
                const primary =
                  "bg-gradient-to-b from-zinc-800 to-zinc-900 text-white border border-black/20 shadow hover:from-zinc-700 hover:to-zinc-800 dark:from-zinc-700 dark:to-zinc-800";
                const outline =
                  "bg-white text-foreground border border-zinc-300 hover:bg-zinc-50 dark:bg-transparent dark:text-white dark:border-white/15 dark:hover:bg-white/5 shadow-sm";

                const className = `${base} ${
                  a.variant === "outline" ? outline : primary
                }`;

                if (a.href) {
                  return (
                    <Button asChild key={i} className={className}>
                      <Link href={a.href}>{a.label}</Link>
                    </Button>
                  );
                }
                return (
                  <Button key={i} onClick={a.onClick} className={className}>
                    {a.label}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Primary fallback */}
              <Button
                asChild
                className="h-11 px-5 rounded-xl min-w-[9.5rem] flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900 text-white border border-black/20 shadow hover:from-zinc-700 hover:to-zinc-800 transition"
              >
                <Link href="/">Go Home</Link>
              </Button>

              {/* Secondary fallback */}
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 rounded-xl min-w-[9.5rem] flex items-center justify-center bg-white text-foreground border border-zinc-300 hover:bg-zinc-50 dark:bg-transparent dark:text-white dark:border-white/15 dark:hover:bg-white/5 shadow-sm transition"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
