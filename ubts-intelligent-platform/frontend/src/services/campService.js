import api from "../api/axios";

export const getAdminCamps = async () => {
  const response = await api.get("/camps/admin/");
  return response.data;
};

export const createCamp = async (campData) => {
  const response = await api.post("/camps/admin/", campData);
  return response.data;
};

export const updateCamp = async (campData) => {
  const response = await api.put("/camps/admin/", campData);
  return response.data;
};

export const deleteCamp = async (id) => {
  const response = await api.delete("/camps/admin/", {
    data: { id },
  });
  return response.data;
};

export const rescheduleCamp = async (id, start_date, end_date) => {
  const response = await api.patch(`/camps/admin/${id}/reschedule/`, {
    start_date,
    end_date,
  });
  return response.data;
};

export const getCampQR = async (campId) => {
  const response = await api.get(`/camps/${campId}/qr/`);
  return response.data;
};

export const getCampDetail = async (campId) => {
  const response = await api.get(`/camps/${campId}/`);
  return response.data;
};