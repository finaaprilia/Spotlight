import axios from "axios";
import { queryCache } from "./queryCache";

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
    list: async (params = {}, options = {}) => {
        const cacheKey = queryCache.generateKey("/articles", params);
        if (!options.bypassCache) {
            const cached = queryCache.get(cacheKey);
            if (cached) return cached;
        }

        console.log(
            `%c[QueryCache] 🌐 CACHE MISS: ${cacheKey} (meminta data artikel terbaru ke server...)`,
            "color: #3b82f6; font-weight: bold;"
        );
        const data = await api.get("/articles", { params });
        queryCache.set(cacheKey, data);
        return data;
    },

    get: async (id, options = {}) => {
        const cacheKey = `/articles/${id}`;
        if (!options.bypassCache) {
            const cached = queryCache.get(cacheKey);
            if (cached) return cached;
        }

        console.log(
            `%c[QueryCache] 🌐 CACHE MISS: ${cacheKey} (mengambil detail berita dari server...)`,
            "color: #3b82f6; font-weight: bold;"
        );
        const data = await api.get(`/articles/${id}`);
        queryCache.set(cacheKey, data);
        return data;
    },

    create: async (data) => {
        const res = await api.post("/articles", data);
        queryCache.invalidate("/articles");
        return res;
    },

    update: async (id, data) => {
        const res = await api.put(`/articles/${id}`, data);
        queryCache.invalidate("/articles");
        return res;
    },

    view: (id) => api.patch(`/articles/${id}/view`),

    remove: async (id) => {
        const res = await api.delete(`/articles/${id}`);
        queryCache.invalidate("/articles");
        return res;
    },
};

export const BookmarkAPI = {
    list: (deviceId) => api.get("/bookmarks", { params: { device_id: deviceId } }),
    add: (deviceId, articleId) => api.post("/bookmarks", { device_id: deviceId, article_id: articleId }),
    remove: (deviceId, articleId) =>
        api.delete(`/bookmarks/${articleId}`, { params: { device_id: deviceId } }),
    clear: (deviceId) => api.delete("/bookmarks", { params: { device_id: deviceId } }),
};

export const HistoryAPI = {
    list: (deviceId) => api.get("/history", { params: { device_id: deviceId } }),
    record: (deviceId, articleId) => api.post("/history", { device_id: deviceId, article_id: articleId }),
    remove: (deviceId, articleId) =>
        api.delete(`/history/${articleId}`, { params: { device_id: deviceId } }),
    clear: (deviceId) => api.delete("/history", { params: { device_id: deviceId } }),
};

export const UploadAPI = {
    image: (data) => api.post("/upload", { data }),
};
