import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "../shared/Breadcrumbs";

export default function DashboardLayout() {
  return (
    <div className="flex bg-surface-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
              <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
