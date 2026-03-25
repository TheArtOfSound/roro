import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
  }

  async function markRead(msg) {
    await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
    setSelected({ ...msg, is_read: true });
  }

  async function convertToClient(msg) {
    const { data: existing } = await supabase.from("clients").select("id").eq("email", msg.email).single();
    if (existing) {
      await supabase.from("messages").update({ client_id: existing.id }).eq("id", msg.id);
      setToast({ message: "Already a client — message linked", type: "success" });
      return;
    }
    const { data: newClient } = await supabase.from("clients").insert({ name: msg.name, email: msg.email }).select().single();
    if (newClient) {
      await supabase.from("messages").update({ client_id: newClient.id }).eq("id", msg.id);
      setToast({ message: "Client created successfully!", type: "success" });
    }
  }

  async function createBooking(msg) {
    let clientId = msg.client_id;
    if (!clientId) {
      const { data: existing } = await supabase.from("clients").select("id").eq("email", msg.email).single();
      if (existing) {
        clientId = existing.id;
      } else {
        const { data: newClient } = await supabase.from("clients").insert({ name: msg.name, email: msg.email }).select().single();
        clientId = newClient?.id;
      }
    }
    if (clientId) {
      const { data: booking } = await supabase.from("bookings").insert({
        client_id: clientId,
        service: msg.service || "Home Reset",
        status: "pending",
        notes: msg.message,
      }).select().single();
      if (booking) {
        setToast({ message: "Booking created!", type: "success" });
        navigate(`/admin/bookings/${booking.id}`);
      }
    }
  }

  return (
    <>
      <style>{`
        .msg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .msg-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px; font-weight: 400; color: #1a1a1a;
        }
        .msg-count { font-size: 13px; color: #6b6560; }
        .msg-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .msg-list { background: white; border: 1px solid #e8e0d4; overflow: hidden; }
        .msg-item {
          padding: 16px 20px; border-bottom: 1px solid #f5f0e8;
          cursor: pointer; transition: background 0.2s;
        }
        .msg-item:hover { background: #faf8f4; }
        .msg-item.active { background: #f5f0e8; border-left: 3px solid #7a8c6e; }
        .msg-item.unread { font-weight: 600; }
        .msg-item-name { font-size: 15px; color: #1a1a1a; margin-bottom: 2px; }
        .msg-item-service { font-size: 12px; color: #6b6560; }
        .msg-item-date { font-size: 11px; color: #6b6560; float: right; }
        .msg-detail { background: white; border: 1px solid #e8e0d4; padding: 32px; }
        .msg-detail-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
        .msg-detail-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px; font-weight: 400; margin-bottom: 4px;
        }
        .msg-detail-email { font-size: 14px; color: #7a8c6e; margin-bottom: 4px; }
        .msg-detail-service { font-size: 13px; color: #6b6560; margin-bottom: 20px; }
        .msg-detail-body {
          font-size: 15px; line-height: 1.7; color: #2a2723;
          padding: 20px; background: #faf8f4; border: 1px solid #e8e0d4;
          margin-bottom: 24px; white-space: pre-wrap;
        }
        .msg-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .msg-action-btn {
          padding: 10px 20px; font-size: 12px; font-family: 'DM Sans', sans-serif;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
          border: 1px solid #e8e0d4; background: white; color: #2a2723;
          transition: all 0.2s; font-weight: 500;
        }
        .msg-action-btn:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .msg-action-btn.primary { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .msg-action-btn.primary:hover { background: #7a8c6e; border-color: #7a8c6e; }
        @media (max-width: 768px) { .msg-layout { grid-template-columns: 1fr; } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="msg-header">
        <h1 className="msg-title">Messages</h1>
        <span className="msg-count">{messages.filter((m) => !m.is_read).length} unread</span>
      </div>

      <div className="msg-layout">
        <div className="msg-list">
          {messages.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b6560" }}>
              No messages yet. Contact form submissions will appear here.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`msg-item ${!m.is_read ? "unread" : ""} ${selected?.id === m.id ? "active" : ""}`}
              onClick={() => { setSelected(m); if (!m.is_read) markRead(m); }}
            >
              <span className="msg-item-date">{new Date(m.created_at).toLocaleDateString()}</span>
              <div className="msg-item-name">{m.name}</div>
              <div className="msg-item-service">{m.service || "General Inquiry"}</div>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="msg-detail">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
              <div>
                <div className="msg-detail-name">{selected.name}</div>
                <div className="msg-detail-email">{selected.email}</div>
                <div className="msg-detail-service">{selected.service || "General Inquiry"} &middot; {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <StatusBadge status={selected.is_read ? "read" : "unread"} />
            </div>
            <div className="msg-detail-body">{selected.message || "No message provided."}</div>
            <div className="msg-actions">
              <button className="msg-action-btn primary" onClick={() => createBooking(selected)}>Create Booking</button>
              <button className="msg-action-btn" onClick={() => convertToClient(selected)}>Add to Clients</button>
              <a className="msg-action-btn" href={`mailto:${selected.email}`} style={{ textDecoration: "none" }}>Reply via Email</a>
            </div>
          </div>
        ) : (
          <div className="msg-detail-empty">Select a message to view details</div>
        )}
      </div>
    </>
  );
}
