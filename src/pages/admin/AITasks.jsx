import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/ui/Toast";

const FILTERS = ["all", "pending", "in_progress", "done", "overdue"];
const TASK_TYPES = ["Follow Up", "Outreach", "Reminder", "Consultation Prep"];

function isOverdue(task) {
  return task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
}

export default function AITasks() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    title: "",
    description: "",
    type: "Follow Up",
    due_date: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const [tasksRes, clientsRes] = await Promise.all([
      supabase.from("tasks").select("*, clients(id, name, email, phone)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name, email, phone").order("name"),
    ]);
    setTasks(tasksRes.data || []);
    setClients(clientsRes.data || []);
  }

  async function createTask(e) {
    e.preventDefault();
    if (!form.title) {
      setToast({ message: "Title is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        client_id: form.client_id || null,
        title: form.title,
        description: form.description || null,
        type: form.type,
        due_date: form.due_date || null,
        status: "pending",
      });
      if (error) {
        setToast({ message: error.message, type: "error" });
        return;
      }
      setToast({ message: "Task created!", type: "success" });
      setForm({ client_id: "", title: "", description: "", type: "Follow Up", due_date: "" });
      setShowCreate(false);
      loadTasks();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    const updates = { status };
    if (status === "done") updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: `Task ${status === "done" ? "completed" : "updated"}!`, type: "success" });
    loadTasks();
  }

  const filtered = filter === "all"
    ? tasks
    : filter === "overdue"
      ? tasks.filter(isOverdue)
      : tasks.filter((t) => t.status === filter);

  const overdueCount = tasks.filter(isOverdue).length;

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
        .at-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .at-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; }
        .at-count { font-size: 14px; color: #6b6560; margin-left: 12px; font-weight: 400; font-family: 'DM Sans', sans-serif; }
        .at-btn {
          padding: 10px 20px; background: #1a1a1a; color: #f5f0e8; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .at-btn:hover { background: #7a8c6e; }
        .at-btn-secondary {
          padding: 10px 20px; background: white; color: #2a2723; border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .at-btn-secondary:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .at-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .at-filter {
          padding: 8px 16px; border: 1px solid #e8e0d4; background: white;
          font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1px;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s; color: #6b6560;
        }
        .at-filter:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .at-filter.active { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .at-form { background: white; border: 1px solid #e8e0d4; padding: 32px; margin-bottom: 24px; max-width: 800px; }
        .at-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .at-form-full { margin-bottom: 16px; }
        .at-form-actions { display: flex; gap: 12px; margin-top: 8px; }
        .at-card {
          background: white; border: 1px solid #e8e0d4; padding: 24px; margin-bottom: 12px;
          transition: all 0.2s;
        }
        .at-card:hover { border-color: #d4cdc2; }
        .at-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .at-card-title { font-size: 16px; font-weight: 500; color: #1a1a1a; }
        .at-card-client { font-size: 13px; color: #7a8c6e; text-decoration: none; font-weight: 500; }
        .at-card-client:hover { text-decoration: underline; }
        .at-card-desc { font-size: 14px; color: #6b6560; margin: 8px 0 12px; line-height: 1.5; }
        .at-card-meta { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
        .at-type-badge {
          display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase; background: #f5f0e8; color: #6b6560;
        }
        .at-due { font-size: 13px; color: #6b6560; }
        .at-due-overdue { color: #dc2626; font-weight: 500; }
        .at-status-btns { display: flex; gap: 6px; }
        .at-status-btn {
          padding: 5px 12px; border: 1px solid #e8e0d4; background: white; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.5px;
          text-transform: uppercase; transition: all 0.2s; color: #6b6560;
        }
        .at-status-btn:hover { border-color: #7a8c6e; color: #7a8c6e; }
        .at-status-btn.current { background: #1a1a1a; color: #f5f0e8; border-color: #1a1a1a; }
        .at-quick-actions { display: flex; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f5f0e8; }
        .at-quick-link {
          font-size: 13px; text-decoration: none; color: #6b6560; transition: color 0.2s;
        }
        .at-quick-link:hover { color: #7a8c6e; }
        .at-done-btn {
          padding: 6px 16px; background: #e8f5e2; color: #3d7a2d; border: 1px solid #a7f3d0;
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer;
        }
        .at-done-btn:hover { background: #d1fae5; }
        .at-empty { padding: 60px; text-align: center; color: #6b6560; background: white; border: 1px solid #e8e0d4; }
        .at-callout {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
          background: #f5f0e8; font-size: 13px; color: #6b6560; margin-bottom: 20px;
          text-decoration: none; border: 1px solid #e8e0d4; transition: all 0.2s;
        }
        .at-callout:hover { border-color: #7a8c6e; color: #7a8c6e; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="at-header">
        <h1 className="at-title">
          Tasks
          <span className="at-count">{tasks.length} total{overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}</span>
        </h1>
        <button className="at-btn" onClick={() => setShowCreate(true)}>+ New Task</button>
      </div>

      <a
        className="at-callout"
        href="https://ionos.ai-voice-receptionist.com/customer/C_IO_O9Z8NGHE/sessions"
        target="_blank"
        rel="noopener noreferrer"
      >
        View AI Call Logs
      </a>

      {showCreate && (
        <form className="at-form" onSubmit={createTask}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", marginBottom: "20px", color: "#1a1a1a" }}>New Task</div>
          <div className="at-form-row">
            <div>
              <label style={labelStyle}>Client</label>
              <select style={fieldStyle} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={fieldStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="at-form-full">
            <label style={labelStyle}>Title</label>
            <input style={fieldStyle} required placeholder="e.g. Follow up on consultation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="at-form-full">
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} placeholder="Additional details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="at-form-row">
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" style={fieldStyle} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div />
          </div>
          <div className="at-form-actions">
            <button type="submit" disabled={saving} className="at-btn" style={{ opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Create Task"}</button>
            <button type="button" className="at-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="at-filters">
        {FILTERS.map((f) => (
          <button key={f} className={`at-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "overdue" ? `Overdue (${overdueCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="at-empty">No tasks {filter !== "all" ? `matching "${filter.replace("_", " ")}"` : "yet"}. Create one to get started.</div>
      ) : (
        filtered.map((task) => {
          const client = task.clients;
          const overdue = isOverdue(task);
          return (
            <div key={task.id} className="at-card">
              <div className="at-card-header">
                <div>
                  {client && (
                    <Link to={`/admin/clients/${client.id}`} className="at-card-client">{client.name}</Link>
                  )}
                  <div className="at-card-title">{task.title}</div>
                </div>
                {task.status !== "done" && (
                  <button className="at-done-btn" onClick={() => updateStatus(task.id, "done")}>Mark Done</button>
                )}
              </div>

              {task.description && <div className="at-card-desc">{task.description}</div>}

              <div className="at-card-meta">
                <span className="at-type-badge">{task.type}</span>
                {task.due_date && (
                  <span className={`at-due ${overdue ? "at-due-overdue" : ""}`}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                    {overdue && " (Overdue)"}
                  </span>
                )}
                <div className="at-status-btns">
                  {["pending", "in_progress", "done"].map((s) => (
                    <button
                      key={s}
                      className={`at-status-btn ${task.status === s ? "current" : ""}`}
                      onClick={() => updateStatus(task.id, s)}
                    >
                      {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {client && (
                <div className="at-quick-actions">
                  {client.phone && (
                    <>
                      <a className="at-quick-link" href={`tel:${client.phone}`}>Call</a>
                      <a className="at-quick-link" href={`sms:${client.phone}`}>Text</a>
                    </>
                  )}
                  {client.email && (
                    <a className="at-quick-link" href={`mailto:${client.email}`}>Email</a>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}
