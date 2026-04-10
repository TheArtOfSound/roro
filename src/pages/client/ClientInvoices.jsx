import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import StatusBadge from "../../components/ui/StatusBadge";

export default function ClientInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadInvoices();
  }, [user]);

  async function loadInvoices() {
    const { data: clientData } = await supabase
      .from("clients")
      .select("id")
      .eq("email", user.email)
      .single();

    if (clientData) {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false });
      setInvoices(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#6b6560", fontFamily: "'DM Sans', sans-serif" }}>
        Loading invoices...
      </div>
    );
  }

  const totalOutstanding = invoices
    .filter((i) => ["sent", "overdue"].includes(i.status))
    .reduce((s, i) => s + i.amount_cents, 0);

  return (
    <>
      <style>{`
        .ci-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .ci-summary {
          font-size: 14px;
          color: #6b6560;
          margin-bottom: 28px;
        }
        .ci-summary strong { color: #1a1a1a; }
        .ci-table {
          width: 100%;
          background: white;
          border: 1px solid #e8e0d4;
          border-collapse: collapse;
        }
        .ci-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6b6560;
          border-bottom: 1px solid #e8e0d4;
          font-weight: 500;
        }
        .ci-table td {
          padding: 14px 16px;
          font-size: 14px;
          border-bottom: 1px solid #f5f0e8;
          color: #2a2723;
        }
        .ci-table tr:last-child td { border-bottom: none; }
        .ci-pay-btn {
          display: inline-block;
          padding: 6px 16px;
          background: #7a8c6e;
          color: white;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ci-pay-btn:hover { background: #6b7d60; }
        .ci-empty {
          padding: 60px;
          text-align: center;
          color: #6b6560;
          background: white;
          border: 1px solid #e8e0d4;
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .ci-table { font-size: 13px; }
          .ci-table th, .ci-table td { padding: 10px 12px; }
        }
      `}</style>

      <h1 className="ci-title">Invoices</h1>
      <div className="ci-summary">
        {totalOutstanding > 0
          ? <>Outstanding balance: <strong>${(totalOutstanding / 100).toFixed(2)}</strong></>
          : "All invoices are up to date."
        }
      </div>

      {invoices.length === 0 ? (
        <div className="ci-empty">No invoices yet. They will appear here once your project begins.</div>
      ) : (
        <table className="ci-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 500 }}>{inv.invoice_number}</td>
                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                <td>${(inv.amount_cents / 100).toFixed(2)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td>
                  {inv.stripe_payment_url && ["sent", "overdue"].includes(inv.status) && (
                    <a
                      href={inv.stripe_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ci-pay-btn"
                    >
                      Pay Now
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
