"use client";

import { createContext, useContext } from "react";
import type { PublicConfig } from "@/lib/config";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

const Ctx = createContext<{ config: PublicConfig; user: SessionUser | null }>({
  config: { cloud: false, google: false, email: false },
  user: null,
});

export function AppProvider({ config, user, children }: { config: PublicConfig; user: SessionUser | null; children: React.ReactNode }) {
  return <Ctx.Provider value={{ config, user }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
