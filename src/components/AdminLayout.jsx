import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "./Sidebar";
import AdminAI from "./AdminAI";

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #faf8f4;
          font-family: 'DM Sans', sans-serif;
        }
        .admin-main {
          flex: 1;
          margin-left: 240px;
          min-height: 100vh;
        }
        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: white;
          border-bottom: 1px solid #e8e0d4;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .admin-hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #2a2723;
          padding: 4px;
        }
        .admin-user {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #6b6560;
        }
        .admin-signout {
          background: none;
          border: 1px solid #e8e0d4;
          padding: 6px 16px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          color: #6b6560;
          transition: all 0.2s;
        }
        .admin-signout:hover {
          border-color: #dc2626;
          color: #dc2626;
        }
        .admin-content {
          padding: 32px;
        }
        @media (max-width: 768px) {
          .admin-main { margin-left: 0; }
          .admin-hamburger { display: block; }
          .admin-topbar { padding: 12px 16px; }
          .admin-content { padding: 12px; }
          .admin-user span { display: none; }
          .admin-signout { padding: 4px 10px; font-size: 11px; }
        }
        @media (max-width: 768px) {
          /* Make all admin tables scrollable horizontally */
          table { display: block; overflow-x: auto; white-space: nowrap; }
          /* Stack grid layouts */
          [style*="grid-template-columns: 2fr"] { grid-template-columns: 1fr !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          /* Full-width cards */
          [style*="display: grid"][style*="gap: 24px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="admin-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <div className="admin-topbar">
            <button className="admin-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <div />
            <div className="admin-user">
              <span>{user?.email}</span>
              <button className="admin-signout" onClick={signOut}>Sign Out</button>
            </div>
          </div>
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
        <AdminAI />
      </div>
    </>
  );
}
