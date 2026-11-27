import axios from "axios";
import { queryCache } from "./queryCache";
import { offlineStore } from "../utils/offlineStore";

// API berada pada domain yang sama (/api), baik di lokal (proxy Vite) maupun di Vercel.
export const api = axios.create({ baseURL: "/api", timeout: 10000 });

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

        // 1. Coba request ke server jika online
        if (navigator.onLine) {
            try {
                console.log(
                    `%c[QueryCache] 🌐 CACHE MISS: ${cacheKey} (meminta data artikel terbaru ke server...)`,
                    "color: #3b82f6; font-weight: bold;"
                );
                const data = await api.get("/articles", { params });
                if (Array.isArray(data)) {
                    // Simpan seluruh data artikel ke penyimpanan lokal (offline store)
                    offlineStore.saveArticles(data);
                    queryCache.set(cacheKey, data);
                    return data;
                }
            } catch (err) {
                console.warn("[ArticleAPI] Gagal mengambil dari server, beralih ke offline store:", err.message);
            }
        }

        // 2. Jika offline atau request server gagal, sajikan data dari penyimpanan lokal
        console.log(
            `%c[ArticleAPI] 📴 OFFLINE MODE: Menampilkan daftar artikel dari penyimpanan lokal`,
            "color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;"
        );
        const localData = offlineStore.getAllArticles(params);
        return localData;
    },

    get: async (id, options = {}) => {
        const cacheKey = `/articles/${id}`;
        if (!options.bypassCache) {
            const cached = queryCache.get(cacheKey);
            if (cached) return cached;
        }

        // 1. Coba ambil dari server jika online
        if (navigator.onLine) {
            try {
                console.log(
                    `%c[QueryCache] 🌐 CACHE MISS: ${cacheKey} (mengambil detail berita dari server...)`,
                    "color: #3b82f6; font-weight: bold;"
                );
                const data = await api.get(`/articles/${id}`);
                if (data && data.id) {
                    offlineStore.saveArticles([data]);
                    queryCache.set(cacheKey, data);
                    return data;
                }
            } catch (err) {
                console.warn("[ArticleAPI] Gagal mengambil detail dari server, beralih ke offline store:", err.message);
            }
        }

        // 2. Ambil dari penyimpanan offline jika offline atau request server gagal
        const local = offlineStore.getArticle(id);
        if (local) {
            console.log(
                `%c[ArticleAPI] 📴 OFFLINE MODE: Berita "${local.title}" berhasil dimuat dari penyimpanan lokal`,
                "color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;"
            );
            return local;
        }

        throw new Error("Berita tidak ditemukan di penyimpanan offline.");
    },

    create: async (data) => {
        if (navigator.onLine) {
            try {
                const res = await api.post("/articles", data);
                offlineStore.saveArticles([res]);
                queryCache.invalidate("/articles");
                return res;
            } catch (err) {
                console.warn("[ArticleAPI] Gagal membuat di server, beralih simpan offline:", err.message);
            }
        }

        // Simpan secara offline dan masukkan ke antrean sinkronisasi
        const local = offlineStore.addLocalArticle(data);
        queryCache.invalidate("/articles");
        return local;
    },

    update: async (id, data) => {
        if (navigator.onLine) {
            try {
                const res = await api.put(`/articles/${id}`, data);
                offlineStore.saveArticles([res]);
                queryCache.invalidate("/articles");
                return res;
            } catch (err) {
                console.warn("[ArticleAPI] Gagal update di server, beralih simpan offline:", err.message);
            }
        }

        const local = offlineStore.updateLocalArticle(id, data);
        queryCache.invalidate("/articles");
        return local;
    },

    view: async (id) => {
        if (navigator.onLine) {
            return api.patch(`/articles/${id}/view`).catch(() => { });
        }
        // Mode offline: update views di memori lokal
        const current = offlineStore.getArticle(id);
        if (current) {
            offlineStore.saveArticles([{ ...current, views: (current.views || 0) + 1 }]);
        }
    },

    remove: async (id) => {
        offlineStore.removeLocalArticle(id);
        queryCache.invalidate("/articles");

        if (navigator.onLine) {
            try {
                return await api.delete(`/articles/${id}`);
            } catch (err) {
                console.warn("[ArticleAPI] Gagal menghapus di server saat ini, antrean offline dicatat:", err.message);
            }
        }
        return { success: true };
    },
};

