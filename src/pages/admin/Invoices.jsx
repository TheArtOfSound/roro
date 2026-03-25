import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";

const FILTERS = ["all", "draft", "sent", "paid", "overdue", "cancelled"];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadInvoices(); }, []);

  async function loadInvoices() {
    const { data } = await supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false });
    setInvoices(data || []);
  }

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  const totalUnpaid = invoices.filter((i) => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount_cents, 0);

  return (
    <>
      <style>{`
        .inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .inv-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .inv-new-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer; text-decoration: none;
          display: inline-block;
        }
        .inv-new-btn:hover { background: #7a8c6e; }
        .inv-summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .inv-summary-item { font-size: 14px; color: #6b6560; }
        .inv-summary-item strong { color: #1a1a1a; }
        .inv-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .inv-filter {
          padding: 8px 16px; border: 1px solid #e8e0d4; background: white;
          font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1px;
          text-transform: uppercase; cursor: pointer; color: #6b6560; transition: all 0.2s;
        }
        .inv-filter:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .inv-filter.active { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .inv-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .inv-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .inv-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; }
        .inv-table tr:hover { background: #faf8f4; }
        .inv-table a { color: #7a8c6e; text-decoration: none; font-weight: 500; }
        .inv-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
      `}</style>

      <div className="inv-header">
        <h1 className="inv-title">Invoices</h1>
        <Link to="/admin/invoices/new" className="inv-new-btn">+ Create Invoice</Link>
      </div>

      <div className="inv-summary">
        <div className="inv-summary-item">Outstanding: <strong>${(totalUnpaid / 100).toFixed(2)}</strong></div>
        <div className="inv-summary-item">Total invoices: <strong>{invoices.length}</strong></div>
      </div>

      <div className="inv-filters">
        {FILTERS.map((f) => (
          <button key={f} className={`inv-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="inv-empty">No invoices {filter !== "all" ? `with status "${filter}"` : "yet"}.</div>
      ) : (
        <table className="inv-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td><Link to={`/admin/invoices/${inv.id}`}>{inv.invoice_number}</Link></td>
                <td>{inv.clients?.name || "—"}</td>
                <td>${(inv.amount_cents / 100).toFixed(2)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
