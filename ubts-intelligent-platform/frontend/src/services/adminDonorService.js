import api from "../api/axios";

export const getAdminDonors = async ({ page = 1, page_size = 5, search = "", has_medical = "", blood_group = "", location = "" } = {}) => {
  const params = new URLSearchParams({ page, page_size });
  if (search) params.append("search", search);
  if (has_medical !== "") params.append("has_medical", has_medical);
  if (blood_group) params.append("blood_group", blood_group);
  if (location) params.append("location", location);
  const response = await api.get(`/donors/admin/donors/?${params.toString()}`);
  return response.data;
};

export const saveAdminMedicalRecord = async (medicalData) => {
  const response = await api.post("/donors/admin/medical-record/", medicalData);
  return response.data;
};

export const recordDonation = async (donationData) => {
  const response = await api.post("/donors/admin/record-donation/", donationData);
  return response.data;
};

export const exportDonorsCSV = async (search = "") => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  const response = await api.get(
    `/donors/admin/donors/export/?${params.toString()}`,
    { responseType: "blob" }
  );
  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ubts_donors.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getAdminLapsedDonors = async ({ page = 1, page_size = 20, search = "" } = {}) => {
  const params = new URLSearchParams({ page, page_size });
  if (search) params.append("search", search);
  const response = await api.get(`/donors/admin/donors/lapsed/?${params.toString()}`);
  return response.data;
};

export const registerWalkInDonor = async (payload) => {
  const response = await api.post("/donors/admin/walkin-register/", payload);
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