export const BookmarkAPI = {
    list: async (deviceId) => {
        if (navigator.onLine) {
            try {
                const data = await api.get("/bookmarks", { params: { device_id: deviceId } });
                if (Array.isArray(data)) {
                    offlineStore.saveBookmarks(data);
                    return data;
                }
            } catch (err) {
                console.warn("[BookmarkAPI] Gagal mengambil bookmark server, gunakan data lokal:", err.message);
            }
        }
        return offlineStore.getBookmarks();
    },

    add: async (deviceId, articleId) => {
        if (navigator.onLine) {
            try {
                return await api.post("/bookmarks", { device_id: deviceId, article_id: articleId });
            } catch (err) {
                console.warn("[BookmarkAPI] Gagal simpan ke server, antrean offline dicatat:", err.message);
            }
        }
        // Tambahkan ke antrean sinkronisasi offline
        offlineStore.enqueue({
            type: "ADD_BOOKMARK",
            articleId,
            timestamp: Date.now(),
        });
        return { success: true };
    },

    remove: async (deviceId, articleId) => {
        offlineStore.removeBookmark(articleId);
        if (navigator.onLine) {
            try {
                return await api.delete(`/bookmarks/${articleId}`, { params: { device_id: deviceId } });
            } catch (err) {
                console.warn("[BookmarkAPI] Gagal hapus di server, antrean offline dicatat:", err.message);
            }
        }
        return { success: true };
    },

    clear: async (deviceId) => {
        offlineStore.clearBookmarks();
        if (navigator.onLine) {
            try {
                return await api.delete("/bookmarks", { params: { device_id: deviceId } });
            } catch (err) {
                console.warn("[BookmarkAPI] Gagal hapus semua di server, antrean offline dicatat:", err.message);
            }
        }
        return { success: true };
    },
};

export const HistoryAPI = {
    list: async (deviceId) => {
        if (navigator.onLine) {
            try {
                const data = await api.get("/history", { params: { device_id: deviceId } });
                if (Array.isArray(data)) {
                    offlineStore.saveHistory(data);
                    return data;
                }
            } catch (err) {
                console.warn("[HistoryAPI] Gagal mengambil riwayat server, gunakan data lokal:", err.message);
            }
        }
        return offlineStore.getHistory();
    },

    record: async (deviceId, articleId) => {
        const article = offlineStore.getArticle(articleId);
        if (article) {
            offlineStore.recordHistory(article);
        }
        // Selalu tambah read_count lokal setiap kali artikel dibuka (tidak hanya saat offline)
        offlineStore.incrementReadCount(articleId);

        if (navigator.onLine) {
            try {
                return await api.post("/history", { device_id: deviceId, article_id: articleId });
            } catch (err) {
                /* biarkan fallback ke queue */
            }
        }
        return { success: true };
    },

    remove: async (deviceId, articleId) => {
        offlineStore.removeHistory(articleId);
        if (navigator.onLine) {
            try {
                return await api.delete(`/history/${articleId}`, { params: { device_id: deviceId } });
            } catch (err) {
                console.warn("[HistoryAPI] Gagal hapus riwayat di server:", err.message);
            }
        }
        return { success: true };
    },

    clear: async (deviceId) => {
        offlineStore.clearHistory();
        if (navigator.onLine) {
            try {
                return await api.delete("/history", { params: { device_id: deviceId } });
            } catch (err) {
                console.warn("[HistoryAPI] Gagal hapus semua riwayat di server:", err.message);
            }
        }
        return { success: true };
    },

    // Ambil top-N trending berdasarkan berapa kali user membuka berita (read_count personal)
    trending: async (deviceId, limit = 10) => {
        // Selalu ambil data lokal dulu (instan, offline-ready)
        const localTrending = offlineStore.getLocalTrending(limit);

        if (navigator.onLine) {
            try {
                const data = await api.get("/history/trending", {
                    params: { device_id: deviceId, limit },
                });
                if (Array.isArray(data) && data.length > 0) {
                    offlineStore.saveTrending(data);
                    return data;
                }
            } catch (err) {
                console.warn("[HistoryAPI] Gagal mengambil trending dari server, gunakan data lokal:", err.message);
            }
        }

        return localTrending;
    },
};

export const SyncAPI = {
    sync: async (deviceId, onProgress) => {
        return offlineStore.syncQueue(api, deviceId, onProgress);
    },
};

export const UploadAPI = {
    image: (data) => api.post("/upload", { data }),
};
