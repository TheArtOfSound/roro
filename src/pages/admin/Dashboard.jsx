import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Dashboard() {
  const [stats, setStats] = useState({ pendingBookings: 0, unreadMessages: 0, unpaidInvoices: 0, totalClients: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const [
      { count: pendingBookings },
      { count: unreadMessages },
      { count: unpaidInvoices },
      { count: totalClients },
      { data: bookings },
      { data: messages },
    ] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("invoices").select("*", { count: "exact", head: true }).in("status", ["sent", "overdue"]),
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*, clients(name)").order("created_at", { ascending: false }).limit(5),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    setStats({ pendingBookings: pendingBookings || 0, unreadMessages: unreadMessages || 0, unpaidInvoices: unpaidInvoices || 0, totalClients: totalClients || 0 });
    setRecentBookings(bookings || []);
    setRecentMessages(messages || []);
  }

  const statCards = [
    { label: "Pending Bookings", value: stats.pendingBookings, color: "#c4a265", link: "/admin/bookings" },
    { label: "Unread Messages", value: stats.unreadMessages, color: "#c4735a", link: "/admin/messages" },
    { label: "Unpaid Invoices", value: stats.unpaidInvoices, color: "#7a8c6e", link: "/admin/invoices" },
    { label: "Total Clients", value: stats.totalClients, color: "#1a1a1a", link: "/admin/clients" },
  ];

  return (
    <>
      <style>{`
        .dash-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 32px;
        }
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 48px;
        }
        .dash-stat-card {
          background: white;
          border: 1px solid #e8e0d4;
          padding: 24px;
          text-decoration: none;
          transition: all 0.3s;
        }
        .dash-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .dash-stat-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 400;
          margin-bottom: 4px;
        }
        .dash-stat-label {
          font-size: 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6b6560;
        }
        .dash-section {
          margin-bottom: 40px;
        }
        .dash-section-title {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #7a8c6e;
          margin-bottom: 16px;
        }
        .dash-table {
          width: 100%;
          background: white;
          border: 1px solid #e8e0d4;
          border-collapse: collapse;
        }
        .dash-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6b6560;
          border-bottom: 1px solid #e8e0d4;
          font-weight: 500;
        }
        .dash-table td {
          padding: 12px 16px;
          font-size: 14px;
          border-bottom: 1px solid #f5f0e8;
          color: #2a2723;
        }
        .dash-table tr:last-child td { border-bottom: none; }
        .dash-table a {
          color: #7a8c6e;
          text-decoration: none;
        }
        .dash-table a:hover { text-decoration: underline; }
        .dash-empty {
          padding: 40px;
          text-align: center;
          color: #6b6560;
          font-size: 14px;
          background: white;
          border: 1px solid #e8e0d4;
        }
      `}</style>

      <h1 className="dash-title">Dashboard</h1>

      <div className="dash-stats">
        {statCards.map((s) => (
          <Link to={s.link} key={s.label} className="dash-stat-card">
            <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Recent Bookings</div>
        {recentBookings.length === 0 ? (
          <div className="dash-empty">No bookings yet. They'll show up here when clients book through your site.</div>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Client</th><th>Service</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td><Link to={`/admin/bookings/${b.id}`}>{b.clients?.name || "—"}</Link></td>
                  <td>{b.service}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Recent Messages</div>
        {recentMessages.length === 0 ? (
          <div className="dash-empty">No messages yet. Contact form submissions will appear here.</div>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {recentMessages.map((m) => (
                <tr key={m.id} style={{ fontWeight: m.is_read ? 400 : 600 }}>
                  <td><Link to="/admin/messages">{m.name}</Link></td>
                  <td>{m.service || "—"}</td>
                  <td><StatusBadge status={m.is_read ? "read" : "unread"} /></td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
