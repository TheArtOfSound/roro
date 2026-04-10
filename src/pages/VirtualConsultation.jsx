import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const PACKAGES = [
  {
    name: "Quick Consult",
    duration: "30 minutes",
    price: 75,
    desc: "A focused session for one specific space or challenge. Perfect when you know what needs help — you just need expert eyes.",
    includes: ["Live video walkthrough", "Real-time recommendations", "Quick-win action items"],
  },
  {
    name: "Full Consultation",
    duration: "60 minutes",
    price: 125,
    popular: true,
    desc: "Our signature virtual session. We assess your space, discuss your goals, and build a clear plan — tailored to how you actually live.",
    includes: [
      "Live video walkthrough",
      "Personalized organizing plan (PDF)",
      "Product & container shopping list",
      "Room-by-room action steps",
    ],
  },
  {
    name: "Design & Style Session",
    duration: "90 minutes",
    price: 225,
    desc: "The full experience — organization meets sustainable styling. We plan your space AND curate a vintage/thrift mood board so your home has soul.",
    includes: [
      "Everything in Full Consultation",
      "Custom mood board / style guide",
      "Thrift & vintage sourcing list",
      "30-day follow-up check-in",
    ],
  },
];

const TIMES = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
];

export default function VirtualConsultation() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "", spaces: [], notes: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email.");
    if (!form.date) return setError("Please select a preferred date.");
    if (!form.time) return setError("Please select a preferred time.");

    setSending(true);
    const pkg = PACKAGES[selected];
    const { error: err } = await supabase.from("messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      service: `Virtual Consultation — ${pkg.name} (${pkg.duration})`,
      message: [
        `Package: ${pkg.name} — $${pkg.price}`,
        `Duration: ${pkg.duration}`,
        `Phone: ${form.phone || "Not provided"}`,
        `Preferred Date: ${form.date}`,
        `Preferred Time: ${form.time}`,
        `Spaces: ${form.spaces.length ? form.spaces.join(", ") : "Not specified"}`,
        form.notes ? `\nNotes: ${form.notes}` : "",
      ].filter(Boolean).join("\n"),
    });
    setSending(false);
    if (err) {
      setError("Something went wrong. Please email itsroromode@gmail.com directly.");
    } else {
      setDone(true);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .vc-page { min-height: 100vh; background: #faf8f4; font-family: 'DM Sans', sans-serif; color: #2a2723; }
        .vc-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #e8e0d4; background: #faf8f4; position: sticky; top: 0; z-index: 10; }
        .vc-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #2a2723; text-decoration: none; }
        .vc-logo span { color: #7a8c6e; }
        .vc-back { font-size: 13px; color: #7a8c6e; text-decoration: none; letter-spacing: 0.5px; }
        .vc-hero { text-align: center; padding: 60px 40px 40px; }
        .vc-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 400; margin-bottom: 12px; color: #1a1a1a; }
        .vc-hero h1 em { color: #7a8c6e; font-style: italic; }
        .vc-hero p { max-width: 600px; margin: 0 auto; font-size: 16px; color: #6b6560; line-height: 1.7; }
        .vc-steps { display: flex; justify-content: center; gap: 0; margin: 40px auto; max-width: 500px; }
        .vc-step { flex: 1; text-align: center; position: relative; }
        .vc-step-dot { width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; transition: all 0.3s; }
        .vc-step-dot.active { background: #7a8c6e; color: white; }
        .vc-step-dot.done { background: #7a8c6e; color: white; }
        .vc-step-dot.pending { background: #e8e0d4; color: #6b6560; }
        .vc-step-label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #6b6560; }
        .vc-step-line { position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; background: #e8e0d4; z-index: -1; }
        .vc-step:last-child .vc-step-line { display: none; }
        .vc-packages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto 60px; padding: 0 40px; }
        .vc-pkg { background: white; border: 2px solid #e8e0d4; padding: 32px 28px; position: relative; cursor: pointer; transition: all 0.3s; }
        .vc-pkg:hover { border-color: #7a8c6e; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .vc-pkg.selected { border-color: #7a8c6e; background: #faf8f4; }
        .vc-pkg-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #7a8c6e; color: white; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 16px; }
        .vc-pkg h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; margin-bottom: 4px; }
        .vc-pkg .vc-duration { font-size: 13px; color: #7a8c6e; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; margin-bottom: 12px; }
        .vc-pkg .vc-price { font-family: 'Playfair Display', serif; font-size: 36px; color: #7a8c6e; font-weight: 400; margin-bottom: 16px; }
        .vc-pkg .vc-price span { font-size: 16px; color: #6b6560; }
        .vc-pkg p { font-size: 14px; color: #6b6560; line-height: 1.6; margin-bottom: 20px; }
        .vc-pkg ul { list-style: none; padding: 0; margin: 0; }
        .vc-pkg li { font-size: 13px; color: #3d3830; padding: 6px 0; border-top: 1px solid #f0ece4; display: flex; align-items: center; gap: 8px; }
        .vc-pkg li::before { content: '✓'; color: #7a8c6e; font-weight: 600; }
        .vc-form { max-width: 600px; margin: 0 auto; padding: 0 40px 60px; }
        .vc-form h2 { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; text-align: center; margin-bottom: 8px; }
        .vc-form .vc-form-sub { text-align: center; font-size: 14px; color: #6b6560; margin-bottom: 32px; }
        .vc-field { margin-bottom: 20px; }
        .vc-field label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #6b6560; margin-bottom: 6px; }
        .vc-field input, .vc-field select, .vc-field textarea {
          width: 100%; padding: 14px 16px; border: 1px solid #e8e0d4; background: white;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #2a2723; outline: none;
          transition: border 0.2s; box-sizing: border-box;
        }
        .vc-field input:focus, .vc-field select:focus, .vc-field textarea:focus { border-color: #7a8c6e; }
        .vc-field textarea { resize: vertical; min-height: 80px; }
        .vc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .vc-spaces { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .vc-space-chip { padding: 8px 14px; border: 1px solid #e8e0d4; font-size: 13px; cursor: pointer; transition: all 0.2s; background: white; }
        .vc-space-chip.active { background: #7a8c6e; color: white; border-color: #7a8c6e; }
        .vc-btn { display: block; width: 100%; padding: 16px; background: #1a1a1a; color: white; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer; transition: all 0.3s; margin-top: 24px; }
        .vc-btn:hover { background: #7a8c6e; }
        .vc-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .vc-btn-back { display: block; width: 100%; padding: 12px; background: none; color: #6b6560; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; margin-top: 8px; }
        .vc-success { text-align: center; padding: 80px 40px; max-width: 500px; margin: 0 auto; }
        .vc-success h2 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; margin-bottom: 16px; }
        .vc-success p { font-size: 15px; color: #6b6560; line-height: 1.7; }
        .vc-error { color: #c4735a; font-size: 14px; margin-bottom: 16px; text-align: center; }
        @media (max-width: 768px) {
          .vc-packages { grid-template-columns: 1fr; max-width: 400px; }
          .vc-row { grid-template-columns: 1fr; }
          .vc-nav { padding: 16px 20px; }
          .vc-hero { padding: 40px 20px 20px; }
          .vc-form { padding: 0 20px 40px; }
        }
      `}</style>

      <div className="vc-page">
        <nav className="vc-nav">
          <Link to="/" className="vc-logo">RO<span>RO</span> MODE</Link>
          <Link to="/" className="vc-back">← Back to website</Link>
        </nav>

        {done ? (
          <div className="vc-success">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2>You're all set!</h2>
            <p>
              We've received your virtual consultation request. Aurora will confirm your
              session within 24 hours and send you a calendar invite with the video link.
            </p>
            <p style={{ marginTop: 24, fontSize: 13, color: "#a09890" }}>
              Check your email at <strong>{form.email}</strong> for confirmation.
            </p>
            <Link to="/" style={{
              display: "inline-block", marginTop: 32, padding: "14px 32px",
              background: "#1a1a1a", color: "white", textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              letterSpacing: 1.5, textTransform: "uppercase"
            }}>Back to Home</Link>
          </div>
        ) : (
          <>
            <div className="vc-hero">
              <h1>Virtual <em>Consultation</em></h1>
              <p>
                Expert guidance on organization, styling, and functional flow — from
                the comfort of your own home. Simple. Intentional. Elevated.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="vc-steps">
              {["Package", "Details", "Confirm"].map((label, i) => (
                <div className="vc-step" key={label}>
                  {i < 2 && <div className="vc-step-line" style={{ background: step > i + 1 ? "#7a8c6e" : "#e8e0d4" }} />}
                  <div className={`vc-step-dot ${step > i + 1 ? "done" : step === i + 1 ? "active" : "pending"}`}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <div className="vc-step-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Step 1: Select Package */}
            {step === 1 && (
              <div className="vc-packages">
                {PACKAGES.map((pkg, i) => (
                  <div
                    key={pkg.name}
                    className={`vc-pkg ${selected === i ? "selected" : ""}`}
                    onClick={() => setSelected(i)}
                  >
                    {pkg.popular && <div className="vc-pkg-badge">Most Popular</div>}
                    <h3>{pkg.name}</h3>
                    <div className="vc-duration">{pkg.duration}</div>
                    <div className="vc-price">${pkg.price}</div>
                    <p>{pkg.desc}</p>
                    <ul>
                      {pkg.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: 8 }}>
                  <button
                    className="vc-btn"
                    style={{ maxWidth: 300, margin: "0 auto" }}
                    disabled={selected === null}
                    onClick={() => setStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Your Details */}
            {step === 2 && (
              <div className="vc-form">
                <h2>Your Details</h2>
                <p className="vc-form-sub">Tell us about yourself and your space so we can prepare.</p>

                <div className="vc-row">
                  <div className="vc-field">
                    <label>Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="vc-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                  </div>
                </div>

                <div className="vc-field">
                  <label>Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
                </div>

                <div className="vc-row">
                  <div className="vc-field">
                    <label>Preferred Date</label>
                    <input type="date" value={form.date} min={minDateStr} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="vc-field">
                    <label>Preferred Time (CST)</label>
                    <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                      <option value="">Select a time...</option>
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="vc-field">
                  <label>Which spaces need help?</label>
                  <div className="vc-spaces">
                    {["Kitchen / Pantry", "Closets", "Living Room", "Bedroom", "Garage", "Whole Home", "Other"].map((space) => (
                      <div
                        key={space}
                        className={`vc-space-chip ${form.spaces.includes(space) ? "active" : ""}`}
                        onClick={() => {
                          const has = form.spaces.includes(space);
                          setForm({ ...form, spaces: has ? form.spaces.filter((s) => s !== space) : [...form.spaces, space] });
                        }}
                      >
                        {space}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vc-field">
                  <label>Anything else we should know?</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Tell us about your biggest challenge, your style preferences, or what you're hoping to achieve..." />
                </div>

                <button className="vc-btn" onClick={() => setStep(3)}>Review & Book →</button>
                <button className="vc-btn-back" onClick={() => setStep(1)}>← Back to packages</button>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && selected !== null && (
              <div className="vc-form">
                <h2>Review & Book</h2>
                <p className="vc-form-sub">Confirm your details and we'll send a calendar invite within 24 hours.</p>

                <div style={{ background: "white", border: "1px solid #e8e0d4", padding: 28, marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f0ece4" }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>{PACKAGES[selected].name}</div>
                      <div style={{ fontSize: 13, color: "#7a8c6e", letterSpacing: 1, textTransform: "uppercase" }}>{PACKAGES[selected].duration}</div>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#7a8c6e" }}>${PACKAGES[selected].price}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Name</div>
                      <div>{form.name || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Email</div>
                      <div>{form.email || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Date</div>
                      <div>{form.date || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Time</div>
                      <div>{form.time || "—"}</div>
                    </div>
                    {form.spaces.length > 0 && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Spaces</div>
                        <div>{form.spaces.join(", ")}</div>
                      </div>
                    )}
                    {form.notes && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#6b6560", marginBottom: 4 }}>Notes</div>
                        <div style={{ color: "#6b6560" }}>{form.notes}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: "#f5f0e8", padding: 20, marginBottom: 24, fontSize: 13, color: "#6b6560", lineHeight: 1.6 }}>
                  <strong style={{ color: "#2a2723" }}>What happens next?</strong><br />
                  Aurora will review your request and send a confirmation email with a Zoom link
                  and any prep instructions within 24 hours. Payment is collected after your session.
                </div>

                {error && <div className="vc-error">{error}</div>}

                <button className="vc-btn" onClick={handleSubmit} disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Booking..." : `Book ${PACKAGES[selected].name} — $${PACKAGES[selected].price}`}
                </button>
                <button className="vc-btn-back" onClick={() => setStep(2)}>← Edit details</button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer style={{ padding: "40px 20px", textAlign: "center", borderTop: "1px solid #e8e0d4", marginTop: 40 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
            RO<span style={{ color: "#7a8c6e" }}>RO</span> MODE
          </div>
          <div style={{ fontSize: 12, color: "#a09890" }}>© 2026 RoRo MODE — Aurora Leonard. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
