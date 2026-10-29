import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const getCurrentUser = () =>
  api.get("/auth/me");

export const getOrders = () =>
  api.get("/orders");

export const createOrder = (data) =>
  api.post("/orders", data);

export const updateOrder = (id, data) =>
  api.put(`/orders/${id}`, data);

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export const deleteOrderById = (id) =>
  api.delete(`/orders/${id}`);

export const getSettings = () =>
  api.get("/settings");

export const updateSettings = (data) =>
  api.put("/settings", data);

export const getProducts = () =>
  api.get("/products");

export const createProduct = (data) =>
  api.post("/products", data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

export default api;