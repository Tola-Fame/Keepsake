"use client";

import { createContext, useContext } from "react";
import type { PublicConfig } from "@/lib/config";
import { setBlobMode } from "@/lib/store/cloud";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

const Ctx = createContext<{ config: PublicConfig; user: SessionUser | null }>({
  config: { cloud: false, google: false, email: false, blobMode: null },
  user: null,
});

export function AppProvider({ config, user, children }: { config: PublicConfig; user: SessionUser | null; children: React.ReactNode }) {
  setBlobMode(config.blobMode);
  return <Ctx.Provider value={{ config, user }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
