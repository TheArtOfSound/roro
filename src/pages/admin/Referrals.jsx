import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return `RORO-${result}`;
}

function fmt(cents) {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function Referrals() {
  const [codes, setCodes] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [newCode, setNewCode] = useState({
    client_id: "",
    code: generateCode(),
    credit_amount_cents: 10000,
    new_client_discount_cents: 5000,
    max_uses: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [codesRes, clientsRes, redemptionsRes] = await Promise.all([
      supabase.from("referral_codes").select("*, clients(name, email)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name, email").order("name"),
      supabase.from("referral_redemptions").select("*, referral_codes(code, clients(name)), referred_client:clients!referral_redemptions_referred_client_id_fkey(name, email)").order("created_at", { ascending: false }),
    ]);
    setCodes(codesRes.data || []);
    setClients(clientsRes.data || []);
    setRedemptions(redemptionsRes.data || []);
  }

  async function createCode(e) {
    e.preventDefault();
    if (!newCode.client_id) {
      setToast({ message: "Please select a client", type: "error" });
      return;
    }
    const { error } = await supabase.from("referral_codes").insert({
      client_id: newCode.client_id,
      code: newCode.code,
      credit_amount_cents: newCode.credit_amount_cents,
      new_client_discount_cents: newCode.new_client_discount_cents,
      max_uses: newCode.max_uses,
    });
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Referral code created!", type: "success" });
    setNewCode({ client_id: "", code: generateCode(), credit_amount_cents: 10000, new_client_discount_cents: 5000, max_uses: 10 });
    setShowAdd(false);
    loadData();
  }

  async function toggleActive(id, currentState) {
    const { error } = await supabase.from("referral_codes").update({ is_active: !currentState }).eq("id", id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    loadData();
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setToast({ message: `Copied: ${code}`, type: "success" });
  }

  return (
    <>
      <style>{`
        .ref-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .ref-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .ref-count { font-size: 14px; color: #6b6560; margin-left: 12px; font-weight: 400; font-family: 'DM Sans', sans-serif; }
        .ref-add-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .ref-add-btn:hover { background: #7a8c6e; }
        .ref-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .ref-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .ref-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; }
        .ref-table tr:hover { background: #faf8f4; }
        .ref-code {
          font-family: monospace; font-size: 14px; font-weight: 600; color: #7a8c6e;
          cursor: pointer; padding: 4px 8px; background: #f5f0e8; border: none;
          letter-spacing: 1px;
        }
        .ref-code:hover { background: #e8e0d4; }
        .ref-badge {
          display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .ref-badge-active { background: #e8f5e2; color: #3d7a2d; }
        .ref-badge-inactive { background: #f5e8e8; color: #7a2d2d; }
        .ref-toggle {
          background: none; border: 1px solid #e8e0d4; padding: 4px 12px; font-size: 11px;
          font-family: 'DM Sans', sans-serif; cursor: pointer; color: #6b6560;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .ref-toggle:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .ref-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .ref-modal {
          background: white; border: 1px solid #e8e0d4; padding: 32px; width: 100%; max-width: 480px;
        }
        .ref-modal h3 {
          font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; margin-bottom: 24px;
        }
        .ref-modal-field { margin-bottom: 16px; }
        .ref-modal-field label {
          display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #6b6560; margin-bottom: 6px;
        }
        .ref-modal-field input, .ref-modal-field select {
          width: 100%; padding: 12px 14px; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; background: white;
        }
        .ref-modal-field input:focus, .ref-modal-field select:focus { border-color: #7a8c6e; }
        .ref-modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .ref-section-title {
          font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400;
          color: #1a1a1a; margin: 48px 0 20px;
        }
        .ref-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
        .ref-row-amounts { font-size: 12px; color: #6b6560; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ref-header">
        <h1 className="ref-title">
          Referral Program
          <span className="ref-count">{codes.length} code{codes.length !== 1 ? "s" : ""}</span>
        </h1>
        <button className="ref-add-btn" onClick={() => setShowAdd(true)}>+ Generate Code</button>
      </div>

      {codes.length === 0 ? (
        <div className="ref-empty">No referral codes yet. Generate one to get started.</div>
      ) : (
        <table className="ref-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Code</th>
              <th>Uses</th>
              <th>Credit / Discount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}>
                <td>{c.clients?.name || "—"}</td>
                <td>
                  <button className="ref-code" onClick={() => copyCode(c.code)} title="Click to copy">
                    {c.code}
                  </button>
                </td>
                <td>{c.uses} / {c.max_uses}</td>
                <td className="ref-row-amounts">
                  {fmt(c.credit_amount_cents)} referrer &middot; {fmt(c.new_client_discount_cents)} new client
                </td>
                <td>
                  <span className={`ref-badge ${c.is_active ? "ref-badge-active" : "ref-badge-inactive"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="ref-toggle" onClick={() => toggleActive(c.id, c.is_active)}>
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="ref-section-title">Redemption History</h2>
      {redemptions.length === 0 ? (
        <div className="ref-empty">No redemptions yet.</div>
      ) : (
        <table className="ref-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Code</th>
              <th>Referrer</th>
              <th>New Client</th>
              <th>Credit Applied</th>
              <th>Discount Applied</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><span className="ref-code" style={{ cursor: "default" }}>{r.referral_codes?.code}</span></td>
                <td>{r.referral_codes?.clients?.name || "—"}</td>
                <td>{r.referred_client?.name || "—"}</td>
                <td>{r.referrer_credit_applied ? "Yes" : "No"}</td>
                <td>{r.new_client_discount_applied ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <div className="ref-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="ref-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Generate Referral Code</h3>
            <form onSubmit={createCode}>
              <div className="ref-modal-field">
                <label>Client</label>
                <select required value={newCode.client_id} onChange={(e) => setNewCode({ ...newCode, client_id: e.target.value })}>
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="ref-modal-field">
                <label>Referral Code</label>
                <input value={newCode.code} onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="ref-modal-field">
                <label>Referrer Credit ($)</label>
                <input type="number" min="0" step="1" value={newCode.credit_amount_cents / 100}
                  onChange={(e) => setNewCode({ ...newCode, credit_amount_cents: Math.round(e.target.value * 100) })} />
              </div>
              <div className="ref-modal-field">
                <label>New Client Discount ($)</label>
                <input type="number" min="0" step="1" value={newCode.new_client_discount_cents / 100}
                  onChange={(e) => setNewCode({ ...newCode, new_client_discount_cents: Math.round(e.target.value * 100) })} />
              </div>
              <div className="ref-modal-field">
                <label>Max Uses</label>
                <input type="number" min="1" value={newCode.max_uses}
                  onChange={(e) => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="ref-modal-actions">
                <button type="submit" className="ref-add-btn">Create Code</button>
                <button type="button" className="ref-add-btn" style={{ background: "transparent", color: "#6b6560", border: "1px solid #e8e0d4" }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
