import api from "../api/axios";

export const getDonorProfile = async () => {
  const response = await api.get("/donors/profile/");
  return response.data;
};

export const getDonorMedicalRecord = async () => {
  const response = await api.get("/donors/medical-record/");
  return response.data;
};

export const checkEligibility = async () => {
  const response = await api.post("/donors/eligibility-check/", {});
  return response.data;
};

export const checkAvailability = async () => {
  const response = await api.post("/donors/availability-check/", {});
  return response.data;
};

export const findNearestCamp = async (coordinates) => {
  const response = await api.post("/camps/nearest/", coordinates);
  return response.data;
};