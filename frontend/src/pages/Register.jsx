import "../components/Auth.css";
import { useState } from "react";
import { patientAPI } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await patientAPI.post("/patients/register", form);

      // 🔐 simpan token
      localStorage.setItem("token", res.data.token);

      // 🚀 langsung ke dashboard pasien
      window.location.href = "/patient";
    } catch (err) {
      alert(err.response?.data?.msg || "Register gagal");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <p className="auth-logo-title">Puskesmas EAI</p>
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us for better healthcare management</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <input
              placeholder="Full Name"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <input
              placeholder="Email Address"
              type="email"
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <input
              placeholder="Phone Number"
              type="tel"
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="auth-button" onClick={submit}>
            Create Account
          </button>
        </div>

        <div className="auth-footer">
          Already have an account?
          <a href="/login" className="auth-link">Sign In</a>
        </div>
      </div>
    </div>
  );
}
