import api from "../api/axios";

export const getAdminDonors = async () => {
  const response = await api.get("/donors/admin/donors/");
  return response.data;
};

export const saveAdminMedicalRecord = async (medicalData) => {
  const response = await api.post("/donors/admin/medical-record/", medicalData);
  return response.data;
};

export const saveDonorMedicalRecord = async (formData) => {
  const payload = {
    donor_id: Number(formData.donor_id),
    weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
    hemoglobin_level: formData.hemoglobin_level
      ? Number(formData.hemoglobin_level)
      : null,
    has_recent_illness: Boolean(formData.has_recent_illness),
    has_chronic_condition: Boolean(formData.has_chronic_condition),
    is_pregnant: Boolean(formData.is_pregnant),
    is_on_medication: Boolean(formData.is_on_medication),
    last_donation_date: formData.last_donation_date || null,
  };

  const response = await api.post("/donors/admin/medical-record/", payload);
  return response.data;
};