import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

/*
  -- Run in Supabase:
  CREATE POLICY "Public can view invoices by direct link" ON invoices FOR SELECT TO anon USING (true);
  CREATE POLICY "Public can update invoice status to paid" ON invoices FOR UPDATE TO anon USING (true) WITH CHECK (status = 'paid');
*/

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("invoices")
      .select("*, clients(name, email)")
      .eq("id", id)
      .single();
    if (err || !data) {
      setError("Invoice not found.");
    } else {
      setInvoice(data);
    }
    setLoading(false);
  }

  async function markAsPaid() {
    setMarking(true);
    const { error: err } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (err) {
      setError("Could not update invoice. Please contact Aurora.");
    } else {
      setInvoice((i) => ({ ...i, status: "paid", paid_at: new Date().toISOString() }));
    }
    setMarking(false);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingText}>Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={styles.page}>
        <div style={styles.errorWrap}>
          <div style={styles.errorIcon}>!</div>
          <div style={styles.errorTitle}>Invoice Not Found</div>
          <div style={styles.errorDesc}>
            This invoice may have been removed or the link is incorrect. Please contact Aurora for assistance.
          </div>
        </div>
      </div>
    );
  }

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const total = (invoice.amount_cents / 100).toFixed(2);
  const isPaid = invoice.status === "paid";
  const canPay = ["sent", "overdue"].includes(invoice.status);

  const venmoUrl = `https://venmo.com/u/Aurora_Leonard?txn=pay&amount=${total}&note=Invoice-${invoice.invoice_number || ""}`;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
        .iv-page * { box-sizing: border-box; }
        .iv-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; letter-spacing: 0.5px; border: none; cursor: pointer;
          transition: all 0.2s; text-decoration: none; width: 100%;
        }
        .iv-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .iv-btn-venmo { background: #008CFF; color: white; }
        .iv-btn-zelle { background: #6D1ED4; color: white; }
        .iv-btn-cashapp { background: #00D632; color: white; }
        .iv-btn-other { background: white; color: #2a2723; border: 1px solid #e8e0d4; }
        .iv-btn-other:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .iv-btn-paid {
          background: #1a1a1a; color: #f5f0e8; padding: 16px 28px; font-size: 13px;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .iv-btn-paid:hover { background: #7a8c6e; }
        .iv-copy-btn {
          padding: 8px 16px; background: white; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
        }
        .iv-copy-btn:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .iv-table { width: 100%; border-collapse: collapse; }
        .iv-table th {
          text-align: left; padding: 10px 0; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
        }
        .iv-table td {
          padding: 14px 0; font-size: 14px; border-bottom: 1px solid #f0ebe3;
          font-family: 'DM Sans', sans-serif; color: #2a2723;
        }
        .iv-table .right { text-align: right; }
        @media (max-width: 600px) {
          .iv-card { padding: 24px 20px !important; }
          .iv-header { flex-direction: column !important; gap: 12px !important; }
          .iv-total { font-size: 24px !important; }
          .iv-pay-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="iv-page" style={styles.container}>
        {/* Logo & Branding */}
        <div style={styles.branding}>
          <img
            src={`${import.meta.env.BASE_URL}images/roro-logo.png`}
            alt="RoRo Mode"
            style={styles.logo}
          />
          <div style={styles.brandName}>RoRo Mode</div>
          <div style={styles.brandTagline}>Home Organization & Sustainable Styling</div>
        </div>

        {/* Invoice Card */}
        <div className="iv-card" style={styles.card}>
          {/* Header */}
          <div className="iv-header" style={styles.header}>
            <div>
              <div style={styles.invoiceLabel}>INVOICE</div>
              <div style={styles.invoiceNumber}>{invoice.invoice_number}</div>
              <div style={styles.meta}>
                Created {new Date(invoice.created_at).toLocaleDateString()}
                {invoice.due_date && (
                  <span> &middot; Due {new Date(invoice.due_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* Client Info */}
          {invoice.clients && (
            <div style={styles.clientSection}>
              <div style={styles.sectionLabel}>BILL TO</div>
              <div style={styles.clientName}>{invoice.clients.name}</div>
              {invoice.clients.email && (
                <div style={styles.clientEmail}>{invoice.clients.email}</div>
              )}
            </div>
          )}

          {/* Description */}
          {invoice.description && (
            <div style={styles.description}>{invoice.description}</div>
          )}

          {/* Line Items */}
          {lineItems.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <table className="iv-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="right">Qty</th>
                    <th className="right">Price</th>
                    <th className="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((l, i) => (
                    <tr key={i}>
                      <td>{l.desc}</td>
                      <td className="right">{l.qty}</td>
                      <td className="right">${((l.unit_price_cents || 0) / 100).toFixed(2)}</td>
                      <td className="right">
                        ${((l.qty || 0) * (l.unit_price_cents || 0) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div style={styles.totalSection}>
            <div className="iv-total" style={styles.totalAmount}>
              ${total}
            </div>
            <div style={styles.totalLabel}>Total Amount</div>
          </div>

          {/* Paid State */}
          {isPaid && (
            <div style={styles.paidBanner}>
              <div style={styles.paidCheck}>&#10003;</div>
              <div>
                <div style={styles.paidTitle}>Payment Received</div>
                {invoice.paid_at && (
                  <div style={styles.paidDate}>
                    Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Options */}
          {canPay && (
            <div style={styles.paySection}>
              <div style={styles.paySectionTitle}>Payment Options</div>

              <div className="iv-pay-grid" style={styles.payGrid}>
                {/* Venmo */}
                <a
                  href={venmoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="iv-btn iv-btn-venmo"
                >
                  Pay via Venmo
                </a>

                {/* Zelle */}
                <div style={styles.payCard}>
                  <div style={styles.payCardLabel}>Zelle</div>
                  <div style={styles.payCardInfo}>Send to Aurora's phone number</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="iv-copy-btn"
                      onClick={() => copyToClipboard("6024886362", "zelle")}
                    >
                      {copied === "zelle" ? "Copied!" : "Copy Phone #"}
                    </button>
                    <button
                      className="iv-copy-btn"
                      onClick={() => copyToClipboard(total, "amount")}
                    >
                      {copied === "amount" ? "Copied!" : `Copy $${total}`}
                    </button>
                  </div>
                </div>

                {/* Cash App */}
                <div style={styles.payCard}>
                  <div style={styles.payCardLabel}>Cash App</div>
                  <a href={`https://cash.app/$AuroraLeonard/${total}`} target="_blank" rel="noopener noreferrer" className="iv-btn iv-btn-cashapp" style={{ textDecoration: "none", textAlign: "center" }}>
                    Pay $AuroraLeonard
                  </a>
                </div>
              </div>

              {/* Other Payment */}
              <button
                className="iv-btn iv-btn-other"
                onClick={() => setShowOther(!showOther)}
                style={{ marginTop: 12 }}
              >
                Other Payment Method
              </button>
              {showOther && (
                <div style={styles.otherInfo}>
                  For alternative payment methods, please contact Aurora directly at{" "}
                  <a href="mailto:itsroromode@gmail.com" style={styles.link}>
                    itsroromode@gmail.com
                  </a>
                </div>
              )}

              {/* Divider */}
              <div style={styles.divider} />

              {/* Mark as Paid */}
              <div style={styles.markPaidSection}>
                <div style={styles.markPaidLabel}>Already sent your payment?</div>
                <button
                  className="iv-btn iv-btn-paid"
                  onClick={markAsPaid}
                  disabled={marking}
                  style={{ opacity: marking ? 0.7 : 1 }}
                >
                  {marking ? "Updating..." : "I've Paid This Invoice"}
                </button>
              </div>
            </div>
          )}

          {/* Draft state */}
          {invoice.status === "draft" && (
            <div style={styles.draftNotice}>
              This invoice is still being prepared. Payment is not yet due.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerBrand}>RoRo Mode</div>
          <div style={styles.footerText}>
            Home Organization & Sustainable Styling &middot; Phoenix, AZ
          </div>
          <div style={styles.footerText}>itsroromode@gmail.com</div>
        </div>
      </div>
    </div>
  );
}

/* Inline StatusBadge for public page (no admin dependency) */
const BADGE_COLORS = {
  draft: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
  sent: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  paid: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  overdue: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  cancelled: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

function StatusBadge({ status }) {
  const c = BADGE_COLORS[status] || BADGE_COLORS.draft;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 16px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        borderRadius: "100px",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#faf8f4",
    fontFamily: "'DM Sans', sans-serif",
    color: "#2a2723",
  },
  loadingWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b6560",
    letterSpacing: "1px",
  },
  errorWrap: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "120px 24px",
    textAlign: "center",
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#991b1b",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
  },
  errorTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 24,
    marginBottom: 12,
  },
  errorDesc: {
    fontSize: 15,
    color: "#6b6560",
    lineHeight: 1.6,
  },
  container: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 20px 60px",
  },
  branding: {
    textAlign: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 12,
  },
  brandName: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: 500,
    color: "#1a1a1a",
    letterSpacing: "2px",
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 13,
    color: "#6b6560",
    letterSpacing: "1px",
  },
  card: {
    background: "white",
    border: "1px solid #e8e0d4",
    padding: "40px 36px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: "1px solid #f0ebe3",
  },
  invoiceLabel: {
    fontSize: 11,
    letterSpacing: "2px",
    fontWeight: 500,
    color: "#6b6560",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 26,
    fontWeight: 400,
    color: "#1a1a1a",
  },
  meta: {
    fontSize: 13,
    color: "#6b6560",
    marginTop: 6,
  },
  clientSection: {
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: "1px solid #f0ebe3",
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "2px",
    fontWeight: 500,
    color: "#6b6560",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: 500,
    color: "#1a1a1a",
  },
  clientEmail: {
    fontSize: 14,
    color: "#6b6560",
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: "#2a2723",
    lineHeight: 1.6,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: "1px solid #f0ebe3",
  },
  totalSection: {
    textAlign: "right",
    padding: "24px 0",
    borderTop: "2px solid #1a1a1a",
    marginBottom: 32,
  },
  totalAmount: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 32,
    fontWeight: 500,
    color: "#1a1a1a",
  },
  totalLabel: {
    fontSize: 12,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#6b6560",
    marginTop: 4,
  },
  paidBanner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "24px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    marginBottom: 24,
  },
  paidCheck: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#22c55e",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    flexShrink: 0,
  },
  paidTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "#065f46",
  },
  paidDate: {
    fontSize: 14,
    color: "#16a34a",
    marginTop: 2,
  },
  paySection: {
    padding: "28px",
    background: "#faf8f4",
    border: "1px solid #e8e0d4",
  },
  paySectionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 20,
    fontWeight: 400,
    color: "#1a1a1a",
    marginBottom: 20,
  },
  payGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  payCard: {
    padding: "16px 20px",
    background: "white",
    border: "1px solid #e8e0d4",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  payCardLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
    minWidth: 60,
  },
  payCardInfo: {
    fontSize: 14,
    color: "#6b6560",
    flex: 1,
  },
  otherInfo: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#6b6560",
    lineHeight: 1.6,
    background: "white",
    border: "1px solid #e8e0d4",
    marginTop: 8,
  },
  link: {
    color: "#7a8c6e",
    textDecoration: "none",
    fontWeight: 500,
  },
  divider: {
    height: 1,
    background: "#e8e0d4",
    margin: "24px 0",
  },
  markPaidSection: {
    textAlign: "center",
  },
  markPaidLabel: {
    fontSize: 14,
    color: "#6b6560",
    marginBottom: 12,
  },
  draftNotice: {
    padding: "20px 24px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#6b6560",
    textAlign: "center",
    lineHeight: 1.6,
  },
  footer: {
    textAlign: "center",
    marginTop: 48,
    paddingTop: 32,
    borderTop: "1px solid #e8e0d4",
  },
  footerBrand: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 16,
    fontWeight: 500,
    color: "#1a1a1a",
    letterSpacing: "2px",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#6b6560",
    marginBottom: 2,
  },
};
