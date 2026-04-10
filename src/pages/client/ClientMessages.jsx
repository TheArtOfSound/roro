import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

export default function ClientMessages() {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (user?.email) loadMessages();
  }, [user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function loadMessages() {
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("email", user.email)
      .single();

    if (clientData) {
      setClient(clientData);
    }

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("email", user.email)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoading(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const { data, error } = await supabase.from("messages").insert({
      name: client?.name || user.email.split("@")[0],
      email: user.email,
      message: newMessage.trim(),
      service: "Client Portal",
      is_read: false,
      client_id: client?.id || null,
    }).select().single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#6b6560", fontFamily: "'DM Sans', sans-serif" }}>
        Loading messages...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .cm-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .cm-subtitle {
          font-size: 14px;
          color: #6b6560;
          margin-bottom: 28px;
        }
        .cm-thread {
          background: white;
          border: 1px solid #e8e0d4;
          padding: 24px;
          margin-bottom: 24px;
          max-height: 500px;
          overflow-y: auto;
        }
        .cm-message {
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 2px;
        }
        .cm-message:last-child { margin-bottom: 0; }
        .cm-message.client {
          background: #f0f5ed;
          border: 1px solid #d5e0cf;
          margin-left: 32px;
        }
        .cm-message.admin {
          background: #faf8f4;
          border: 1px solid #e8e0d4;
          margin-right: 32px;
        }
        .cm-message-meta {
          font-size: 11px;
          color: #6b6560;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .cm-message-body {
          font-size: 14px;
          line-height: 1.7;
          color: #2a2723;
          white-space: pre-wrap;
        }
        .cm-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .cm-textarea {
          flex: 1;
          padding: 14px 16px;
          border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          resize: vertical;
          min-height: 52px;
          background: white;
          transition: border-color 0.3s;
        }
        .cm-textarea:focus { border-color: #7a8c6e; }
        .cm-send-btn {
          padding: 14px 28px;
          background: #7a8c6e;
          color: white;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .cm-send-btn:hover { background: #6b7d60; }
        .cm-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cm-empty {
          text-align: center;
          padding: 40px;
          color: #6b6560;
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .cm-form { flex-direction: column; }
          .cm-send-btn { width: 100%; }
          .cm-message.client { margin-left: 16px; }
          .cm-message.admin { margin-right: 16px; }
        }
      `}</style>

      <h1 className="cm-title">Messages</h1>
      <div className="cm-subtitle">Send a message to the RoRo Mode team. We'll get back to you soon.</div>

      <div className="cm-thread">
        {messages.length === 0 ? (
          <div className="cm-empty">No messages yet. Send your first message below.</div>
        ) : (
          messages.map((m) => {
            const isClient = m.email === user.email;
            return (
              <div key={m.id} className={`cm-message ${isClient ? "client" : "admin"}`}>
                <div className="cm-message-meta">
                  {isClient ? "You" : "RoRo Mode"} &middot;{" "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <div className="cm-message-body">{m.message}</div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="cm-form" onSubmit={handleSend}>
        <textarea
          className="cm-textarea"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={2}
        />
        <button className="cm-send-btn" type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </>
  );
}
