import api from "../api/axios";

export const getDonorProfile = async () => {
  const response = await api.get("/donors/profile/");
  return response.data;
};

export const createDonorProfile = async (profileData) => {
  const response = await api.post("/donors/profile/", profileData);
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

// export const updateDonorProfile = async (profileData) => {
//   const response = await api.put(
//     "/donors/profile/update/",
//     profileData
//   );

//   return response.data;
// };

export const updateDonorProfile = async (data) => {
  const response = await api.put(
    "/donors/profile/update/",
    data
  );

  return response.data;
};

export const getDonorImpact = async () => {
  const response = await api.get("/donors/impact/");
  return response.data;
};

export const getDonorRetentionSummary = async () => {
  const response = await api.get("/donors/retention-summary/");
  return response.data;
};

export const getAdminRetentionReminders = async () => {
  const response = await api.get("/donors/admin/retention-reminders/");
  return response.data;
};