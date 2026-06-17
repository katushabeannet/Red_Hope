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

export const getDonorAssessmentHistory = async ({ page = 1, page_size = 5 } = {}) => {
  const response = await api.get(
    `/donors/assessment-history/?page=${page}&page_size=${page_size}`
  );
  return response.data;
};

export const getDonationHistory = async ({ page = 1, page_size = 5 } = {}) => {
  const response = await api.get(
    `/donors/donation-history/?page=${page}&page_size=${page_size}`
  );
  return response.data;
};

export const downloadCertificate = async (donationId) => {
  const response = await api.get(`/donors/certificate/${donationId}/`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `UBTS_Certificate_${donationId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getActiveCamps = async () => {
  const response = await api.get("/camps/active/");
  return response.data;
};

export const campCheckin = async (campId) => {
  const response = await api.post(`/donors/camp-checkin/${campId}/`);
  return response.data;
};