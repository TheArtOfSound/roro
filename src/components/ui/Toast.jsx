import { useState, useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "error" ? "#fee2e2" : "#d1fae5";
  const color = type === "error" ? "#991b1b" : "#065f46";
  const border = type === "error" ? "#fecaca" : "#a7f3d0";

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "14px 24px", background: bg, color, border: `1px solid ${border}`,
      fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: "4px",
      animation: "fadeInDown 0.3s ease",
    }}>
      {message}
    </div>
  );
}
