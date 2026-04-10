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
  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    service: "",
    scheduled_at: "",
    duration_hours: "",
    price: "",
    notes: "",
  });

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    const { data } = await supabase.from("bookings").select("*, clients(name, email)").order("created_at", { ascending: false });
    setBookings(data || []);
  }

  async function loadClients() {
    const { data } = await supabase.from("clients").select("id, name").order("name");
    setClients(data || []);
  }

  async function updateStatus(id, status) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    setToast({ message: `Booking ${status}!`, type: "success" });
  }

  function openCreateForm() {
    loadClients();
    setForm({ client_id: "", service: "", scheduled_at: "", duration_hours: "", price: "", notes: "" });
    setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from("bookings").insert({
        client_id: form.client_id || null,
        service: form.service,
        scheduled_at: form.scheduled_at || null,
        duration_hours: form.duration_hours ? parseFloat(form.duration_hours) : null,
        price_cents: form.price ? Math.round(parseFloat(form.price) * 100) : null,
        notes: form.notes || null,
        status: "pending",
      }).select("*, clients(name, email)").single();

      if (error) { setToast({ message: error.message, type: "error" }); return; }
      setBookings((prev) => [data, ...prev]);
      setShowCreate(false);
      setToast({ message: "Booking created!", type: "success" });
    } finally {
      setSaving(false);
    }
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const fieldStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #e8e0d4",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", background: "white",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
    textTransform: "uppercase", color: "#6b6560", marginBottom: "6px",
  };

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
        .bk-create-btn {
          padding: 10px 20px; font-size: 12px; font-family: 'DM Sans', sans-serif;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
          background: #1a1a1a; color: #f5f0e8; border: 1px solid #1a1a1a;
          transition: all 0.2s; font-weight: 500;
        }
        .bk-create-btn:hover { background: #7a8c6e; border-color: #7a8c6e; }
        .bk-form { background: white; border: 1px solid #e8e0d4; padding: 32px; margin-bottom: 24px; max-width: 800px; }
        .bk-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .bk-form-full { margin-bottom: 16px; }
        .bk-form-actions { display: flex; gap: 12px; margin-top: 8px; }
        .bk-form-btn {
          padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: none;
        }
        .bk-form-btn-primary { background: #1a1a1a; color: #f5f0e8; }
        .bk-form-btn-primary:hover { background: #7a8c6e; }
        .bk-form-btn-secondary { background: white; color: #2a2723; border: 1px solid #e8e0d4; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bk-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 className="bk-title">Bookings</h1>
          <button className="bk-create-btn" onClick={openCreateForm}>+ Create Booking</button>
        </div>
        <span style={{ fontSize: 13, color: "#6b6560" }}>{bookings.length} total</span>
      </div>

      {showCreate && (
        <form className="bk-form" onSubmit={handleCreate}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", marginBottom: "20px", color: "#1a1a1a" }}>New Booking</div>
          <div className="bk-form-row">
            <div>
              <label style={labelStyle}>Client</label>
              <select style={fieldStyle} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Service Type</label>
              <input style={fieldStyle} placeholder="e.g., Home Reset" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
            </div>
          </div>
          <div className="bk-form-row">
            <div>
              <label style={labelStyle}>Scheduled Date/Time</label>
              <input type="datetime-local" style={fieldStyle} value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Duration (hours)</label>
              <input type="number" step="0.5" min="0" style={fieldStyle} placeholder="e.g., 2" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: e.target.value })} />
            </div>
          </div>
          <div className="bk-form-row">
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" step="0.01" min="0" style={fieldStyle} placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div />
          </div>
          <div className="bk-form-full">
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="bk-form-actions">
            <button type="submit" disabled={saving} className="bk-form-btn bk-form-btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Create Booking"}</button>
            <button type="button" className="bk-form-btn bk-form-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      )}

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
