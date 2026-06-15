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