import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingChatbot from "../components/chatbot/FloatingChatbot";

function AuthLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-red-950/20">
      <div className="flex min-h-screen">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[290px]">
          <Topbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1">
            <div className="mx-auto max-w-7xl animate-fadeIn px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <FloatingChatbot />
    </div>
  );
}

export default AuthLayout;