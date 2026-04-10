import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const KNOWLEDGE = [
  {
    triggers: ["book a client", "create booking", "new booking", "schedule a client", "book someone", "add booking", "how do i book"],
    responses: [
      {
        text: "To book a client:\n\n1. Go to Bookings\n2. Click '+ Create Booking' at the top\n3. Select the client, choose the service, set the date/time and price\n4. Click Save — it'll be set to 'pending' and you can accept/schedule from there.\n\nOr I can take you right there:",
        actions: [
          { label: "→ Create a new booking now", link: "/admin/bookings", action: "create" },
        ],
      },
    ],
  },
  {
    triggers: ["booking", "schedule", "appointment", "bookings"],
    responses: [
      {
        text: "Here's what I can do with bookings:",
        actions: [
          { label: "View all bookings", link: "/admin/bookings" },
          { label: "Create new booking", link: "/admin/bookings", action: "create" },
        ],
      },
    ],
  },
  {
    triggers: ["add a client", "new client", "create client", "add client", "add someone"],
    responses: [
      {
        text: "To add a new client:\n\n1. Go to Clients\n2. Click '+ Add Client'\n3. Enter their name, email, and phone\n4. Save — they'll appear in your client list and you can create bookings for them.\n\nOr jump right there:",
        actions: [
          { label: "→ Add a new client now", link: "/admin/clients", action: "create" },
        ],
      },
    ],
  },
  {
    triggers: ["client", "customer", "contact"],
    responses: [
      {
        text: "Client management:",
        actions: [
          { label: "View all clients", link: "/admin/clients" },
          { label: "Add new client", link: "/admin/clients", action: "create" },
        ],
      },
    ],
  },
  {
    triggers: ["invoice", "payment", "bill", "charge", "money"],
    responses: [
      {
        text: "Invoice & payment tools:",
        actions: [
          { label: "View all invoices", link: "/admin/invoices" },
          { label: "Create new invoice", link: "/admin/invoices/new" },
          { label: "View unpaid invoices", link: "/admin/invoices?filter=sent" },
          { label: "View overdue invoices", link: "/admin/invoices?filter=overdue" },
        ],
      },
    ],
  },
  {
    triggers: ["message", "inbox", "contact form", "inquiry", "lead"],
    responses: [
      {
        text: "Messages & inquiries:",
        actions: [
          { label: "View all messages", link: "/admin/messages" },
          { label: "View unread messages", link: "/admin/messages?filter=unread" },
        ],
      },
    ],
  },
  {
    triggers: ["price", "pricing", "cost", "rate", "service", "change price"],
    responses: [
      {
        text: "You can manage your services and pricing from Settings:",
        actions: [
          { label: "Edit services & pricing", link: "/admin/settings" },
          { label: "View current services", link: "/admin/settings?tab=services" },
        ],
      },
    ],
  },
  {
    triggers: ["promo", "discount", "coupon", "code", "deal", "special"],
    responses: [
      {
        text: "Promotions & discount codes:",
        actions: [
          { label: "Create promo code", link: "/admin/settings?tab=promos" },
          { label: "View active promos", link: "/admin/settings?tab=promos" },
        ],
      },
    ],
  },
  {
    triggers: ["gift", "gift card"],
    responses: [
      {
        text: "Gift card management:",
        actions: [
          { label: "Create gift card", link: "/admin/gift-cards" },
          { label: "View all gift cards", link: "/admin/gift-cards" },
        ],
      },
    ],
  },
  {
    triggers: ["referral", "refer"],
    responses: [
      {
        text: "Referral program:",
        actions: [
          { label: "Generate referral code", link: "/admin/referrals" },
          { label: "View all referrals", link: "/admin/referrals" },
        ],
      },
    ],
  },
  {
    triggers: ["task", "follow up", "follow-up", "todo", "remind"],
    responses: [
      {
        text: "Task management:",
        actions: [
          { label: "View all tasks", link: "/admin/ai-tasks" },
          { label: "Create new task", link: "/admin/ai-tasks", action: "create" },
        ],
      },
    ],
  },
  {
    triggers: ["ai", "receptionist", "phone", "call log", "calls"],
    responses: [
      {
        text: "AI Receptionist (662) 479-4007:",
        actions: [
          {
            label: "View call logs",
            link: "https://ionos.ai-voice-receptionist.com/customer/C_IO_O9Z8NGHE/sessions",
            external: true,
          },
          {
            label: "Edit AI settings",
            link: "https://ionos.ai-voice-receptionist.com/customer/C_IO_O9Z8NGHE/settings",
            external: true,
          },
        ],
      },
    ],
  },
  {
    triggers: ["website", "site", "landing page", "homepage"],
    responses: [
      {
        text: "Your website is live at roromode.com:",
        actions: [
          { label: "View website", link: "/", external: true },
          { label: "Edit services on site", link: "/admin/settings" },
        ],
      },
    ],
  },
  {
    triggers: ["change password", "reset password", "update password", "new password", "password"],
    responses: [
      {
        text: "To change your admin password:\n\n1. Go to your Supabase dashboard\n2. Navigate to Authentication → Users\n3. Find your account and reset the password\n\nOr you can use the Supabase password reset flow by signing out and clicking 'Forgot Password' on the login page.",
        actions: [
          { label: "Go to Supabase Auth", link: "https://supabase.com/dashboard/project/ndwpnoptkwoiponpnxxn/auth/users", external: true },
        ],
      },
    ],
  },
  {
    triggers: ["create invoice", "new invoice", "send invoice", "bill a client", "charge"],
    responses: [
      {
        text: "To create an invoice:\n\n1. Go to Invoices → '+ Create Invoice'\n2. Select the client and optionally link a booking\n3. Add line items (description, quantity, price)\n4. Set a due date and optionally add a Stripe payment link\n5. Save as Draft or Save & Send\n\nLet me take you there:",
        actions: [
          { label: "→ Create invoice now", link: "/admin/invoices/new" },
        ],
      },
    ],
  },
  {
    triggers: ["change price", "update price", "edit price", "change pricing", "update my prices"],
    responses: [
      {
        text: "To change your service pricing:\n\n1. Go to Settings → Services & Pricing tab\n2. Click 'Edit' on the service you want to change\n3. Update the price in the 'Price Display' field\n4. Click Save\n\nChanges show on your website immediately!",
        actions: [
          { label: "→ Edit prices now", link: "/admin/settings" },
        ],
      },
    ],
  },
  {
    triggers: ["add service", "new service", "create service", "add a new service"],
    responses: [
      {
        text: "To add a new service to your website:\n\n1. Go to Settings → Services & Pricing\n2. Click '+ Add Service'\n3. Fill in the name, description, price, and details\n4. Save — it appears on roromode.com immediately",
        actions: [
          { label: "→ Add a service now", link: "/admin/settings" },
        ],
      },
    ],
  },
  {
    triggers: ["follow up", "follow-up", "need to call", "remind me", "task"],
    responses: [
      {
        text: "To create a follow-up task:\n\n1. Go to Tasks\n2. Click 'New Task'\n3. Select the client, describe what needs to happen, and set a due date\n4. You'll see it in your task list with call/text/email quick actions",
        actions: [
          { label: "→ Create a task now", link: "/admin/ai-tasks" },
        ],
      },
    ],
  },
  {
    triggers: ["help me", "what can you do", "show me everything", "guide me"],
    responses: [
      {
        text: "Here's everything you can do from your admin panel:",
        actions: [
          { label: "\ud83d\udcca Dashboard \u2014 Overview stats", link: "/admin" },
          { label: "\ud83d\udcc5 Bookings \u2014 Schedule & manage jobs", link: "/admin/bookings" },
          { label: "\ud83d\udc65 Clients \u2014 Your client database", link: "/admin/clients" },
          { label: "\ud83d\udcb0 Invoices \u2014 Billing & payments", link: "/admin/invoices" },
          { label: "\ud83d\udcac Messages \u2014 Contact form inbox", link: "/admin/messages" },
          { label: "\ud83c\udf81 Gift Cards \u2014 Create & manage", link: "/admin/gift-cards" },
          { label: "\ud83d\udd17 Referrals \u2014 Referral codes", link: "/admin/referrals" },
          { label: "\ud83d\udccb Tasks \u2014 Follow-ups & outreach", link: "/admin/ai-tasks" },
          { label: "\u2699\ufe0f Settings \u2014 Services & pricing", link: "/admin/settings" },
          {
            label: "\ud83d\udcde AI Receptionist \u2014 Call logs",
            link: "https://ionos.ai-voice-receptionist.com/customer/C_IO_O9Z8NGHE/sessions",
            external: true,
          },
        ],
      },
    ],
  },
];

