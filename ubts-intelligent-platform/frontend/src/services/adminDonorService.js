import api from "../api/axios";

export const getAdminDonors = async () => {
  const response = await api.get("/donors/admin/donors/");
  return response.data;
};

export const saveAdminMedicalRecord = async (medicalData) => {
  const response = await api.post("/donors/admin/medical-record/", medicalData);
  return response.data;
};