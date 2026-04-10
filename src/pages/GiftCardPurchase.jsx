import { useState } from "react";
import { supabase } from "../lib/supabase";

function generateGiftCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return `RORO-GIFT-${result}`;
}

const AMOUNTS = [
  { cents: 10000, label: "$100", desc: "A thoughtful touch" },
  { cents: 25000, label: "$250", desc: "A room transformed" },
  { cents: 50000, label: "$500", desc: "A full home reset" },
];

export default function GiftCardPurchase() {
  const [step, setStep] = useState("select"); // select | form | checking | success
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [form, setForm] = useState({
    recipient_name: "",
    recipient_email: "",
    personal_message: "",
    purchaser_name: "",
    purchaser_email: "",
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  // giftCode no longer needed - request flow doesn't generate codes

  // Balance check state
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");

  async function handlePurchase(e) {
    e.preventDefault();
    setError("");
    if (!selectedAmount) return setError("Please select an amount.");
    if (!form.purchaser_name.trim()) return setError("Please enter your name.");
    if (!form.purchaser_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.purchaser_email))
      return setError("Please enter a valid email.");
    if (!form.recipient_name.trim()) return setError("Please enter the recipient's name.");

    setSending(true);
    const amountLabel = `$${(selectedAmount / 100).toFixed(0)}`;
    const body = `Gift Card Request:\n\nAmount: ${amountLabel}\nFrom: ${form.purchaser_name.trim()} (${form.purchaser_email.trim()})\nFor: ${form.recipient_name.trim()}${form.recipient_email.trim() ? ` (${form.recipient_email.trim()})` : ""}\n${form.personal_message.trim() ? `Message: ${form.personal_message.trim()}` : ""}`;
    const { error: dbError } = await supabase.from("messages").insert({
      name: form.purchaser_name.trim(),
      email: form.purchaser_email.trim(),
      message: body,
    });
    setSending(false);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setStep("success");
  }

  async function handleCheckBalance(e) {
    e.preventDefault();
    setCheckError("");
    setCheckResult(null);
    if (!checkCode.trim()) return setCheckError("Please enter a gift card code.");
    setChecking(true);
    const { data, error: dbError } = await supabase
      .from("gift_cards")
      .select("code, amount_cents, balance_cents, is_active, recipient_name")
      .eq("code", checkCode.trim().toUpperCase())
      .single();
    setChecking(false);
    if (dbError || !data) {
      setCheckError("Gift card not found. Please check the code and try again.");
      return;
    }
    setCheckResult(data);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .gcp-page {
          min-height: 100vh;
          background: #faf8f4;
          font-family: 'DM Sans', sans-serif;
          color: #2a2723;
        }

        /* Nav */
        .gcp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px; max-width: 1200px; margin: 0 auto;
        }
        .gcp-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px; font-weight: 700; letter-spacing: 2px;
          color: #1a1a1a; text-decoration: none;
        }
        .gcp-logo span { color: #7a8c6e; }
        .gcp-back {
          font-size: 13px; color: #6b6560; text-decoration: none;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .gcp-back:hover { color: #7a8c6e; }

        /* Hero */
        .gcp-hero {
          text-align: center; padding: 60px 40px 40px; max-width: 700px; margin: 0 auto;
        }
        .gcp-hero-tag {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: #7a8c6e; margin-bottom: 16px;
        }
        .gcp-hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 48px; font-weight: 400; line-height: 1.15; color: #1a1a1a;
          margin-bottom: 16px;
        }
        .gcp-hero-sub {
          font-size: 16px; color: #6b6560; line-height: 1.7; max-width: 520px;
          margin: 0 auto;
        }

        /* Amount Cards */
        .gcp-amounts {
          display: flex; gap: 20px; justify-content: center; padding: 40px 40px 20px;
          max-width: 800px; margin: 0 auto; flex-wrap: wrap;
        }
        .gcp-amount-card {
          flex: 1; min-width: 200px; max-width: 240px; padding: 32px 24px;
          background: white; border: 2px solid #e8e0d4; cursor: pointer;
          text-align: center; transition: all 0.3s;
        }
        .gcp-amount-card:hover { border-color: #7a8c6e; transform: translateY(-2px); }
        .gcp-amount-card.selected { border-color: #1a1a1a; background: #1a1a1a; color: #f5f0e8; }
        .gcp-amount-card.selected .gcp-amount-desc { color: rgba(245,240,232,0.6); }
        .gcp-amount-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px; font-weight: 500; margin-bottom: 8px;
        }
        .gcp-amount-desc { font-size: 13px; color: #6b6560; font-style: italic; }

        /* Form */
        .gcp-form-wrap {
          max-width: 520px; margin: 40px auto 0; padding: 0 40px 80px;
        }
        .gcp-form-section {
          margin-bottom: 32px;
        }
        .gcp-form-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px; font-weight: 400; margin-bottom: 16px; color: #1a1a1a;
        }
        .gcp-field { margin-bottom: 16px; }
        .gcp-field label {
          display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #6b6560; margin-bottom: 6px;
        }
        .gcp-field input, .gcp-field textarea {
          width: 100%; padding: 14px 16px; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
          background: white; transition: border-color 0.2s;
        }
        .gcp-field textarea { min-height: 100px; resize: vertical; }
        .gcp-field input:focus, .gcp-field textarea:focus { border-color: #7a8c6e; }
        .gcp-submit {
          width: 100%; padding: 16px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          transition: background 0.3s;
        }
        .gcp-submit:hover { background: #7a8c6e; }
        .gcp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .gcp-error {
          padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca;
          color: #991b1b; font-size: 13px; margin-bottom: 16px;
        }

        /* Success */
        .gcp-success {
          max-width: 560px; margin: 0 auto; padding: 60px 40px 80px; text-align: center;
        }
        .gcp-success-icon { font-size: 48px; margin-bottom: 16px; }
        .gcp-success-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px; font-weight: 400; margin-bottom: 12px; color: #1a1a1a;
        }
        .gcp-success-text { font-size: 15px; color: #6b6560; line-height: 1.7; margin-bottom: 32px; }
        .gcp-success-code {
          display: inline-block; padding: 16px 32px; background: #1a1a1a; color: #f5f0e8;
          font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px;
          margin-bottom: 24px;
        }
        .gcp-success-note { font-size: 13px; color: #6b6560; font-style: italic; }

        /* Balance Check */
        .gcp-check {
          max-width: 520px; margin: 0 auto; padding: 60px 40px 80px;
          border-top: 1px solid #e8e0d4;
        }
        .gcp-check-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px; font-weight: 400; text-align: center; margin-bottom: 24px;
        }
        .gcp-check-form { display: flex; gap: 12px; }
        .gcp-check-input {
          flex: 1; padding: 14px 16px; border: 1px solid #e8e0d4;
          font-family: monospace; font-size: 14px; outline: none;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .gcp-check-input:focus { border-color: #7a8c6e; }
        .gcp-check-btn {
          padding: 14px 24px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
          white-space: nowrap;
        }
        .gcp-check-btn:hover { background: #7a8c6e; }
        .gcp-check-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .gcp-check-result {
          margin-top: 24px; padding: 24px; background: white; border: 1px solid #e8e0d4;
          text-align: center;
        }
        .gcp-check-balance {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px; font-weight: 500; color: #7a8c6e; margin-bottom: 4px;
        }
        .gcp-check-label { font-size: 12px; color: #6b6560; text-transform: uppercase; letter-spacing: 1px; }
        .gcp-check-error {
          margin-top: 12px; padding: 10px; background: #fef2f2; border: 1px solid #fecaca;
          color: #991b1b; font-size: 13px; text-align: center;
        }
        .gcp-check-inactive {
          font-size: 13px; color: #991b1b; margin-top: 8px;
        }

        /* Divider */
        .gcp-divider {
          max-width: 800px; margin: 40px auto 0; padding: 0 40px;
        }

        @media (max-width: 640px) {
          .gcp-hero-title { font-size: 32px; }
          .gcp-hero { padding: 40px 20px 20px; }
          .gcp-amounts { padding: 20px; }
          .gcp-amount-card { min-width: 140px; padding: 24px 16px; }
          .gcp-amount-value { font-size: 28px; }
          .gcp-form-wrap { padding: 0 20px 60px; }
          .gcp-nav { padding: 16px 20px; }
          .gcp-check { padding: 40px 20px 60px; }
          .gcp-check-form { flex-direction: column; }
          .gcp-success { padding: 40px 20px 60px; }
        }
      `}</style>

      <div className="gcp-page">
        <nav className="gcp-nav">
          <a href="/" className="gcp-logo">Ro<span>Ro</span> Mode</a>
          <a href="/" className="gcp-back">&larr; Back to Home</a>
        </nav>

        {step === "success" ? (
          <div className="gcp-success">
            <div className="gcp-success-icon">&#10003;</div>
            <h1 className="gcp-success-title">Request Received</h1>
            <p className="gcp-success-text">
              Thank you, {form.purchaser_name}! We have received your gift card request
              for {form.recipient_name}. Aurora will be in touch shortly to finalize your purchase.
            </p>
            <p className="gcp-success-note">
              We will reach out to {form.purchaser_email} with next steps.
            </p>
          </div>
        ) : (
          <>
            <div className="gcp-hero">
              <div className="gcp-hero-tag">Give the Gift of Home</div>
              <h1 className="gcp-hero-title">RoRo Mode Gift Cards</h1>
              <p className="gcp-hero-sub">
                Give someone the gift of a beautifully organized, intentionally styled home.
                Perfect for housewarmings, holidays, or just because.
              </p>
            </div>

            <div className="gcp-amounts">
              {AMOUNTS.map((a) => (
                <div
                  key={a.cents}
                  className={`gcp-amount-card ${selectedAmount === a.cents ? "selected" : ""}`}
                  onClick={() => setSelectedAmount(a.cents)}
                >
                  <div className="gcp-amount-value">{a.label}</div>
                  <div className="gcp-amount-desc">{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="gcp-form-wrap">
              <form onSubmit={handlePurchase}>
                <div className="gcp-form-section">
                  <h3 className="gcp-form-section-title">Who is this for?</h3>
                  <div className="gcp-field">
                    <label>Recipient Name</label>
                    <input required value={form.recipient_name}
                      onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} />
                  </div>
                  <div className="gcp-field">
                    <label>Recipient Email</label>
                    <input type="email" value={form.recipient_email}
                      onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
                      placeholder="Optional - we'll send them a notification" />
                  </div>
                  <div className="gcp-field">
                    <label>Personal Message</label>
                    <textarea value={form.personal_message}
                      onChange={(e) => setForm({ ...form, personal_message: e.target.value })}
                      placeholder="Add a heartfelt note..." />
                  </div>
                </div>

                <div className="gcp-form-section">
                  <h3 className="gcp-form-section-title">Your Details</h3>
                  <div className="gcp-field">
                    <label>Your Name</label>
                    <input required value={form.purchaser_name}
                      onChange={(e) => setForm({ ...form, purchaser_name: e.target.value })} />
                  </div>
                  <div className="gcp-field">
                    <label>Your Email</label>
                    <input required type="email" value={form.purchaser_email}
                      onChange={(e) => setForm({ ...form, purchaser_email: e.target.value })} />
                  </div>
                </div>

                {error && <div className="gcp-error">{error}</div>}

                <button type="submit" className="gcp-submit" disabled={sending || !selectedAmount}>
                  {sending ? "Sending Request..." : selectedAmount ? `Request $${(selectedAmount / 100).toFixed(0)} Gift Card` : "Select an Amount"}
                </button>
              </form>
            </div>
          </>
        )}

        <div className="gcp-divider" />

        <div className="gcp-check">
          <h2 className="gcp-check-title">Check Your Balance</h2>
          <form className="gcp-check-form" onSubmit={handleCheckBalance}>
            <input
              className="gcp-check-input"
              placeholder="Enter gift card code..."
              value={checkCode}
              onChange={(e) => setCheckCode(e.target.value)}
            />
            <button type="submit" className="gcp-check-btn" disabled={checking}>
              {checking ? "Checking..." : "Check Balance"}
            </button>
          </form>
          {checkError && <div className="gcp-check-error">{checkError}</div>}
          {checkResult && (
            <div className="gcp-check-result">
              <div className="gcp-check-balance">${(checkResult.balance_cents / 100).toFixed(0)}</div>
              <div className="gcp-check-label">Remaining Balance</div>
              {checkResult.recipient_name && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#6b6560" }}>
                  Gift card for {checkResult.recipient_name}
                </div>
              )}
              {!checkResult.is_active && (
                <div className="gcp-check-inactive">This gift card is no longer active.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
