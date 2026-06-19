import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ role }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const menuItems =
        role === "admin"
            ? [
                { path: "/admin", label: "Dashboard", icon: "📊" },
                { path: "/admin/doctors", label: "Kelola Dokter", icon: "👨‍⚕️" },
            ]
            : [
                { path: "/patient", label: "Dashboard", icon: "🏠" },
                { path: "/patient/daftar", label: "Daftar Antrian", icon: "📝" },
                { path: "/patient/antrian", label: "Cek Antrian", icon: "🔍" },
            ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                </div>
                <h2>Puskesmas EAI</h2>
            </div>

            <div className="sidebar-menu">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                        style={{ fontWeight: location.pathname === item.path ? "bold" : "normal" }}
                    >
                        <i>{item.icon}</i>
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    Sign Out
                </button>
            </div>
        </div>
    );
}
