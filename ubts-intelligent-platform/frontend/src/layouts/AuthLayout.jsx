import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingChatbot from "../components/chatbot/FloatingChatbot";

function AuthLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && (
        <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="content">
          <Outlet />
        </main>
      </div>

      <FloatingChatbot />
    </div>
  );
}

export default AuthLayout;
