import axios from "axios";

// API berada pada domain yang sama (/api), baik di lokal (proxy Vite) maupun di Vercel.
const api = axios.create({ baseURL: "/api", timeout: 15000 });

api.interceptors.response.use(
    (res) => res.data,
    (err) =>
        Promise.reject(
            new Error(err.response?.data?.error || "Tidak dapat terhubung ke server. Periksa koneksi Anda.")
        )
);

export const ArticleAPI = {
    list: (params = {}) => api.get("/articles", { params }),
    get: (id) => api.get(`/articles/${id}`),
    create: (data) => api.post("/articles", data),
    update: (id, data) => api.put(`/articles/${id}`, data),
    view: (id) => api.patch(`/articles/${id}/view`),
    remove: (id) => api.delete(`/articles/${id}`),
};

export const BookmarkAPI = {
    list: (deviceId) => api.get("/bookmarks", { params: { device_id: deviceId } }),
    add: (deviceId, articleId) => api.post("/bookmarks", { device_id: deviceId, article_id: articleId }),
    remove: (deviceId, articleId) =>
        api.delete(`/bookmarks/${articleId}`, { params: { device_id: deviceId } }),
    clear: (deviceId) => api.delete("/bookmarks", { params: { device_id: deviceId } }),
};
