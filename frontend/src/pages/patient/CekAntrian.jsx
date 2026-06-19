import { useState } from "react";
import { queueAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "../../components/Dashboard.css";

export default function CekAntrian() {
  const [name, setName] = useState("");
  const [data, setData] = useState([]);
  const [searched, setSearched] = useState(false);

  const cek = async () => {
    try {
      const res = await queueAPI.get(`/queues/patient/${name}`);
      setData(res.data);
    } catch (e) {
      setData([]);
    }
    setSearched(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Cek Status Antrian</h1>
          <p>Cari antrian berdasarkan nama pasien.</p>
        </div>

        <div className="form-card" style={{ marginBottom: "30px" }}>
          <div className="modern-form" style={{ gridTemplateColumns: "1fr auto" }}>
            <div className="form-group">
              <input
                placeholder="Masukkan Nama Pasien..."
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cek()}
              />
            </div>
            <button onClick={cek} className="btn-primary" style={{ height: "46px", marginTop: "auto" }}>
              Cari Antrian
            </button>
          </div>
        </div>

        {searched && (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Nama Pasien</th>
                  <th>Dokter</th>
                  <th>Tanggal</th>
                  <th>No Antrian</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center" }}>Tidak ditemukan data antrian untuk "{name}"</td></tr>
                ) : (
                  data.map(q => (
                    <tr key={q.id}>
                      <td>{q.patient_name}</td>
                      <td>{q.doctor_name}</td>
                      <td>{q.schedule_date}</td>
                      <td style={{ fontWeight: "bold", fontSize: "1.1em" }}>#{q.queue_number}</td>
                      <td><span className="status-badge menunggu">Menunggu</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
