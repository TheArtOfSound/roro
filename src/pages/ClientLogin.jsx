import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/client");
    }
  };

  return (
    <>
      <style>{`
        .cl-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faf8f4;
          font-family: 'DM Sans', sans-serif;
          padding: 20px;
        }
        .cl-login-card {
          width: 100%;
          max-width: 400px;
          background: white;
          border: 1px solid #e8e0d4;
          padding: 48px 40px;
        }
        .cl-login-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 2px;
          text-align: center;
          margin-bottom: 24px;
          color: #1a1a1a;
        }
        .cl-login-logo span { color: #7a8c6e; }
        .cl-login-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          text-align: center;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .cl-login-subtitle {
          text-align: center;
          font-size: 14px;
          color: #6b6560;
          margin-bottom: 36px;
          line-height: 1.6;
        }
        .cl-login-field { margin-bottom: 20px; }
        .cl-login-field label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6b6560;
          margin-bottom: 8px;
        }
        .cl-login-field input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #e8e0d4;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s;
          background: #faf8f4;
          box-sizing: border-box;
        }
        .cl-login-field input:focus { border-color: #7a8c6e; }
        .cl-login-btn {
          width: 100%;
          padding: 16px;
          background: #7a8c6e;
          color: #f5f0e8;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 8px;
        }
        .cl-login-btn:hover { background: #6b7d60; }
        .cl-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cl-login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 20px;
          border-radius: 2px;
        }
        .cl-login-back {
          display: block;
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #6b6560;
          text-decoration: none;
        }
        .cl-login-back:hover { color: #7a8c6e; }
      `}</style>
      <div className="cl-login-page">
        <div className="cl-login-card">
          <div className="cl-login-logo">Ro<span>Ro</span> Mode</div>
          <div className="cl-login-heading">Welcome back</div>
          <div className="cl-login-subtitle">
            Track your project, view invoices, and stay connected with RoRo Mode.
          </div>
          {error && <div className="cl-login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="cl-login-field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="cl-login-field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="cl-login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <a href="#/" className="cl-login-back">&larr; Back to website</a>
        </div>
      </div>
    </>
  );
}
