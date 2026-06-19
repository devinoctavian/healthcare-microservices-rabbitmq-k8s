import { useEffect, useState } from "react";
import { doctorAPI, queueAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "../../components/Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function DaftarAntrian() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name: "",
    email: "",
    phone: "",
    doctor_id: "",
    doctor_name: "",
    schedule_date: "",
  });

  useEffect(() => {
    doctorAPI.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await queueAPI.post("/queues", {
        patient_name: form.patient_name,
        doctor_id: form.doctor_id,
        doctor_name: form.doctor_name,
        schedule_date: form.schedule_date,
      });
      alert("Berhasil mendaftar antrian!");
      navigate("/patient");
    } catch (err) {
      alert("Gagal mendaftar antrian");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Daftar Antrian</h1>
          <p>Silahkan isi form di bawah ini untuk mengambil nomor antrian.</p>
        </div>

        <div className="form-card">
          <form onSubmit={submit} className="modern-form">
            <div className="form-group">
              <label>Nama Pasien</label>
              <input
                placeholder="Nama Lengkap"
                required
                onChange={e => setForm({ ...form, patient_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                required
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>No Handphone</label>
              <input
                placeholder="0812345678"
                required
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Pilih Dokter</label>
              <select
                required
                onChange={e => {
                  const d = doctors.find(x => x.id == e.target.value);
                  if (d) setForm({ ...form, doctor_id: d.id, doctor_name: d.name });
                }}
              >
                <option value="">-- Pilih Dokter --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tanggal Kunjungan</label>
              <input
                type="date"
                required
                onChange={e => setForm({ ...form, schedule_date: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary">Ambil Antrian</button>
          </form>
        </div>
      </div>
    </div>
  );
}

