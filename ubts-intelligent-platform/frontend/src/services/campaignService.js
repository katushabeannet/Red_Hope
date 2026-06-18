import api from "../api/axios";

export const scanPersonalizedCampaignDonors = async (filters) => {
  const response = await api.post(
    "/donors/admin/personalized-campaign-scan/",
    filters
  );
  return response.data;
};

export const getCampaignCamps = async () => {
  const response = await api.get("/camps/admin/");
  return response.data;
};

export const getCampaignPerformanceAnalytics = async () => {
  const response = await api.get("/admin/campaign-performance/");
  return response.data;
};

export const getCampaignScanHistory = async ({ page = 1, page_size = 20, search = "", blood_group = "" } = {}) => {
  const params = { page, page_size };
  if (search) params.search = search;
  if (blood_group) params.blood_group = blood_group;
  const response = await api.get("/admin/campaign-history/", { params });
  return response.data;
};

export const getCampaignScanDetail = async (id) => {
  const response = await api.get(`/admin/campaign-history/${id}/`);
  return response.data;
};

export const markCampaignConverted = async (id, converted_donors) => {
  const response = await api.post(`/admin/campaign-history/${id}/converted/`, { converted_donors });
  return response.data;
};

export const exportCampaignHistoryCSV = (blood_group = "") => {
  const params = blood_group ? `?blood_group=${encodeURIComponent(blood_group)}` : "";
  window.open(`${api.defaults.baseURL}/admin/campaign-history/export/${params}`, "_blank");
};