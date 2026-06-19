import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Process from "./pages/Process";
import Campaigns from "./pages/Campaigns";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Chatbot from "./pages/Chatbot";

import DonorDashboard from "./pages/DonorDashboard";
import MyProfile from "./pages/MyProfile";
import Notifications from "./pages/Notifications";
import BloodDemandAlerts from "./pages/BloodDemandAlerts";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCamps from "./pages/AdminCamps";
import AdminDonors from "./pages/AdminDonors";
import PersonalizedCampaign from "./pages/PersonalizedCampaign";
import AdminCampaignHistory from "./pages/AdminCampaignHistory";
import AdminSMS from "./pages/AdminSMS";
import AdminWhatsApp from "./pages/AdminWhatsApp";
import AdminBloodDemand from "./pages/AdminBloodDemand";

import CampCheckin from "./pages/CampCheckin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Standalone authentication pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

      {/* Public website pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/process" element={<Process />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Route>

      {/* Protected dashboard pages */}
      <Route element={<AuthLayout />}>
        {/* Donor routes */}
        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["DONOR"]}>
              <DonorDashboard />
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

        <Route
          path="/blood-demand-alerts"
          element={
            <ProtectedRoute allowedRoles={["DONOR", "ADMIN"]}>
              <BloodDemandAlerts />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["DONOR", "ADMIN"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
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
          path="/personalized-campaign"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PersonalizedCampaign />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/admin-blood-demand"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminBloodDemand />
            </ProtectedRoute>
          }
        />

        <Route
          path="/camp-checkin/:campId"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CampCheckin />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;