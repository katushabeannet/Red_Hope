import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";

import MainLayout  from "./layouts/MainLayout";
import AuthLayout  from "./layouts/AuthLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ── Public pages ── */
import Home      from "./pages/public/Home";
import About     from "./pages/public/About";
import Process   from "./pages/public/Process";
import Campaigns from "./pages/public/Campaigns";
import Contact   from "./pages/public/Contact";
import NotFound  from "./pages/public/NotFound";

/* ── Auth pages ── */
import Login          from "./pages/auth/Login";
import Register       from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

/* ── Chatbot ── */
import Chatbot from "./pages/chatbot/Chatbot";

/* ── Admin pages ── */
import AdminDashboard       from "./pages/admin/AdminDashboard";
import AdminDonors          from "./pages/admin/AdminDonors";
import AdminCamps           from "./pages/admin/AdminCamps";
import AdminBloodDemand     from "./pages/admin/AdminBloodDemand";
import AdminSMS             from "./pages/admin/AdminSMS";
import AdminWhatsApp        from "./pages/admin/AdminWhatsApp";
import AdminCampaignHistory from "./pages/admin/AdminCampaignHistory";
import PersonalizedCampaign from "./pages/admin/PersonalizedCampaign";
import CampCheckin                from "./pages/admin/CampCheckin";
import WalkInDonorRegistration   from "./pages/admin/WalkInDonorRegistration";
import Notifications             from "./pages/admin/Notifications";

/* ── Donor pages ── */
import DonorDashboard    from "./pages/donor/DonorDashboard";
import MyProfile         from "./pages/donor/MyProfile";
import BloodDemandAlerts from "./pages/donor/BloodDemandAlerts";

function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Standalone auth pages */}
      <Route path="/login"                        element={<Login />} />
      <Route path="/register"                     element={<Register />} />
      <Route path="/forgot-password"              element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token"   element={<ResetPassword />} />

      {/* Public website pages */}
      <Route element={<MainLayout />}>
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<About />} />
        <Route path="/process"    element={<Process />} />
        <Route path="/campaigns"  element={<Campaigns />} />
        <Route path="/contact"    element={<Contact />} />
        <Route path="/chatbot"    element={<Chatbot />} />
      </Route>

      {/* Protected dashboard pages */}
      <Route element={<AuthLayout />}>

        {/* ── Donor routes ── */}
        <Route path="/donor-dashboard" element={
          <ProtectedRoute allowedRoles={["DONOR"]}><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/my-profile" element={
          <ProtectedRoute allowedRoles={["DONOR"]}><MyProfile /></ProtectedRoute>
        } />
        <Route path="/blood-demand-alerts" element={
          <ProtectedRoute allowedRoles={["DONOR", "ADMIN"]}><BloodDemandAlerts /></ProtectedRoute>
        } />

        {/* ── Shared routes ── */}
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={["DONOR", "ADMIN"]}><Notifications /></ProtectedRoute>
        } />

        {/* ── Admin routes ── */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin-camps" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminCamps /></ProtectedRoute>
        } />
        <Route path="/admin-donors" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminDonors /></ProtectedRoute>
        } />
        <Route path="/personalized-campaign" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><PersonalizedCampaign /></ProtectedRoute>
        } />
        <Route path="/campaign-history" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminCampaignHistory /></ProtectedRoute>
        } />
        <Route path="/admin-sms" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminSMS /></ProtectedRoute>
        } />
        <Route path="/admin-whatsapp" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminWhatsApp /></ProtectedRoute>
        } />
        <Route path="/admin-blood-demand" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><AdminBloodDemand /></ProtectedRoute>
        } />
        <Route path="/camp-checkin/:campId" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><CampCheckin /></ProtectedRoute>
        } />
        <Route path="/walkin-donor" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><WalkInDonorRegistration /></ProtectedRoute>
        } />

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;
