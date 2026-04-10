import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

const TABS = ["Services & Pricing", "Promotions", "Business Info"];

function generatePromoCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return `RORO-${result}`;
}

const emptyService = {
  title: "",
  description: "",
  price_display: "",
  icon: "",
  image: "",
  keywords: "",
  sort_order: 0,
  active: true,
};

export default function Settings() {
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(null);

  // Services state
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({ ...emptyService });

  // Promos state
  const [promos, setPromos] = useState([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: generatePromoCode(),
    discount_type: "percent",
    discount_value: "",
    max_uses: "",
    expires_at: "",
  });

  useEffect(() => {
    loadServices();
    loadPromos();
  }, []);

  // ---- Services ----
  async function loadServices() {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data || []);
  }

  function startEdit(svc) {
    setEditingId(svc.id);
    setEditForm({
      ...svc,
      keywords: Array.isArray(svc.keywords) ? svc.keywords.join(", ") : svc.keywords || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    const keywordsArr = editForm.keywords
      ? editForm.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    const { error } = await supabase
      .from("services")
      .update({
        title: editForm.title,
        description: editForm.description,
        price_display: editForm.price_display,
        icon: editForm.icon,
        image: editForm.image,
        keywords: keywordsArr,
        sort_order: parseInt(editForm.sort_order) || 0,
        active: editForm.active,
      })
      .eq("id", editingId);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Service updated!", type: "success" });
    setEditingId(null);
    loadServices();
  }

  async function addService(e) {
    e.preventDefault();
    const keywordsArr = newService.keywords
      ? newService.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    const { error } = await supabase.from("services").insert({
      title: newService.title,
      description: newService.description,
      price_display: newService.price_display,
      icon: newService.icon,
      image: newService.image,
      keywords: keywordsArr,
      sort_order: parseInt(newService.sort_order) || 0,
      active: newService.active,
    });
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Service added!", type: "success" });
    setNewService({ ...emptyService });
    setAddingService(false);
    loadServices();
  }

  async function deleteService(id) {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Service deleted", type: "success" });
    if (editingId === id) cancelEdit();
    loadServices();
  }

  async function toggleServiceActive(svc) {
    const { error } = await supabase.from("services").update({ is_active: !svc.is_active }).eq("id", svc.id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    loadServices();
  }

  // ---- Promos ----
  async function loadPromos() {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data || []);
  }

  async function createPromo(e) {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discount_value) {
      setToast({ message: "Code and discount value are required", type: "error" });
      return;
    }
    const { error } = await supabase.from("promo_codes").insert({
      code: newPromo.code,
      discount_type: newPromo.discount_type,
      discount_value: parseFloat(newPromo.discount_value),
      max_uses: newPromo.max_uses ? parseInt(newPromo.max_uses) : null,
      expires_at: newPromo.expires_at || null,
    });
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "Promo code created!", type: "success" });
    setNewPromo({ code: generatePromoCode(), discount_type: "percent", discount_value: "", max_uses: "", expires_at: "" });
    setShowPromoForm(false);
    loadPromos();
  }

  async function togglePromoActive(promo) {
    const { error } = await supabase.from("promo_codes").update({ is_active: !promo.is_active }).eq("id", promo.id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    loadPromos();
  }

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
    textTransform: "uppercase", color: "#6b6560", marginBottom: "6px",
  };
  const fieldStyle = {
    width: "100%", padding: "12px 14px", border: "1px solid #e8e0d4",
    fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", background: "white",
  };

  return (
    <>
      <style>{`
        .st-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .st-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .st-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid #e8e0d4; }
        .st-tab {
          padding: 12px 24px; font-family: 'DM Sans', sans-serif; font-size: 13px;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
          background: none; border: none; border-bottom: 2px solid transparent;
          color: #6b6560; transition: all 0.2s;
        }
        .st-tab:hover { color: #2a2723; }
        .st-tab.active { color: #1a1a1a; border-bottom-color: #7a8c6e; font-weight: 500; }
        .st-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .st-btn:hover { background: #7a8c6e; }
        .st-btn-secondary {
          padding: 10px 20px; background: white; color: #2a2723; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .st-btn-secondary:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .st-btn-danger {
          padding: 6px 14px; background: transparent; color: #dc2626; border: 1px solid #dc2626;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer;
        }
        .st-btn-danger:hover { background: #dc2626; color: white; }
        .st-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .st-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .st-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; vertical-align: top; }
        .st-table tr:hover { background: #faf8f4; }
        .st-badge {
          display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .st-badge-active { background: #e8f5e2; color: #3d7a2d; }
        .st-badge-inactive { background: #f5e8e8; color: #7a2d2d; }
        .st-toggle {
          background: none; border: 1px solid #e8e0d4; padding: 4px 12px; font-size: 11px;
          font-family: 'DM Sans', sans-serif; cursor: pointer; color: #6b6560;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .st-toggle:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .st-edit-row { background: #faf8f4; }
        .st-edit-form { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .st-edit-full { grid-column: 1 / -1; }
        .st-edit-actions { grid-column: 1 / -1; display: flex; gap: 12px; margin-top: 8px; }
        .st-form { background: white; border: 1px solid #e8e0d4; padding: 32px; margin-bottom: 24px; max-width: 800px; }
        .st-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .st-form-full { margin-bottom: 16px; }
        .st-form-actions { display: flex; gap: 12px; margin-top: 8px; }
        .st-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
        .st-info-card { background: white; border: 1px solid #e8e0d4; padding: 32px; max-width: 600px; }
        .st-info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f0e8; }
        .st-info-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b6560; }
        .st-info-value { font-size: 14px; color: #2a2723; font-weight: 500; text-align: right; }
        .st-radio-group { display: flex; gap: 16px; align-items: center; }
        .st-radio-label {
          display: flex; align-items: center; gap: 6px; font-size: 14px; color: #2a2723;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="st-header">
        <h1 className="st-title">Settings</h1>
      </div>

      <div className="st-tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`st-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* ---- TAB 1: Services & Pricing ---- */}
      {tab === 0 && (
        <>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
            <button className="st-btn" onClick={() => setAddingService(true)}>+ Add Service</button>
          </div>

          {addingService && (
            <form className="st-form" onSubmit={addService}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", marginBottom: "20px", color: "#1a1a1a" }}>New Service</div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={fieldStyle} required value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Price Display</label>
                  <input style={fieldStyle} placeholder='e.g. Starting at $375' value={newService.price_display} onChange={(e) => setNewService({ ...newService, price_display: e.target.value })} />
                </div>
              </div>
              <div className="st-form-full">
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
              </div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Icon (single character)</label>
                  <input style={fieldStyle} maxLength={2} value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Image Filename</label>
                  <input style={fieldStyle} placeholder="e.g. home-reset.jpg" value={newService.image} onChange={(e) => setNewService({ ...newService, image: e.target.value })} />
                </div>
              </div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Keywords (comma-separated)</label>
                  <input style={fieldStyle} placeholder="organizing, declutter, home" value={newService.keywords} onChange={(e) => setNewService({ ...newService, keywords: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={fieldStyle} value={newService.sort_order} onChange={(e) => setNewService({ ...newService, sort_order: e.target.value })} />
                </div>
              </div>
              <div className="st-form-actions">
                <button type="submit" className="st-btn">Add Service</button>
                <button type="button" className="st-btn-secondary" onClick={() => setAddingService(false)}>Cancel</button>
              </div>
            </form>
          )}

          {services.length === 0 ? (
            <div className="st-empty">No services yet. Add one to get started.</div>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Icon</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  editingId === svc.id ? (
                    <tr key={svc.id} className="st-edit-row">
                      <td colSpan={6}>
                        <div className="st-edit-form">
                          <div>
                            <label style={labelStyle}>Title</label>
                            <input style={fieldStyle} value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                          </div>
                          <div>
                            <label style={labelStyle}>Price Display</label>
                            <input style={fieldStyle} value={editForm.price_display || ""} onChange={(e) => setEditForm({ ...editForm, price_display: e.target.value })} />
                          </div>
                          <div className="st-edit-full">
                            <label style={labelStyle}>Description</label>
                            <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                          </div>
                          <div>
                            <label style={labelStyle}>Icon (single character)</label>
                            <input style={fieldStyle} maxLength={2} value={editForm.icon || ""} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} />
                          </div>
                          <div>
                            <label style={labelStyle}>Image Filename</label>
                            <input style={fieldStyle} value={editForm.image || ""} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} />
                          </div>
                          <div>
                            <label style={labelStyle}>Keywords (comma-separated)</label>
                            <input style={fieldStyle} value={editForm.keywords || ""} onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })} />
                          </div>
                          <div>
                            <label style={labelStyle}>Sort Order</label>
                            <input type="number" style={fieldStyle} value={editForm.sort_order ?? 0} onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <label style={labelStyle}>Active</label>
                            <input type="checkbox" checked={editForm.active ?? true} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} style={{ width: 18, height: 18, cursor: "pointer" }} />
                          </div>
                          <div className="st-edit-actions">
                            <button type="button" className="st-btn" onClick={saveEdit}>Save</button>
                            <button type="button" className="st-btn-secondary" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={svc.id}>
                      <td>{svc.sort_order}</td>
                      <td style={{ fontSize: 20 }}>{svc.icon}</td>
                      <td style={{ fontWeight: 500 }}>{svc.title}</td>
                      <td>{svc.price_display || "—"}</td>
                      <td>
                        <span className={`st-badge ${svc.is_active ? "st-badge-active" : "st-badge-inactive"}`}>
                          {svc.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="st-toggle" onClick={() => toggleServiceActive(svc)}>
                            {svc.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="st-toggle" onClick={() => startEdit(svc)}>Edit</button>
                          <button className="st-btn-danger" onClick={() => deleteService(svc.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---- TAB 2: Promotions ---- */}
      {tab === 1 && (
        <>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
            <button className="st-btn" onClick={() => setShowPromoForm(true)}>+ Create Promo Code</button>
          </div>

          {showPromoForm && (
            <form className="st-form" onSubmit={createPromo}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", marginBottom: "20px", color: "#1a1a1a" }}>New Promo Code</div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Code</label>
                  <input style={fieldStyle} value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} required />
                </div>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <div className="st-radio-group" style={{ marginTop: 8 }}>
                    <label className="st-radio-label">
                      <input type="radio" name="discount_type" value="percent" checked={newPromo.discount_type === "percent"} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })} />
                      Percent Off
                    </label>
                    <label className="st-radio-label">
                      <input type="radio" name="discount_type" value="flat" checked={newPromo.discount_type === "flat"} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })} />
                      Flat Amount Off
                    </label>
                  </div>
                </div>
              </div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Discount Value {newPromo.discount_type === "percent" ? "(%)" : "($)"}</label>
                  <input type="number" min="0" step="1" style={fieldStyle} placeholder={newPromo.discount_type === "percent" ? "e.g. 20" : "e.g. 50"} value={newPromo.discount_value} onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Max Uses</label>
                  <input type="number" min="1" style={fieldStyle} placeholder="Unlimited if empty" value={newPromo.max_uses} onChange={(e) => setNewPromo({ ...newPromo, max_uses: e.target.value })} />
                </div>
              </div>
              <div className="st-form-row">
                <div>
                  <label style={labelStyle}>Expires</label>
                  <input type="date" style={fieldStyle} value={newPromo.expires_at} onChange={(e) => setNewPromo({ ...newPromo, expires_at: e.target.value })} />
                </div>
                <div />
              </div>
              <div className="st-form-actions">
                <button type="submit" className="st-btn">Create Promo</button>
                <button type="button" className="st-btn-secondary" onClick={() => setShowPromoForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {promos.length === 0 ? (
            <div className="st-empty">No promo codes yet. Create one to get started.</div>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Uses / Max</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 600, color: "#7a8c6e", letterSpacing: "1px" }}>{p.code}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.discount_type === "percent" ? "Percent" : "Flat"}</td>
                    <td>{p.discount_type === "percent" ? `${p.discount_value}%` : `$${p.discount_value}`}</td>
                    <td>{p.uses || 0} / {p.max_uses ?? "∞"}</td>
                    <td>
                      <span className={`st-badge ${p.is_active ? "st-badge-active" : "st-badge-inactive"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <button className="st-toggle" onClick={() => togglePromoActive(p)}>
                        {p.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---- TAB 3: Business Info ---- */}
      {tab === 2 && (
        <div className="st-info-card">
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}>Business Information</div>
          <div className="st-info-row"><span className="st-info-label">Business</span><span className="st-info-value">RoRo Mode</span></div>
          <div className="st-info-row"><span className="st-info-label">Owner</span><span className="st-info-value">Aurora Leonard</span></div>
          <div className="st-info-row"><span className="st-info-label">Email</span><span className="st-info-value">itsroromode@gmail.com</span></div>
          <div className="st-info-row"><span className="st-info-label">Phone</span><span className="st-info-value">(662) 479-4007 (AI Receptionist)</span></div>
          <div className="st-info-row"><span className="st-info-label">Location</span><span className="st-info-value">Greater Phoenix, Arizona</span></div>
          <div className="st-info-row"><span className="st-info-label">Website</span><span className="st-info-value">roromode.com</span></div>
          <div className="st-info-row"><span className="st-info-label">Hours</span><span className="st-info-value">Mon-Fri 9AM-5PM, Sat 10AM-3PM</span></div>
          <div className="st-info-row"><span className="st-info-label">Payment</span><span className="st-info-value">Cash, Venmo, Zelle, Credit Card</span></div>
          <div className="st-info-row" style={{ borderBottom: "none" }}>
            <span className="st-info-label">Account</span>
            <span className="st-info-value">
              <button onClick={async () => {
                const { error } = await supabase.auth.resetPasswordForEmail("itsroromode@gmail.com");
                if (error) alert("Error: " + error.message);
                else alert("Password reset email sent to itsroromode@gmail.com!");
              }} style={{
                background: "none", border: "1px solid #e8e0d4", padding: "6px 16px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", color: "#7a8c6e",
              }}>
                Change Password
              </button>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
