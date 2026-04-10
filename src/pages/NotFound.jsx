import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#faf8f4",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      textAlign: "center",
    }}>
      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "72px",
        fontWeight: 400,
        color: "#1a1a1a",
        marginBottom: "16px",
      }}>
        404
      </h1>
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "28px",
        fontWeight: 400,
        color: "#1a1a1a",
        marginBottom: "12px",
      }}>
        Page not found
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "16px",
        color: "#6b6560",
        lineHeight: 1.7,
        marginBottom: "32px",
      }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#f5f0e8",
        background: "#1a1a1a",
        padding: "14px 32px",
        textDecoration: "none",
        transition: "background 0.3s",
      }}>
        Back to Home
      </Link>
    </div>
  );
}
