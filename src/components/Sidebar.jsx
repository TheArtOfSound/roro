import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "◐" },
  { to: "/admin/bookings", label: "Bookings", icon: "◈" },
  { to: "/admin/clients", label: "Clients", icon: "◉" },
  { to: "/admin/invoices", label: "Invoices", icon: "▤" },
  { to: "/admin/messages", label: "Messages", icon: "◧" },
  { to: "/admin/referrals", label: "Referrals", icon: "⟐" },
  { to: "/admin/gift-cards", label: "Gift Cards", icon: "▣" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <style>{`
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 49;
        }
        .sidebar-overlay.open { display: block; }
        .admin-sidebar {
          width: 240px;
          min-height: 100vh;
          background: #1a1a1a;
          color: #f5f0e8;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transition: transform 0.3s;
        }
        .sidebar-brand {
          padding: 28px 24px 20px;
          border-bottom: 1px solid rgba(245,240,232,0.08);
        }
        .sidebar-brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .sidebar-brand-name span { color: #7a8c6e; }
        .sidebar-brand-sub {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,240,232,0.4);
          margin-top: 4px;
        }
        .sidebar-nav { padding: 16px 0; flex: 1; }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: rgba(245,240,232,0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        .sidebar-link:hover {
          color: #f5f0e8;
          background: rgba(245,240,232,0.04);
        }
        .sidebar-link.active {
          color: #f5f0e8;
          background: rgba(122,140,110,0.15);
          border-left-color: #7a8c6e;
        }
        .sidebar-link-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(245,240,232,0.08);
        }
        .sidebar-footer a {
          font-size: 12px;
          color: rgba(245,240,232,0.3);
          text-decoration: none;
        }
        .sidebar-footer a:hover { color: #a3b396; }
        .sidebar-close {
          display: none;
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #f5f0e8;
          font-size: 20px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-close { display: block; }
          .sidebar-overlay { display: none; }
          .sidebar-overlay.open { display: block; }
        }
      `}</style>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <button className="sidebar-close" onClick={onClose}>&times;</button>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Ro<span>Ro</span> Mode</div>
          <div className="sidebar-brand-sub">Business Manager</div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="#/">&larr; View Website</a>
        </div>
      </aside>
    </>
  );
}
