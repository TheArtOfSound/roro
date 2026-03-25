import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase.from("clients").select("*, bookings(id)").order("created_at", { ascending: false });
    setClients(data || []);
  }

  async function addClient(e) {
    e.preventDefault();
    const { error } = await supabase.from("clients").insert(newClient);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Client added!", type: "success" });
    setNewClient({ name: "", email: "", phone: "" });
    setShowAdd(false);
    loadClients();
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .cl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .cl-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .cl-actions { display: flex; gap: 12px; align-items: center; }
        .cl-search {
          padding: 10px 16px; border: 1px solid #e8e0d4; font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none; min-width: 220px; background: white;
        }
        .cl-search:focus { border-color: #7a8c6e; }
        .cl-add-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .cl-add-btn:hover { background: #7a8c6e; }
        .cl-table { width: 100%; background: white; border: 1px solid #e8e0d4; border-collapse: collapse; }
        .cl-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6560; border-bottom: 1px solid #e8e0d4; font-weight: 500;
        }
        .cl-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f5f0e8; color: #2a2723; }
        .cl-table tr:hover { background: #faf8f4; }
        .cl-table a { color: #7a8c6e; text-decoration: none; font-weight: 500; }
        .cl-table a:hover { text-decoration: underline; }
        .cl-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .cl-modal {
          background: white; border: 1px solid #e8e0d4; padding: 32px; width: 100%; max-width: 440px;
        }
        .cl-modal h3 {
          font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; margin-bottom: 24px;
        }
        .cl-modal-field { margin-bottom: 16px; }
        .cl-modal-field label {
          display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: #6b6560; margin-bottom: 6px;
        }
        .cl-modal-field input {
          width: 100%; padding: 12px 14px; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
        }
        .cl-modal-field input:focus { border-color: #7a8c6e; }
        .cl-modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .cl-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="cl-header">
        <h1 className="cl-title">Clients</h1>
        <div className="cl-actions">
          <input className="cl-search" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="cl-add-btn" onClick={() => setShowAdd(true)}>+ Add Client</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cl-empty">No clients yet. Add one or convert a message to create your first client.</div>
      ) : (
        <table className="cl-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Added</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/admin/clients/${c.id}`}>{c.name}</Link></td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.bookings?.length || 0}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <div className="cl-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Client</h3>
            <form onSubmit={addClient}>
              <div className="cl-modal-field">
                <label>Name</label>
                <input required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              </div>
              <div className="cl-modal-field">
                <label>Email</label>
                <input required type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              </div>
              <div className="cl-modal-field">
                <label>Phone</label>
                <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
              </div>
              <div className="cl-modal-actions">
                <button type="submit" className="cl-add-btn">Save Client</button>
                <button type="button" className="cl-add-btn" style={{ background: "transparent", color: "#6b6560", border: "1px solid #e8e0d4" }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
