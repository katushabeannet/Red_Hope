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