import api from "../api/axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login/", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout/");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me/");
  return response.data;
};

export const changePassword = async ({ current_password, new_password }) => {
  const response = await api.post("/auth/change-password/", {
    current_password,
    new_password,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password/", { email });
  return response.data;
};

export const resetPassword = async ({ uid, token, new_password }) => {
  const response = await api.post("/auth/reset-password/", {
    uid,
    token,
    new_password,
  });
  return response.data;
};