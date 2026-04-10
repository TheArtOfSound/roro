import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import StatusBadge from "../../components/ui/StatusBadge";

const PROGRESS_STEPS = ["inquiry", "consultation", "scheduled", "in_progress", "completed"];
const STEP_LABELS = {
  inquiry: "Inquiry",
  consultation: "Consultation",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Complete",
};

function getStepIndex(status) {
  if (status === "pending") return 0;
  if (status === "accepted") return 1;
  const idx = PROGRESS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadData();
  }, [user]);

  async function loadData() {
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("email", user.email)
      .single();

    if (clientData) {
      setClient(clientData);

      const [{ data: bookingsData }, { data: invoicesData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      setBookings(bookingsData || []);
      setInvoices(invoicesData || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#6b6560", fontFamily: "'DM Sans', sans-serif" }}>
        Loading your dashboard...
      </div>
    );
  }

  const activeBooking = bookings.find((b) => b.status !== "completed" && b.status !== "cancelled");
  const currentStep = activeBooking ? getStepIndex(activeBooking.status) : -1;

  return (
    <>
      <style>{`
        .cd-welcome {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 32px;
        }
        .cd-card {
          background: white;
          border: 1px solid #e8e0d4;
          padding: 28px;
          margin-bottom: 24px;
        }
        .cd-card-title {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #7a8c6e;
          margin-bottom: 16px;
        }
        .cd-project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cd-project-service {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          color: #1a1a1a;
        }
        .cd-project-date {
          font-size: 14px;
          color: #6b6560;
          margin-bottom: 24px;
        }
        .cd-progress {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 8px;
        }
        .cd-progress-step {
          flex: 1;
          text-align: center;
          position: relative;
        }
        .cd-progress-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #e8e0d4;
          background: white;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #e8e0d4;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }
        .cd-progress-step.done .cd-progress-dot {
          background: #7a8c6e;
          border-color: #7a8c6e;
          color: white;
        }
        .cd-progress-step.current .cd-progress-dot {
          background: white;
          border-color: #7a8c6e;
          color: #7a8c6e;
          box-shadow: 0 0 0 4px rgba(122, 140, 110, 0.15);
        }
        .cd-progress-label {
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #b0aaa4;
          transition: color 0.3s;
        }
        .cd-progress-step.done .cd-progress-label,
        .cd-progress-step.current .cd-progress-label {
          color: #2a2723;
          font-weight: 500;
        }
        .cd-progress-line {
          position: absolute;
          top: 14px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: #e8e0d4;
          z-index: 0;
        }
        .cd-progress-step.done .cd-progress-line {
          background: #7a8c6e;
        }
        .cd-progress-step:last-child .cd-progress-line { display: none; }
        .cd-inv-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f0e8;
        }
        .cd-inv-row:last-child { border-bottom: none; }
        .cd-inv-num {
          font-size: 14px;
          color: #2a2723;
          font-weight: 500;
        }
        .cd-inv-amount {
          font-size: 14px;
          color: #2a2723;
          margin-right: 12px;
        }
        .cd-inv-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cd-help-card {
          background: #f5f0e8;
          border: 1px solid #e8e0d4;
          padding: 28px;
          margin-bottom: 24px;
        }
        .cd-help-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        .cd-help-text {
          font-size: 14px;
          color: #6b6560;
          line-height: 1.7;
        }
        .cd-help-text a {
          color: #7a8c6e;
          text-decoration: none;
        }
        .cd-help-text a:hover { text-decoration: underline; }
        .cd-empty {
          padding: 40px;
          text-align: center;
          color: #6b6560;
          font-size: 14px;
        }
        .cd-view-all {
          display: inline-block;
          margin-top: 12px;
          font-size: 13px;
          color: #7a8c6e;
          text-decoration: none;
          font-weight: 500;
        }
        .cd-view-all:hover { text-decoration: underline; }
      `}</style>

      <h1 className="cd-welcome">Welcome back{client?.name ? `, ${client.name.split(" ")[0]}` : ""}</h1>

      {/* Active Project */}
      <div className="cd-card">
        <div className="cd-card-title">Active Project</div>
        {activeBooking ? (
          <>
            <div className="cd-project-header">
              <div className="cd-project-service">{activeBooking.service}</div>
              <StatusBadge status={activeBooking.status} />
            </div>
            {activeBooking.scheduled_at && (
              <div className="cd-project-date">
                Scheduled: {new Date(activeBooking.scheduled_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}
            <div className="cd-progress">
              {PROGRESS_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`cd-progress-step ${i < currentStep ? "done" : ""} ${i === currentStep ? "current" : ""}`}
                >
                  <div style={{ position: "relative" }}>
                    <div className="cd-progress-dot">
                      {i < currentStep ? "\u2713" : i + 1}
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && <div className="cd-progress-line" />}
                  </div>
                  <div className="cd-progress-label">{STEP_LABELS[step]}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="cd-empty">No active projects right now. We'll update you when your next project begins.</div>
        )}
      </div>

      {/* Recent Invoices */}
      <div className="cd-card">
        <div className="cd-card-title">Recent Invoices</div>
        {invoices.length === 0 ? (
          <div className="cd-empty">No invoices yet.</div>
        ) : (
          <>
            {invoices.map((inv) => (
              <div className="cd-inv-row" key={inv.id}>
                <div>
                  <div className="cd-inv-num">{inv.invoice_number}</div>
                  <div style={{ fontSize: "12px", color: "#6b6560" }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "No due date"}
                  </div>
                </div>
                <div className="cd-inv-right">
                  <span className="cd-inv-amount">${(inv.amount_cents / 100).toFixed(2)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
            <Link to="/client/invoices" className="cd-view-all">View all invoices &rarr;</Link>
          </>
        )}
      </div>

      {/* Need Help */}
      <div className="cd-help-card">
        <div className="cd-help-title">Need help?</div>
        <div className="cd-help-text">
          Have a question about your project? Send us a message through the{" "}
          <Link to="/client/messages">Messages</Link> tab or email{" "}
          <a href="mailto:hello@roromode.com">hello@roromode.com</a>.
          <br />
          We typically respond within 24 hours.
        </div>
      </div>
    </>
  );
}
