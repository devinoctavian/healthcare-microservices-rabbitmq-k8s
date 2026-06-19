import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import PatientLogin from "./pages/PatientLogin";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import DoctorCRUD from "./pages/admin/DoctorCRUD";

import PatientDashboard from "./pages/patient/Dashboard";
import DaftarAntrian from "./pages/patient/DaftarAntrian";
import CekAntrian from "./pages/patient/CekAntrian";

// Helper to decode JWT token (without library)
const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, ... }
  } catch {
    return null;
  }
};

const isAdmin = () => getUser()?.role === "admin";
const isPatient = () => getUser()?.role === "patient";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Login />} />
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN - only admins allowed */}
      <Route
        path="/admin"
        element={isAdmin() ? <AdminDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/doctors"
        element={isAdmin() ? <DoctorCRUD /> : <Navigate to="/" />}
      />

      {/* PATIENT - only patients allowed */}
      <Route
        path="/patient"
        element={isPatient() ? <PatientDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/patient/daftar"
        element={isPatient() ? <DaftarAntrian /> : <Navigate to="/" />}
      />
      <Route
        path="/patient/antrian"
        element={isPatient() ? <CekAntrian /> : <Navigate to="/" />}
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

