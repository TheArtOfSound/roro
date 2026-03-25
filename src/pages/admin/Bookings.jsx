import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

const STATUSES = ["all", "pending", "accepted", "scheduled", "in_progress", "completed", "cancelled"];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    const { data } = await supabase.from("bookings").select("*, clients(name, email)").order("created_at", { ascending: false });
    setBookings(data || []);
  }

  async function updateStatus(id, status) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    setToast({ message: `Booking ${status}!`, type: "success" });
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <>
      <style>{`
        .bk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .bk-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .bk-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .bk-filter {
          padding: 8px 16px; border: 1px solid #e8e0d4; background: white;
          font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1px;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s; color: #6b6560;
        }
        .bk-filter:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .bk-filter.active { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .bk-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .bk-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .bk-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; }
        .bk-table tr:hover { background: #faf8f4; }
        .bk-table a { color: #7a8c6e; text-decoration: none; font-weight: 500; }
        .bk-table a:hover { text-decoration: underline; }
        .bk-action {
          padding: 5px 12px; border: 1px solid #e8e0d4; background: white; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.5px;
          margin-right: 6px; transition: all 0.2s;
        }
        .bk-action:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .bk-action.accept { background: #d1fae5; border-color: #a7f3d0; color: #065f46; }
        .bk-action.decline { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
        .bk-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bk-header">
        <h1 className="bk-title">Bookings</h1>
        <span style={{ fontSize: 13, color: "#6b6560" }}>{bookings.length} total</span>
      </div>

      <div className="bk-filters">
        {STATUSES.map((s) => (
          <button key={s} className={`bk-filter ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bk-empty">No bookings {filter !== "all" ? `with status "${filter}"` : "yet"}.</div>
      ) : (
        <table className="bk-table">
          <thead><tr><th>Client</th><th>Service</th><th>Status</th><th>Scheduled</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link to={`/admin/bookings/${b.id}`}>{b.clients?.name || "—"}</Link>
                </td>
                <td>{b.service}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "—"}</td>
                <td>{b.price_cents ? `$${(b.price_cents / 100).toFixed(2)}` : "—"}</td>
                <td>
                  {b.status === "pending" && (
                    <>
                      <button className="bk-action accept" onClick={() => updateStatus(b.id, "accepted")}>Accept</button>
                      <button className="bk-action decline" onClick={() => updateStatus(b.id, "declined")}>Decline</button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button className="bk-action" onClick={() => updateStatus(b.id, "scheduled")}>Schedule</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
