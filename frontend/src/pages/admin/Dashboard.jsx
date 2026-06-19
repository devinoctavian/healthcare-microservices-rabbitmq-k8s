import { useEffect, useState } from "react";
import { doctorAPI, queueAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "../../components/Dashboard.css";

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({ totalQueues: 0, waitingQueues: 0 });

  useEffect(() => {
    doctorAPI.get("/doctors").then(res => setDoctors(res.data)).catch(() => { });
    queueAPI.get("/queues/stats").then(res => setStats(res.data)).catch(() => { });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Selamat datang di panel admin Puskesmas EAI.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Dokter</h3>
            <p className="stat-value">{doctors.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Antrian</h3>
            <p className="stat-value">{stats.totalQueues}</p>
          </div>

          <div className="stat-card">
            <h3>Antrian Menunggu</h3>
            <p className="stat-value">{stats.waitingQueues}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

