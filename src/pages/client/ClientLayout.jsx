import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ClientLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/client/login");
  };

  return (
    <>
      <style>{`
        .cp-layout {
          min-height: 100vh;
          background: #faf8f4;
          font-family: 'DM Sans', sans-serif;
        }
        .cp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 64px;
          background: white;
          border-bottom: 1px solid #e8e0d4;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .cp-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #1a1a1a;
          text-decoration: none;
        }
        .cp-logo span { color: #7a8c6e; }
        .cp-signout {
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
        .cp-signout:hover {
          border-color: #dc2626;
          color: #dc2626;
        }
        .cp-nav {
          display: flex;
          align-items: center;
          gap: 0;
          background: white;
          border-bottom: 1px solid #e8e0d4;
          padding: 0 32px;
        }
        .cp-nav-link {
          padding: 14px 24px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #6b6560;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .cp-nav-link:hover {
          color: #2a2723;
        }
        .cp-nav-link.active {
          color: #7a8c6e;
          border-bottom-color: #7a8c6e;
        }
        .cp-content {
          padding: 32px;
          max-width: 960px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .cp-topbar { padding: 0 16px; }
          .cp-nav { padding: 0 16px; overflow-x: auto; }
          .cp-nav-link { padding: 12px 16px; font-size: 12px; white-space: nowrap; }
          .cp-content { padding: 20px; }
        }
      `}</style>
      <div className="cp-layout">
        <div className="cp-topbar">
          <a href="#/client" className="cp-logo">Ro<span>Ro</span> Mode</a>
          <button className="cp-signout" onClick={handleSignOut}>Sign Out</button>
        </div>
        <nav className="cp-nav">
          <NavLink to="/client" end className={({ isActive }) => `cp-nav-link ${isActive ? "active" : ""}`}>
            My Projects
          </NavLink>
          <NavLink to="/client/invoices" className={({ isActive }) => `cp-nav-link ${isActive ? "active" : ""}`}>
            Invoices
          </NavLink>
          <NavLink to="/client/messages" className={({ isActive }) => `cp-nav-link ${isActive ? "active" : ""}`}>
            Messages
          </NavLink>
        </nav>
        <div className="cp-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
