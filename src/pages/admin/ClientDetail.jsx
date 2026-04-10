import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data: c } = await supabase.from("clients").select("*").eq("id", id).single();
    if (c) { setClient(c); setForm(c); }
    const { data: b } = await supabase.from("bookings").select("*").eq("client_id", id).order("created_at", { ascending: false });
    setBookings(b || []);
    const { data: inv } = await supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false });
    setInvoices(inv || []);
  }

  async function saveClient(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("clients").update({
        name: form.name, email: form.email, phone: form.phone, address: form.address, notes: form.notes,
      }).eq("id", id);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
      setClient(form);
      setEditing(false);
      setToast({ message: "Client updated!", type: "success" });
    } finally {
      setSaving(false);
    }
  }

  if (!client) return <div style={{ padding: 40, textAlign: "center", color: "#6b6560" }}>Loading...</div>;

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #e8e0d4",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", background: editing ? "white" : "#faf8f4",
  };
  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
    textTransform: "uppercase", color: "#6b6560", marginBottom: "6px",
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Link to="/admin/clients" style={{ fontSize: 13, color: "#7a8c6e", textDecoration: "none" }}>&larr; All Clients</Link>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 400, marginTop: 8 }}>{client.name}</h1>
        </div>
        <button onClick={() => setEditing(!editing)} style={{
          padding: "10px 20px", background: editing ? "#7a8c6e" : "#1a1a1a", color: "#f5f0e8", border: "none",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
        }}>
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
        <form onSubmit={saveClient} style={{ background: "white", border: "1px solid #e8e0d4", padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={form.name || ""} disabled={!editing} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={form.email || ""} disabled={!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone || ""} disabled={!editing} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={form.address || ""} disabled={!editing} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.notes || ""} disabled={!editing} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {editing && (
            <button type="submit" disabled={saving} style={{
              padding: "12px 24px", background: "#1a1a1a", color: "#f5f0e8", border: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}>{saving ? "Saving..." : "Save Changes"}</button>
          )}
        </form>

        <div>
          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#7a8c6e", marginBottom: 12 }}>Booking History</div>
          {bookings.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#6b6560", background: "white", border: "1px solid #e8e0d4" }}>No bookings yet</div>
          ) : (
            <table style={{ width: "100%", background: "white", border: "1px solid #e8e0d4", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>Service</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>Date</th>
              </tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ padding: "12px 14px", fontSize: 14, borderBottom: "1px solid #f5f0e8" }}>
                      <Link to={`/admin/bookings/${b.id}`} style={{ color: "#7a8c6e", textDecoration: "none" }}>{b.service}</Link>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #f5f0e8" }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: "12px 14px", fontSize: 14, borderBottom: "1px solid #f5f0e8", color: "#6b6560" }}>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#7a8c6e", marginTop: 28, marginBottom: 12 }}>Invoices</div>
          {invoices.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#6b6560", background: "white", border: "1px solid #e8e0d4" }}>No invoices yet</div>
          ) : (
            <table style={{ width: "100%", background: "white", border: "1px solid #e8e0d4", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>#</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>Amount</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560", borderBottom: "1px solid #e8e0d4" }}>Status</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ padding: "12px 14px", fontSize: 14, borderBottom: "1px solid #f5f0e8" }}>
                      <Link to={`/admin/invoices/${inv.id}`} style={{ color: "#7a8c6e", textDecoration: "none" }}>{inv.invoice_number}</Link>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 14, borderBottom: "1px solid #f5f0e8" }}>${(inv.amount_cents / 100).toFixed(2)}</td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #f5f0e8" }}><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
