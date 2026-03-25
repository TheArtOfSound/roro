import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data } = await supabase.from("invoices").select("*, clients(name, email)").eq("id", id).single();
    setInvoice(data);
  }

  async function updateStatus(status) {
    const updates = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    await supabase.from("invoices").update(updates).eq("id", id);
    setInvoice((i) => ({ ...i, ...updates }));
    setToast({ message: `Invoice marked as ${status}!`, type: "success" });
  }

  function copyPaymentLink() {
    navigator.clipboard.writeText(invoice.stripe_payment_url);
    setToast({ message: "Payment link copied!", type: "success" });
  }

  if (!invoice) return <div style={{ padding: 40, textAlign: "center", color: "#6b6560" }}>Loading...</div>;

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];

  return (
    <>
      <style>{`
        .invd-card { background: white; border: 1px solid #e8e0d4; padding: 40px; max-width: 700px; }
        .invd-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px; }
        .invd-number { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; }
        .invd-meta { font-size: 13px; color: #6b6560; margin-top: 4px; }
        .invd-client { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e8e0d4; }
        .invd-client-name { font-size: 16px; font-weight: 500; color: #1a1a1a; }
        .invd-client-email { font-size: 14px; color: #6b6560; }
        .invd-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .invd-table th {
          text-align: left; padding: 10px 0; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4;
        }
        .invd-table td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #f5f0e8; }
        .invd-table .right { text-align: right; }
        .invd-total {
          text-align: right; font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px; padding: 20px 0; border-top: 2px solid #1a1a1a;
        }
        .invd-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
        .invd-btn {
          padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: 1px solid #e8e0d4;
          background: white; color: #2a2723; transition: all 0.2s;
        }
        .invd-btn:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .invd-btn.primary { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .invd-btn.primary:hover { background: #7a8c6e; border-color: #7a8c6e; }
        .invd-btn.paid { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .invd-payment-link {
          margin-top: 20px; padding: 16px; background: #faf8f4; border: 1px solid #e8e0d4;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .invd-payment-url {
          font-size: 13px; color: #7a8c6e; word-break: break-all; flex: 1;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/invoices" style={{ fontSize: 13, color: "#7a8c6e", textDecoration: "none" }}>&larr; All Invoices</Link>
      </div>

      <div className="invd-card">
        <div className="invd-header">
          <div>
            <div className="invd-number">{invoice.invoice_number}</div>
            <div className="invd-meta">
              Created {new Date(invoice.created_at).toLocaleDateString()}
              {invoice.due_date && <> &middot; Due {new Date(invoice.due_date).toLocaleDateString()}</>}
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="invd-client">
          {invoice.clients ? (
            <>
              <div className="invd-client-name">{invoice.clients.name}</div>
              <div className="invd-client-email">{invoice.clients.email}</div>
            </>
          ) : <div style={{ color: "#6b6560" }}>No client linked</div>}
        </div>

        {invoice.description && (
          <div style={{ fontSize: 15, color: "#2a2723", marginBottom: 24, lineHeight: 1.6 }}>{invoice.description}</div>
        )}

        {lineItems.length > 0 && (
          <table className="invd-table">
            <thead><tr><th>Description</th><th className="right">Qty</th><th className="right">Price</th><th className="right">Total</th></tr></thead>
            <tbody>
              {lineItems.map((l, i) => (
                <tr key={i}>
                  <td>{l.desc}</td>
                  <td className="right">{l.qty}</td>
                  <td className="right">${((l.unit_price_cents || 0) / 100).toFixed(2)}</td>
                  <td className="right">${((l.qty || 0) * (l.unit_price_cents || 0) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="invd-total">
          Total: ${(invoice.amount_cents / 100).toFixed(2)}
        </div>

        {invoice.stripe_payment_url && (
          <div className="invd-payment-link">
            <div className="invd-payment-url">{invoice.stripe_payment_url}</div>
            <button className="invd-btn" onClick={copyPaymentLink}>Copy Link</button>
          </div>
        )}

        {invoice.paid_at && (
          <div style={{ fontSize: 14, color: "#065f46", marginTop: 16 }}>
            Paid on {new Date(invoice.paid_at).toLocaleString()}
          </div>
        )}

        <div className="invd-actions">
          {invoice.status === "draft" && <button className="invd-btn primary" onClick={() => updateStatus("sent")}>Mark as Sent</button>}
          {["sent", "overdue"].includes(invoice.status) && <button className="invd-btn paid" onClick={() => updateStatus("paid")}>Mark as Paid</button>}
          {invoice.status === "sent" && <button className="invd-btn" onClick={() => updateStatus("overdue")}>Mark Overdue</button>}
          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <button className="invd-btn" onClick={() => updateStatus("cancelled")}>Cancel</button>
          )}
        </div>
      </div>
    </>
  );
}
