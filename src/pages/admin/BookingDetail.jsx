import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

const STATUS_OPTIONS = ["pending", "accepted", "declined", "scheduled", "in_progress", "completed", "cancelled"];

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data } = await supabase.from("bookings").select("*, clients(name, email, phone)").eq("id", id).single();
    setBooking(data);
  }

  async function updateField(field, value) {
    setSaving(true);
    try {
      await supabase.from("bookings").update({ [field]: value }).eq("id", id);
      setBooking((b) => ({ ...b, [field]: value }));
      setToast({ message: "Updated!", type: "success" });
    } finally {
      setSaving(false);
    }
  }

  if (!booking) return <div style={{ padding: 40, textAlign: "center", color: "#6b6560" }}>Loading...</div>;

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/bookings" style={{ fontSize: 13, color: "#7a8c6e", textDecoration: "none" }}>&larr; All Bookings</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 400 }}>
            {booking.service}
          </h1>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ background: "white", border: "1px solid #e8e0d4", padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Status</label>
            <select style={{ ...fieldStyle, opacity: saving ? 0.7 : 1 }} disabled={saving} value={booking.status} onChange={(e) => updateField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Scheduled Date & Time</label>
            <input type="datetime-local" style={fieldStyle}
              value={booking.scheduled_at ? new Date(booking.scheduled_at).toISOString().slice(0, 16) : ""}
              onChange={(e) => updateField("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Duration (hours)</label>
              <input type="number" step="0.5" style={fieldStyle} value={booking.duration_hrs || ""}
                onChange={(e) => updateField("duration_hrs", e.target.value || null)}
              />
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" step="0.01" style={fieldStyle}
                value={booking.price_cents ? (booking.price_cents / 100).toFixed(2) : ""}
                onChange={(e) => updateField("price_cents", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Location</label>
            <input style={fieldStyle} value={booking.location || ""}
              onBlur={(e) => updateField("location", e.target.value)}
              onChange={(e) => setBooking({ ...booking, location: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...fieldStyle, minHeight: 120, resize: "vertical" }}
              value={booking.notes || ""}
              onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
              onBlur={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>

        <div>
          <div style={{ background: "white", border: "1px solid #e8e0d4", padding: 24, marginBottom: 16 }}>
            <div style={labelStyle}>Client</div>
            {booking.clients ? (
              <div>
                <Link to={`/admin/clients/${booking.client_id}`} style={{ fontSize: 16, color: "#7a8c6e", textDecoration: "none", fontWeight: 500 }}>
                  {booking.clients.name}
                </Link>
                <div style={{ fontSize: 13, color: "#6b6560", marginTop: 4 }}>{booking.clients.email}</div>
                {booking.clients.phone && <div style={{ fontSize: 13, color: "#6b6560" }}>{booking.clients.phone}</div>}
              </div>
            ) : <div style={{ color: "#6b6560", fontSize: 14 }}>No client linked</div>}
          </div>

          <div style={{ background: "white", border: "1px solid #e8e0d4", padding: 24 }}>
            <div style={labelStyle}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to={`/admin/invoices/new?booking=${id}&client=${booking.client_id}`} style={{
                display: "block", padding: "10px 16px", background: "#1a1a1a", color: "#f5f0e8",
                textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textAlign: "center",
              }}>Create Invoice</Link>
              {booking.clients?.email && (
                <a href={`mailto:${booking.clients.email}`} style={{
                  display: "block", padding: "10px 16px", border: "1px solid #e8e0d4",
                  textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase",
                  textAlign: "center", color: "#2a2723",
                }}>Email Client</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
