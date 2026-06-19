import { useEffect, useState } from "react";
import { patientAPI, doctorAPI, queueAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "../../components/Dashboard.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    patientAPI.get("/me").then(r => setProfile(r.data)).catch(() => { });
    doctorAPI.get("/doctors").then(r => setDoctors(r.data)).catch(() => { });
    queueAPI.get("/queues/me").then(r => setQueues(r.data)).catch(() => { });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />

      <div className="main-content">
        <div className="dashboard-header">
          <h1>Halo, {profile.name} 👋</h1>
          <p>Selamat datang di dashboard pasien.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Antrian Saya</h3>
            <p className="stat-value">{queues.length}</p>
          </div>
          <div className="stat-card">
            <h3>Dokter Tersedia</h3>
            <p className="stat-value">{doctors.length}</p>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: "30px" }}>
          <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Riwayat Antrian</h3>
            <Link to="/patient/daftar" className="btn-primary" style={{ textDecoration: "none" }}>Daftar Baru</Link>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Dokter</th>
                <th>Tanggal</th>
                <th>No Antrian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queues.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic" }}>Belum ada antrian</td>
                </tr>
              ) : (
                queues.map(q => (
                  <tr key={q.id}>
                    <td>{q.doctor_name}</td>
                    <td>{q.schedule_date}</td>
                    <td><span style={{ fontWeight: "bold" }}>#{q.queue_number}</span></td>
                    <td>
                      <span className={`status-badge ${q.status?.toLowerCase() || 'waiting'}`}>
                        {q.status || 'Waiting'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
