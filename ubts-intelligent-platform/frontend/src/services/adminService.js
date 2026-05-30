import api from "../api/axios";

export const getDashboardSummary = async () => {
  const response = await api.get("/admin/dashboard-summary/");
  return response.data;
};

export const getRecentAssessments = async () => {
  const response = await api.get("/admin/recent-assessments/");
  return response.data;
};

export const getCampStatistics = async () => {
  const response = await api.get("/admin/camp-statistics/");
  return response.data;
};

export const getCampaignReadyDonors = async () => {
  const response = await api.get("/donors/admin/campaign-ready/");
  return response.data;
};