const DATA_QUERIES = [
  {
    triggers: ["how many booking", "pending booking", "booking count"],
    query: async () => {
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return {
        text: `You have ${count || 0} pending bookings.`,
        actions: [{ label: "View pending bookings", link: "/admin/bookings" }],
      };
    },
  },
  {
    triggers: ["how many client", "client count", "total client"],
    query: async () => {
      const { count } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      return {
        text: `You have ${count || 0} total clients.`,
        actions: [{ label: "View all clients", link: "/admin/clients" }],
      };
    },
  },
  {
    triggers: ["unread", "new message", "how many message"],
    query: async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      return {
        text: `You have ${count || 0} unread messages.`,
        actions: [{ label: "View messages", link: "/admin/messages" }],
      };
    },
  },
  {
    triggers: ["unpaid", "outstanding", "owed", "how much"],
    query: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("amount_cents")
        .in("status", ["sent", "overdue"]);
      const total = (data || []).reduce((sum, inv) => sum + (inv.amount_cents || 0), 0);
      return {
        text: `You have $${(total / 100).toFixed(2)} in outstanding invoices.`,
        actions: [{ label: "View unpaid invoices", link: "/admin/invoices" }],
      };
    },
  },
  {
    triggers: ["overdue task", "pending task", "task count"],
    query: async () => {
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return {
        text: `You have ${count || 0} pending tasks.`,
        actions: [{ label: "View tasks", link: "/admin/ai-tasks" }],
      };
    },
  },
];

