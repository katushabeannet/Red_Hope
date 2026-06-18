import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Chatbot from "./pages/Chatbot";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCamps from "./pages/AdminCamps";
import AdminDonors from "./pages/AdminDonors";
import NotFound from "./pages/NotFound";
import MyProfile from "./pages/MyProfile";
import PersonalizedCampaign from "./pages/PersonalizedCampaign";
import Notifications from "./pages/Notifications";
import CampCheckin from "./pages/CampCheckin";
import AdminCampaignHistory from "./pages/AdminCampaignHistory";
import AdminSMS from "./pages/AdminSMS";
import AdminWhatsApp from "./pages/AdminWhatsApp";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
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

        <Route path="/camp-checkin/:campId" element={<CampCheckin />} />
        <Route
          path="/campaign-history"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCampaignHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-sms"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminSMS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-whatsapp"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminWhatsApp />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/personalized-campaign"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PersonalizedCampaign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["DONOR", "ADMIN"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;