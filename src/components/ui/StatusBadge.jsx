const COLORS = {
  pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  accepted: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  scheduled: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  in_progress: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  completed: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  declined: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  draft: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
  sent: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  paid: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  overdue: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  unread: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  read: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.draft;
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      borderRadius: "100px",
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {status?.replace("_", " ")}
    </span>
  );
}
