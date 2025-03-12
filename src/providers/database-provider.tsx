"use client";
import getDb, { IdeaBinDatabase } from "@/lib/db";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export const DatabaseProviderContext = createContext({} as IdeaBinDatabase);

export const useDb = () => useContext(DatabaseProviderContext);

export default function DatabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [db, setDb] = useState<IdeaBinDatabase | null>(null);

  useEffect(() => {
    (async () => {
      setDb(await getDb());
    })();
  }, []);

  if (!db) {
    return "...";
  }

  return (
    <DatabaseProviderContext.Provider value={db}>
      {children}
    </DatabaseProviderContext.Provider>
  );
}
