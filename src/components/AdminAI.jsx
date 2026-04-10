import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are RoRo AI, the personal business assistant for Aurora Leonard, founder of RoRo Mode — a professional home styling and organizing business in the Greater Phoenix, Arizona area.

## About Aurora & RoRo Mode
- Aurora goes by "RoRo". She's a home stylist, professional organizer, and sustainable design enthusiast.
- Services: Home Resets ($375+), Closet Transformations ($250+), Pantry Organization ($250+), Sustainable Styling ($150+), Virtual Consultations ($75-$225)
- Website: roromode.com
- Email: itsroromode@gmail.com
- AI Phone: (662) 479-4007
- Instagram: @_roro_mode_
- Location: Greater Phoenix, Arizona
- Hours: Mon-Fri 9AM-5PM, Sat 10AM-3PM

## Your Admin Panel Navigation
When Aurora asks how to do something, give her step-by-step instructions AND include a deep link she can click. Use this format for links: [link:/admin/path|Button Label]

Available pages:
- [link:/admin|Dashboard] — Overview stats, recent activity
- [link:/admin/bookings|Bookings] — Create, manage, accept/decline/schedule jobs
- [link:/admin/clients|Clients] — Client database, add/edit contacts
- [link:/admin/invoices|Invoices] — View all invoices
- [link:/admin/invoices/new|Create Invoice] — New invoice with line items
- [link:/admin/messages|Messages] — Contact form inbox, reply to clients
- [link:/admin/gift-cards|Gift Cards] — Create & manage gift cards
- [link:/admin/referrals|Referrals] — Generate referral codes
- [link:/admin/ai-tasks|Tasks] — Follow-up tasks, client outreach
- [link:/admin/settings|Settings] — Edit services, pricing, promo codes
- [link:external:https://ionos.ai-voice-receptionist.com/customer/C_IO_O9Z8NGHE/sessions|AI Call Logs] — View phone/text session history

## How to respond
- Be warm, friendly, and supportive — like a smart business partner
- Keep responses concise (2-4 sentences max) unless Aurora asks for detail
- Always include relevant deep links when mentioning a page or action
- If Aurora asks about data (counts, amounts), say you'll check and suggest she look at the relevant page
- If she asks something outside your scope, be honest and helpful
- Use her name occasionally — she's Aurora or RoRo
- Never be generic. Always be specific to HER business.`;

function parseResponse(text) {
  const parts = [];
  const actions = [];
  const linkRegex = /\[link:(external:)?(.*?)\|(.*?)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const isExternal = !!match[1];
    const link = match[2];
    const label = match[3];
    actions.push({ label, link, external: isExternal });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return { cleanText: parts.join("").trim(), actions };
}

const GREETING = "Hey Aurora! 👋 I'm your RoRo Mode assistant — powered by AI so I can actually have a real conversation with you. Ask me anything about your business, how to do something, or just tell me what you need. I'm here for you!";

export default function AdminAI() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState([{ role: "ai", text: GREETING, actions: [] }]);
  const [chatHistory, setChatHistory] = useState([{ role: "system", content: SYSTEM_PROMPT }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Hide tooltip after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 15000);
    return () => clearTimeout(t);
  }, []);

  const handleAction = useCallback((action) => {
    if (action.external) {
      window.open(action.link, "_blank");
    } else {
      navigate(action.link);
      setOpen(false);
    }
  }, [navigate]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed, actions: [] }]);
    setLoading(true);

    const newHistory = [...chatHistory, { role: "user", content: trimmed }];

    try {
      // Always include system prompt + last 8 conversation messages
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...newHistory.filter(m => m.role !== "system").slice(-8),
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Groq API error:", res.status, errText);
        throw new Error("API error: " + res.status);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Hmm, I didn't get a response. Try asking again!";
      const { cleanText, actions } = parseResponse(reply);

      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((prev) => [...prev, { role: "ai", text: cleanText, actions }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "ai",
        text: "I'm having trouble connecting right now. Try asking again in a moment!",
        actions: [
          { label: "📊 Dashboard", link: "/admin" },
          { label: "⚙️ Settings", link: "/admin/settings" },
        ],
      }]);
    }

    setLoading(false);
  }, [input, loading, chatHistory]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <>
      <style>{`
        .aai-fab {
          position: fixed; bottom: 24px; right: 24px;
          width: 56px; height: 56px; border-radius: 50%;
          background: #7a8c6e; color: white; border: none; cursor: pointer;
          font-size: 22px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1000;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .aai-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.2); }
        .aai-tooltip {
          position: fixed; bottom: 88px; right: 24px;
          background: #1a1a1a; color: white;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 10px 16px; border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 1000;
          max-width: 200px; text-align: center; line-height: 1.4;
          animation: aai-bounce 2s ease-in-out infinite;
        }
        .aai-tooltip::after {
          content: ''; position: absolute; bottom: -6px; right: 20px;
          width: 12px; height: 12px; background: #1a1a1a;
          transform: rotate(45deg);
        }
        @keyframes aai-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .aai-panel {
          position: fixed; bottom: 24px; right: 24px;
          width: 400px; height: 600px; background: white;
          border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.15);
          z-index: 1001; display: flex; flex-direction: column;
          overflow: hidden; animation: aai-slide-up 0.3s ease-out;
        }
        @keyframes aai-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aai-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; background: #7a8c6e; color: white;
        }
        .aai-header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 400; }
        .aai-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.8; }
        .aai-close:hover { opacity: 1; }
        .aai-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .aai-messages::-webkit-scrollbar { width: 4px; }
        .aai-messages::-webkit-scrollbar-thumb { background: #d4cfc7; border-radius: 2px; }
        .aai-msg {
          max-width: 85%; padding: 10px 14px; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6;
          white-space: pre-wrap;
        }
        .aai-msg-user { align-self: flex-end; background: #7a8c6e; color: white; border-bottom-right-radius: 4px; }
        .aai-msg-ai { align-self: flex-start; background: #faf8f4; color: #2a2723; border-bottom-left-radius: 4px; }
        .aai-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .aai-action-btn {
          display: inline-block; padding: 6px 12px;
          border: 1px solid #7a8c6e; border-radius: 20px;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: #7a8c6e; background: white; cursor: pointer;
          transition: all 0.2s; text-align: left;
        }
        .aai-action-btn:hover { background: #7a8c6e; color: white; }
        .aai-loading { align-self: flex-start; padding: 10px 14px; font-size: 14px; color: #6b6560; font-family: 'DM Sans', sans-serif; }
        .aai-loading-dots::after { content: ''; animation: aai-dots 1.2s steps(4, end) infinite; }
        @keyframes aai-dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
        .aai-input-row { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid #e8e0d4; }
        .aai-input {
          flex: 1; border: 1px solid #e8e0d4; border-radius: 8px;
          padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; color: #2a2723; background: #faf8f4;
        }
        .aai-input::placeholder { color: #b5afa7; }
        .aai-input:focus { border-color: #7a8c6e; }
        .aai-send {
          width: 38px; height: 38px; border-radius: 50%;
          background: #7a8c6e; color: white; border: none; cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .aai-send:hover { background: #6a7c5e; }
        .aai-send:disabled { background: #c4c0b8; cursor: default; }
        @media (max-width: 480px) {
          .aai-panel { width: calc(100vw - 16px); height: calc(100vh - 80px); bottom: 8px; right: 8px; border-radius: 12px; }
          .aai-fab { bottom: 16px; right: 16px; width: 48px; height: 48px; font-size: 18px; }
          .aai-tooltip { bottom: 72px; right: 16px; }
        }
      `}</style>

      {!open && (
        <>
          {showTooltip && (
            <div className="aai-tooltip">
              Need help, Aurora? I'm right here! ✨
            </div>
          )}
          <button className="aai-fab" onClick={() => { setOpen(true); setShowTooltip(false); }} aria-label="Open RoRo AI assistant">
            &#10024;
          </button>
        </>
      )}

      {open && (
        <div className="aai-panel">
          <div className="aai-header">
            <span className="aai-header-title">RoRo AI</span>
            <button className="aai-close" onClick={() => setOpen(false)} aria-label="Close">&#10005;</button>
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
            {loading && <div className="aai-loading"><span className="aai-loading-dots">Thinking</span></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="aai-input-row">
            <input ref={inputRef} className="aai-input" type="text" placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button className="aai-send" onClick={handleSend} disabled={!input.trim() || loading} aria-label="Send">&#8593;</button>
          </div>
        </div>
      )}
    </>
  );
}
