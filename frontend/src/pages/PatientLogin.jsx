import { useState } from "react";
import { patientAPI } from "../services/api";
import "../components/Auth.css";

export default function PatientLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submit = async () => {
        try {
            const res = await patientAPI.post("/patients/login", { email, password });
            localStorage.setItem("token", res.data.token);
            window.location = "/patient";
        } catch (err) {
            setError(err.response?.data?.msg || "Login gagal. Cek email / password");
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
                    <h2>Login Pasien</h2>
                    <p>Masuk ke akun pasien Anda</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="auth-form">
                    <div className="input-group">
                        <input
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email Address"
                            type="email"
                            autoFocus
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>
                    <button className="auth-button" onClick={submit}>
                        Sign In
                    </button>
                </div>

                <div className="auth-footer">
                    Belum punya akun?
                    <a href="/register" className="auth-link">Daftar</a>
                </div>
                <div className="auth-footer" style={{ marginTop: "10px" }}>
                    <a href="/" className="auth-link">← Login sebagai Admin</a>
                </div>
            </div>
        </div>
    );
}
