import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    client_id: searchParams.get("client") || "",
    booking_id: searchParams.get("booking") || "",
    description: "",
    due_date: "",
    stripe_payment_url: "",
    line_items: [{ desc: "", qty: 1, unit_price: "" }],
  });

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => setClients(data || []));
  }, []);

  function addLine() {
    setForm({ ...form, line_items: [...form.line_items, { desc: "", qty: 1, unit_price: "" }] });
  }

  function updateLine(i, field, value) {
    const items = [...form.line_items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, line_items: items });
  }

  function removeLine(i) {
    setForm({ ...form, line_items: form.line_items.filter((_, idx) => idx !== i) });
  }

  const total = form.line_items.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.unit_price) || 0), 0);

  async function handleSubmit(e, status = "draft") {
    e.preventDefault();

    // Generate invoice number
    const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true });
    const num = `RORO-2026-${String((count || 0) + 1).padStart(3, "0")}`;

    const lineItemsForDb = form.line_items.map((l) => ({
      desc: l.desc, qty: parseFloat(l.qty) || 0, unit_price_cents: Math.round((parseFloat(l.unit_price) || 0) * 100),
    }));

    const { data, error } = await supabase.from("invoices").insert({
      invoice_number: num,
      client_id: form.client_id || null,
      booking_id: form.booking_id || null,
      status,
      amount_cents: Math.round(total * 100),
      description: form.description,
      line_items: lineItemsForDb,
      due_date: form.due_date || null,
      stripe_payment_url: form.stripe_payment_url || null,
    }).select().single();

    if (error) { setToast({ message: error.message, type: "error" }); return; }
    navigate(`/admin/invoices/${data.id}`);
  }

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
        .ic-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; margin-bottom: 24px; }
        .ic-form { background: white; border: 1px solid #e8e0d4; padding: 32px; max-width: 800px; }
        .ic-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .ic-full { margin-bottom: 16px; }
        .ic-line-header { display: grid; grid-template-columns: 3fr 1fr 1fr 40px; gap: 12px; margin-bottom: 8px; }
        .ic-line-row { display: grid; grid-template-columns: 3fr 1fr 1fr 40px; gap: 12px; margin-bottom: 8px; align-items: center; }
        .ic-remove { background: none; border: none; color: #dc2626; cursor: pointer; font-size: 18px; padding: 4px; }
        .ic-add-line {
          background: none; border: 1px dashed #e8e0d4; padding: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #7a8c6e;
          cursor: pointer; width: 100%; margin-bottom: 20px;
        }
        .ic-add-line:hover { border-color: #7a8c6e; }
        .ic-total {
          text-align: right; font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px; margin-bottom: 24px; padding: 16px 0;
          border-top: 1px solid #e8e0d4;
        }
        .ic-actions { display: flex; gap: 12px; }
        .ic-btn {
          padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: none;
        }
        .ic-btn-primary { background: #1a1a1a; color: #f5f0e8; }
        .ic-btn-primary:hover { background: #7a8c6e; }
        .ic-btn-secondary { background: white; color: #2a2723; border: 1px solid #e8e0d4; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="ic-title">Create Invoice</h1>

      <form className="ic-form" onSubmit={(e) => handleSubmit(e, "draft")}>
        <div className="ic-row">
          <div>
            <label style={labelStyle}>Client</label>
            <select style={fieldStyle} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" style={fieldStyle} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </div>

        <div className="ic-full">
          <label style={labelStyle}>Description</label>
          <input style={fieldStyle} placeholder="e.g., Pantry Organization — Full Service"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ marginBottom: 8 }}><label style={labelStyle}>Line Items</label></div>
        <div className="ic-line-header">
          <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560" }}>Description</span>
          <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560" }}>Qty</span>
          <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6b6560" }}>Price ($)</span>
          <span />
        </div>
        {form.line_items.map((line, i) => (
          <div className="ic-line-row" key={i}>
            <input style={fieldStyle} placeholder="Service description" value={line.desc} onChange={(e) => updateLine(i, "desc", e.target.value)} />
            <input type="number" min="1" style={fieldStyle} value={line.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} />
            <input type="number" step="0.01" style={fieldStyle} placeholder="0.00" value={line.unit_price} onChange={(e) => updateLine(i, "unit_price", e.target.value)} />
            <button type="button" className="ic-remove" onClick={() => removeLine(i)}>&times;</button>
          </div>
        ))}
        <button type="button" className="ic-add-line" onClick={addLine}>+ Add Line Item</button>

        <div className="ic-total">Total: ${total.toFixed(2)}</div>

        <div className="ic-full">
          <label style={labelStyle}>Stripe Payment Link (optional)</label>
          <input style={fieldStyle} placeholder="https://buy.stripe.com/..."
            value={form.stripe_payment_url} onChange={(e) => setForm({ ...form, stripe_payment_url: e.target.value })} />
        </div>

        <div className="ic-actions">
          <button type="submit" className="ic-btn ic-btn-primary">Save as Draft</button>
          <button type="button" className="ic-btn ic-btn-primary" style={{ background: "#7a8c6e" }}
            onClick={(e) => handleSubmit(e, "sent")}>Save & Send</button>
          <button type="button" className="ic-btn ic-btn-secondary" onClick={() => navigate("/admin/invoices")}>Cancel</button>
        </div>
      </form>
    </>
  );
}
