import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chatbot from "./pages/Chatbot";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCamps from "./pages/AdminCamps";
import AdminDonors from "./pages/AdminDonors";
import NotFound from "./pages/NotFound";
import MyProfile from "./pages/MyProfile";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chatbot" element={<Chatbot />} />

        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["DONOR"]}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-camps"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCamps />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-donors"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDonors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute allowedRoles={["DONOR"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />        

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;