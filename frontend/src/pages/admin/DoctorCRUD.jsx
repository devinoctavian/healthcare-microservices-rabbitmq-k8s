import { useEffect, useState } from "react";
import { doctorAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "../../components/Dashboard.css";

export default function DoctorCRUD() {
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    schedule: "",
  });

  const load = async () => {
    const res = await doctorAPI.get("/doctors");
    setDoctors(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (editingId) {
      await doctorAPI.put(`/doctors/${editingId}`, form);
    } else {
      await doctorAPI.post("/doctors", form);
    }

    setForm({ name: "", specialization: "", schedule: "" });
    setEditingId(null);
    load();
  };

  const edit = doctor => {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      schedule: doctor.schedule,
    });
  };

  const del = async id => {
    await doctorAPI.delete(`/doctors/${id}`);
    load();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="dashboard-header">
          <h1>Kelola Dokter</h1>
          <p>Manajemen data dokter dan jadwal praktik.</p>
        </div>

        <div style={{ display: "grid", gap: "30px" }}>
          <div className="form-card">
            <h3 style={{ marginBottom: "20px" }}>{editingId ? "Edit Dokter" : "Tambah Dokter Baru"}</h3>
            <div className="modern-form">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  placeholder="Contoh: Dr. Budi Santoso"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Spesialisasi</label>
                <input
                  placeholder="Contoh: Penyakit Dalam"
                  value={form.specialization}
                  onChange={e => setForm({ ...form, specialization: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Jadwal Praktik</label>
                <input
                  type="date"
                  value={form.schedule}
                  onChange={e => setForm({ ...form, schedule: e.target.value })}
                />
              </div>
              <button className="btn-primary" onClick={submit}>
                {editingId ? "Simpan Perubahan" : "Tambah Dokter"}
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Spesialis</th>
                  <th>Jadwal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.specialization}</td>
                    <td>{d.schedule}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => edit(d)}>Edit</button>
                        <button className="btn-delete" onClick={() => del(d.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


{/* <td>{new Date(d.schedule).toLocaleDateString("id-ID")}</td> */ }