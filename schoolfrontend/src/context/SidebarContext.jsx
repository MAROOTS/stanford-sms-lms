import { useEffect, useState } from "react";
import SidebarContext from "./sidebarContext";

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    } catch {
      // Fall back silently if localStorage is unavailable
    }
  }, [collapsed]);

  const toggle = () => setCollapsed((s) => !s);

  return (
      <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
        {children}
      </SidebarContext.Provider>
  );
}