function findBestMatch(input, items, key = "triggers") {
  const lower = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const item of items) {
    let score = 0;
    for (const trigger of item[key]) {
      if (lower.includes(trigger.toLowerCase())) {
        score += trigger.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

const GREETING = "Hey Aurora! \ud83d\udc4b I'm your RoRo Mode assistant. Ask me anything about your business, or tell me what you need to do \u2014 I'll take you right there.";

export default function AdminAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "ai", text: GREETING, actions: [] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAction = useCallback(
    (action) => {
      if (action.external) {
        window.open(action.link, "_blank");
      } else {
        navigate(action.link);
        if (action.action === "create") {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("admin-ai-action", { detail: { action: "create" } }));
          }, 300);
        }
        setOpen(false);
      }
    },
    [navigate]
  );

  const processMessage = useCallback(async (text) => {
    // Check data queries first (most specific)
    const dataMatch = findBestMatch(text, DATA_QUERIES);
    if (dataMatch) {
      try {
        const result = await dataMatch.query();
        return { role: "ai", text: result.text, actions: result.actions };
      } catch {
        return { role: "ai", text: "I had trouble fetching that data. Try again in a moment.", actions: [] };
      }
    }

    // Check knowledge triggers
    const knowledgeMatch = findBestMatch(text, KNOWLEDGE);
    if (knowledgeMatch) {
      const resp = knowledgeMatch.responses[0];
      return { role: "ai", text: resp.text, actions: resp.actions };
    }

    // Fallback - show help
    const helpEntry = KNOWLEDGE.find((k) => k.triggers.includes("help"));
    return {
      role: "ai",
      text: "I'm not sure about that, but here are some things I can help with:",
      actions: helpEntry ? helpEntry.responses[0].actions : [],
    };
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed, actions: [] }]);
    setLoading(true);
    const response = await processMessage(trimmed);
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  }, [input, loading, processMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      <style>{`
        .aai-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #7a8c6e;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .aai-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(0,0,0,0.2);
        }
        .aai-fab-label {
          position: fixed;
          bottom: 32px;
          right: 88px;
          background: white;
          color: #2a2723;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .aai-fab:hover + .aai-fab-label {
          opacity: 1;
        }
        .aai-panel {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.15);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: aai-slide-up 0.3s ease-out;
        }
        @keyframes aai-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #7a8c6e;
          color: white;
        }
        .aai-header-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 400;
        }
        .aai-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .aai-close:hover { opacity: 1; }
        .aai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .aai-messages::-webkit-scrollbar {
          width: 4px;
        }
        .aai-messages::-webkit-scrollbar-thumb {
          background: #d4cfc7;
          border-radius: 2px;
        }
        .aai-msg {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }
        .aai-msg-user {
          align-self: flex-end;
          background: #7a8c6e;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .aai-msg-ai {
          align-self: flex-start;
          background: #faf8f4;
          color: #2a2723;
          border-bottom-left-radius: 4px;
        }
        .aai-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .aai-action-btn {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid #7a8c6e;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #7a8c6e;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .aai-action-btn:hover {
          background: #7a8c6e;
          color: white;
        }
        .aai-loading {
          align-self: flex-start;
          padding: 10px 14px;
          font-size: 14px;
          color: #6b6560;
          font-family: 'DM Sans', sans-serif;
        }
        .aai-loading-dots::after {
          content: '';
          animation: aai-dots 1.2s steps(4, end) infinite;
        }
        @keyframes aai-dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
        .aai-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #e8e0d4;
          background: white;
        }
        .aai-input {
          flex: 1;
          border: 1px solid #e8e0d4;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          color: #2a2723;
          background: #faf8f4;
          transition: border-color 0.2s;
        }
        .aai-input::placeholder { color: #b5afa7; }
        .aai-input:focus { border-color: #7a8c6e; }
        .aai-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #7a8c6e;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .aai-send:hover { background: #6a7c5e; }
        .aai-send:disabled { background: #c4c0b8; cursor: default; }
        @media (max-width: 480px) {
          .aai-panel {
            width: calc(100vw - 16px);
            height: calc(100vh - 80px);
            bottom: 8px;
            right: 8px;
            border-radius: 12px;
          }
          .aai-fab { bottom: 16px; right: 16px; }
        }
      `}</style>

      {!open && (
        <>
          <button className="aai-fab" onClick={() => setOpen(true)} aria-label="Open RoRo AI assistant">
            &#10024;
          </button>
          <span className="aai-fab-label">Ask RoRo AI</span>
        </>
      )}

      {open && (
        <div className="aai-panel">
          <div className="aai-header">
            <span className="aai-header-title">RoRo AI</span>
            <button className="aai-close" onClick={() => setOpen(false)} aria-label="Close">
              &#10005;
            </button>
          </div>

          <div className="aai-messages">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`aai-msg ${msg.role === "user" ? "aai-msg-user" : "aai-msg-ai"}`}>
                  {msg.text}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="aai-actions">
                      {msg.actions.map((a, j) => (
                        <button key={j} className="aai-action-btn" onClick={() => handleAction(a)}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="aai-loading">
                <span className="aai-loading-dots">Thinking</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="aai-input-row">
            <input
              ref={inputRef}
              className="aai-input"
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="aai-send" onClick={handleSend} disabled={!input.trim() || loading} aria-label="Send">
              &#8593;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
