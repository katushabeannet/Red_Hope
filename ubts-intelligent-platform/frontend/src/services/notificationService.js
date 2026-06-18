import api from "../api/axios";

export const getMyNotifications = async () => {
  const response = await api.get("/notifications/my/");
  return response.data;
};

export const generateMyNotifications = async () => {
  const response = await api.post("/notifications/generate-my/");
  return response.data;
};

export const getAdminNotifications = async () => {
  const response = await api.get("/notifications/admin/");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/read/`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notifications/read-all/");
  return response.data;
};

export const blastCampaignNotification = async ({ donor_ids, title, message, campaign_performance_id }) => {
  const response = await api.post("/notifications/admin/campaign-blast/", {
    donor_ids,
    title,
    message,
    ...(campaign_performance_id ? { campaign_performance_id } : {}),
  });
  return response.data;
};

export const getAdminSMSSettings = async () => {
  const response = await api.get("/notifications/admin/sms/settings/");
  return response.data;
};

export const toggleAdminSMS = async (sms_enabled) => {
  const response = await api.post("/notifications/admin/sms/toggle/", { sms_enabled });
  return response.data;
};

export const sendAdminSMSTest = async ({ phone_number, message }) => {
  const response = await api.post("/notifications/admin/sms/test/", { phone_number, message });
  return response.data;
};

export const getAdminSMSLogs = async ({ page = 1, page_size = 30, search = "", status = "" } = {}) => {
  const params = { page, page_size };
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get("/notifications/admin/sms/logs/", { params });
  return response.data;
};

export const sendBulkSMS = async ({ donor_ids, message }) => {
  const response = await api.post("/notifications/admin/sms/bulk/", { donor_ids, message });
  return response.data;
};

// WhatsApp
export const getAdminWhatsAppSettings = async () => {
  const response = await api.get("/notifications/admin/whatsapp/settings/");
  return response.data;
};

export const toggleAdminWhatsApp = async (whatsapp_enabled) => {
  const response = await api.post("/notifications/admin/whatsapp/toggle/", { whatsapp_enabled });
  return response.data;
};

export const sendAdminWhatsAppTest = async ({ phone_number, message, use_template, template_name }) => {
  const response = await api.post("/notifications/admin/whatsapp/test/", {
    phone_number,
    message,
    use_template: use_template || false,
    template_name: template_name || "",
  });
  return response.data;
};

export const getAdminWhatsAppLogs = async ({ page = 1, page_size = 30, search = "", status = "" } = {}) => {
  const params = { page, page_size };
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get("/notifications/admin/whatsapp/logs/", { params });
  return response.data;
};

export const sendBulkWhatsApp = async ({ donor_ids, message, use_template, template_name }) => {
  const response = await api.post("/notifications/admin/whatsapp/bulk/", {
    donor_ids,
    message: message || "",
    use_template: use_template || false,
    template_name: template_name || "",
  });
  return response.data;
};

export const updateDonorWhatsAppConsent = async ({ whatsapp_consent, whatsapp_number }) => {
  const response = await api.post("/notifications/whatsapp/consent/", {
    whatsapp_consent,
    whatsapp_number,
  });
  return response.data;
};

// Blood Demand Alerts
export const createBloodDemandAlert = async (data) => {
  const response = await api.post("/notifications/admin/blood-demand-alerts/", data);
  return response.data;
};

export const getBloodDemandAlertsList = async ({ page = 1, page_size = 20, status = "", blood_group = "", urgency_level = "", search = "" } = {}) => {
  const params = { page, page_size };
  if (status) params.status = status;
  if (blood_group) params.blood_group = blood_group;
  if (urgency_level) params.urgency_level = urgency_level;
  if (search) params.search = search;
  const response = await api.get("/notifications/admin/blood-demand-alerts/list/", { params });
  return response.data;
};

export const getBloodDemandAlertDetail = async (alertId) => {
  const response = await api.get(`/notifications/admin/blood-demand-alerts/${alertId}/`);
  return response.data;
};

export const updateBloodDemandAlert = async (alertId, data) => {
  const response = await api.patch(`/notifications/admin/blood-demand-alerts/${alertId}/`, data);
  return response.data;
};

export const deleteBloodDemandAlert = async (alertId) => {
  await api.delete(`/notifications/admin/blood-demand-alerts/${alertId}/`);
};

export const resolveBloodDemandAlert = async (alertId) => {
  const response = await api.post(`/notifications/admin/blood-demand-alerts/${alertId}/resolve/`);
  return response.data;
};

export const reNotifyBloodDemandAlert = async (alertId) => {
  const response = await api.post(`/notifications/admin/blood-demand-alerts/${alertId}/notify/`);
  return response.data;
};

export const getDonorBloodDemandAlerts = async () => {
  const response = await api.get("/notifications/blood-demand-alerts/");
  return response.data;
};