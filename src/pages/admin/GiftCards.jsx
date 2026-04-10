import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

function generateGiftCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return `RORO-GIFT-${result}`;
}

function fmt(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const PRESET_AMOUNTS = [10000, 25000, 50000]; // $100, $250, $500

export default function GiftCards() {
  const [cards, setCards] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [newCard, setNewCard] = useState({
    code: generateGiftCode(),
    amount_cents: 10000,
    custom_amount: "",
    use_custom: false,
    purchaser_name: "",
    purchaser_email: "",
    recipient_name: "",
    recipient_email: "",
    personal_message: "",
  });

  useEffect(() => { loadCards(); }, []);

  async function loadCards() {
    const { data } = await supabase.from("gift_cards").select("*").order("created_at", { ascending: false });
    setCards(data || []);
  }

  const totalOutstanding = cards.filter((c) => c.is_active && c.balance_cents > 0).reduce((sum, c) => sum + c.balance_cents, 0);

  async function createCard(e) {
    e.preventDefault();
    const amount = newCard.use_custom ? Math.round(parseFloat(newCard.custom_amount) * 100) : newCard.amount_cents;
    if (!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    const { error } = await supabase.from("gift_cards").insert({
      code: newCard.code,
      amount_cents: amount,
      balance_cents: amount,
      purchaser_name: newCard.purchaser_name,
      purchaser_email: newCard.purchaser_email,
      recipient_name: newCard.recipient_name,
      recipient_email: newCard.recipient_email,
      personal_message: newCard.personal_message,
    });
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Gift card created!", type: "success" });
    setNewCard({
      code: generateGiftCode(), amount_cents: 10000, custom_amount: "", use_custom: false,
      purchaser_name: "", purchaser_email: "", recipient_name: "", recipient_email: "", personal_message: "",
    });
    setShowAdd(false);
    loadCards();
  }

  async function markRedeemed(card) {
    const { error } = await supabase.from("gift_cards").update({
      balance_cents: 0, is_active: false, redeemed_at: new Date().toISOString(),
    }).eq("id", card.id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Gift card marked as redeemed", type: "success" });
    setShowDetail(null);
    loadCards();
  }

  async function toggleActive(card) {
    const { error } = await supabase.from("gift_cards").update({ is_active: !card.is_active }).eq("id", card.id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    loadCards();
  }

  return (
    <>
      <style>{`
        .gc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .gc-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .gc-stat { font-size: 14px; color: #6b6560; margin-left: 12px; font-weight: 400; font-family: 'DM Sans', sans-serif; }
        .gc-add-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .gc-add-btn:hover { background: #7a8c6e; }
        .gc-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .gc-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .gc-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; }
        .gc-table tr:hover { background: #faf8f4; cursor: pointer; }
        .gc-code {
          font-family: monospace; font-size: 13px; font-weight: 600; color: #7a8c6e;
          letter-spacing: 1px;
        }
        .gc-badge {
          display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .gc-badge-active { background: #e8f5e2; color: #3d7a2d; }
        .gc-badge-redeemed { background: #e8e0d4; color: #6b6560; }
        .gc-badge-inactive { background: #f5e8e8; color: #7a2d2d; }
        .gc-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .gc-modal {
          background: white; border: 1px solid #e8e0d4; padding: 32px; width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
        }
        .gc-modal h3 {
          font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; margin-bottom: 24px;
        }
        .gc-modal-field { margin-bottom: 16px; }
        .gc-modal-field label {
          display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #6b6560; margin-bottom: 6px;
        }
        .gc-modal-field input, .gc-modal-field textarea {
          width: 100%; padding: 12px 14px; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; background: white;
        }
        .gc-modal-field textarea { min-height: 80px; resize: vertical; }
        .gc-modal-field input:focus, .gc-modal-field textarea:focus { border-color: #7a8c6e; }
        .gc-modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .gc-amount-options { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .gc-amount-opt {
          padding: 10px 20px; border: 1px solid #e8e0d4; background: white; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #2a2723;
          transition: all 0.2s;
        }
        .gc-amount-opt:hover { border-color: #7a8c6e; }
        .gc-amount-opt.selected { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .gc-detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f0e8; }
        .gc-detail-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b6560; }
        .gc-detail-value { font-size: 14px; color: #2a2723; font-weight: 500; }
        .gc-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
        .gc-danger-btn {
          padding: 8px 16px; background: transparent; color: #dc2626; border: 1px solid #dc2626;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .gc-danger-btn:hover { background: #dc2626; color: white; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="gc-header">
        <h1 className="gc-title">
          Gift Cards
          <span className="gc-stat">{fmt(totalOutstanding)} outstanding</span>
        </h1>
        <button className="gc-add-btn" onClick={() => setShowAdd(true)}>+ Create Gift Card</button>
      </div>

      {cards.length === 0 ? (
        <div className="gc-empty">No gift cards yet. Create one to get started.</div>
      ) : (
        <table className="gc-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Purchaser</th>
              <th>Recipient</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id} onClick={() => setShowDetail(c)}>
                <td><span className="gc-code">{c.code}</span></td>
                <td>{fmt(c.amount_cents)}</td>
                <td>{fmt(c.balance_cents)}</td>
                <td>{c.purchaser_name || "—"}</td>
                <td>{c.recipient_name || "—"}</td>
                <td>
                  <span className={`gc-badge ${c.redeemed_at ? "gc-badge-redeemed" : c.is_active ? "gc-badge-active" : "gc-badge-inactive"}`}>
                    {c.redeemed_at ? "Redeemed" : c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Gift Card Modal */}
      {showAdd && (
        <div className="gc-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Gift Card</h3>
            <form onSubmit={createCard}>
              <div className="gc-modal-field">
                <label>Amount</label>
                <div className="gc-amount-options">
                  {PRESET_AMOUNTS.map((a) => (
                    <button type="button" key={a}
                      className={`gc-amount-opt ${!newCard.use_custom && newCard.amount_cents === a ? "selected" : ""}`}
                      onClick={() => setNewCard({ ...newCard, amount_cents: a, use_custom: false })}
                    >
                      {fmt(a)}
                    </button>
                  ))}
                  <button type="button"
                    className={`gc-amount-opt ${newCard.use_custom ? "selected" : ""}`}
                    onClick={() => setNewCard({ ...newCard, use_custom: true })}
                  >
                    Custom
                  </button>
                </div>
                {newCard.use_custom && (
                  <input type="number" min="1" step="0.01" placeholder="Enter amount ($)"
                    value={newCard.custom_amount}
                    onChange={(e) => setNewCard({ ...newCard, custom_amount: e.target.value })} />
                )}
              </div>
              <div className="gc-modal-field">
                <label>Gift Card Code</label>
                <input value={newCard.code} onChange={(e) => setNewCard({ ...newCard, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="gc-modal-field">
                <label>Purchaser Name</label>
                <input value={newCard.purchaser_name} onChange={(e) => setNewCard({ ...newCard, purchaser_name: e.target.value })} />
              </div>
              <div className="gc-modal-field">
                <label>Purchaser Email</label>
                <input type="email" value={newCard.purchaser_email} onChange={(e) => setNewCard({ ...newCard, purchaser_email: e.target.value })} />
              </div>
              <div className="gc-modal-field">
                <label>Recipient Name</label>
                <input value={newCard.recipient_name} onChange={(e) => setNewCard({ ...newCard, recipient_name: e.target.value })} />
              </div>
              <div className="gc-modal-field">
                <label>Recipient Email</label>
                <input type="email" value={newCard.recipient_email} onChange={(e) => setNewCard({ ...newCard, recipient_email: e.target.value })} />
              </div>
              <div className="gc-modal-field">
                <label>Personal Message</label>
                <textarea value={newCard.personal_message} onChange={(e) => setNewCard({ ...newCard, personal_message: e.target.value })}
                  placeholder="Add a personal message for the recipient..." />
              </div>
              <div className="gc-modal-actions">
                <button type="submit" className="gc-add-btn">Create Gift Card</button>
                <button type="button" className="gc-add-btn" style={{ background: "transparent", color: "#6b6560", border: "1px solid #e8e0d4" }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="gc-modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Gift Card Details</h3>
            <div className="gc-detail-row"><span className="gc-detail-label">Code</span><span className="gc-detail-value gc-code">{showDetail.code}</span></div>
            <div className="gc-detail-row"><span className="gc-detail-label">Amount</span><span className="gc-detail-value">{fmt(showDetail.amount_cents)}</span></div>
            <div className="gc-detail-row"><span className="gc-detail-label">Balance</span><span className="gc-detail-value">{fmt(showDetail.balance_cents)}</span></div>
            <div className="gc-detail-row"><span className="gc-detail-label">Purchaser</span><span className="gc-detail-value">{showDetail.purchaser_name || "—"} {showDetail.purchaser_email ? `(${showDetail.purchaser_email})` : ""}</span></div>
            <div className="gc-detail-row"><span className="gc-detail-label">Recipient</span><span className="gc-detail-value">{showDetail.recipient_name || "—"} {showDetail.recipient_email ? `(${showDetail.recipient_email})` : ""}</span></div>
            {showDetail.personal_message && (
              <div className="gc-detail-row"><span className="gc-detail-label">Message</span><span className="gc-detail-value">{showDetail.personal_message}</span></div>
            )}
            <div className="gc-detail-row"><span className="gc-detail-label">Status</span><span className="gc-detail-value">{showDetail.redeemed_at ? "Redeemed" : showDetail.is_active ? "Active" : "Inactive"}</span></div>
            <div className="gc-detail-row"><span className="gc-detail-label">Purchased</span><span className="gc-detail-value">{new Date(showDetail.purchased_at).toLocaleDateString()}</span></div>
            {showDetail.redeemed_at && (
              <div className="gc-detail-row"><span className="gc-detail-label">Redeemed</span><span className="gc-detail-value">{new Date(showDetail.redeemed_at).toLocaleDateString()}</span></div>
            )}
            <div className="gc-modal-actions" style={{ marginTop: 24 }}>
              {showDetail.is_active && showDetail.balance_cents > 0 && !showDetail.redeemed_at && (
                <button className="gc-danger-btn" onClick={() => markRedeemed(showDetail)}>Mark Fully Redeemed</button>
              )}
              <button className="gc-add-btn" style={{ background: "transparent", color: "#6b6560", border: "1px solid #e8e0d4" }}
                onClick={() => toggleActive(showDetail)}>
                {showDetail.is_active ? "Deactivate" : "Activate"}
              </button>
              <button className="gc-add-btn" style={{ background: "transparent", color: "#6b6560", border: "1px solid #e8e0d4" }}
                onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
