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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    } catch { /* ignore */ }
  }, [collapsed]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggle = () => {
    if (window.innerWidth < 1024) setMobileOpen((o) => !o);
    else setCollapsed((s) => !s);
  };
  const closeMobile = () => setMobileOpen(false);

  return (
      <SidebarContext.Provider
          value={{ collapsed, setCollapsed, toggle, mobileOpen, closeMobile }}
      >
        {children}
      </SidebarContext.Provider>
  );
}