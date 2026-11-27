/**
 * Offline Store & Sync Manager untuk Spotlight
 * Menyediakan penyimpanan lokal persisten (localStorage) untuk artikel, bookmark, riwayat,
 * serta antrean sinkronisasi (sync queue) ketika perangkat offline beralih ke online.
 */

const KEYS = {
    ARTICLES: "sp_offline_articles",
    BOOKMARKS: "sp_offline_bookmarks",
    HISTORY: "sp_offline_history",
    QUEUE: "sp_offline_queue",
};

const read = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const write = (key, val) => {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.warn(`[offlineStore] Gagal menyimpan ${key}:`, e);
    }
};

class OfflineStore {
    // ==================== ARTIKEL ====================
    saveArticles(articles) {
        if (!articles) return;
        const list = Array.isArray(articles) ? articles : [articles];
        if (list.length === 0) return;

        const currentMap = read(KEYS.ARTICLES, {});
        list.forEach((a) => {
            if (a && a.id) {
                // Pertahankan data yang sudah ada (seperti konten lengkap jika ada)
                currentMap[a.id] = { ...currentMap[a.id], ...a };
            }
        });
        write(KEYS.ARTICLES, currentMap);
    }

    getArticle(id) {
        const currentMap = read(KEYS.ARTICLES, {});
        return currentMap[id] || null;
    }

    getAllArticles({ search, category, sort = "terbaru", limit } = {}) {
        const currentMap = read(KEYS.ARTICLES, {});
        let list = Object.values(currentMap);

        // Filter Pencarian
        if (search) {
            const q = search.toLowerCase().trim();
            list = list.filter(
                (a) =>
                    (a.title && a.title.toLowerCase().includes(q)) ||
                    (a.summary && a.summary.toLowerCase().includes(q)) ||
                    (a.content && a.content.toLowerCase().includes(q))
            );
        }

        // Filter Kategori
        if (category && category !== "Semua") {
            list = list.filter((a) => a.category === category);
        }

        // Urutkan (Sorting)
        list.sort((a, b) => {
            if (sort === "terpopuler") {
                return (b.views || 0) - (a.views || 0);
            }
            if (sort === "judul") {
                return (a.title || "").localeCompare(b.title || "");
            }
            // Default: terbaru
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });

        // Batasi Jumlah (Limit)
        if (limit && Number(limit) > 0) {
            list = list.slice(0, Number(limit));
        }

        return list;
    }

    addLocalArticle(articleData) {
        const id = articleData.id || `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newArticle = {
            ...articleData,
            id,
            created_at: articleData.created_at || new Date().toISOString(),
            views: articleData.views || 0,
            _isOfflineCreated: true,
        };

        const currentMap = read(KEYS.ARTICLES, {});
        currentMap[id] = newArticle;
        write(KEYS.ARTICLES, currentMap);

        this.enqueue({
            type: "CREATE_ARTICLE",
            tempId: id,
            payload: articleData,
            timestamp: Date.now(),
        });

        return newArticle;
    }

    updateLocalArticle(id, payload) {
        const currentMap = read(KEYS.ARTICLES, {});
        if (currentMap[id]) {
            currentMap[id] = {
                ...currentMap[id],
                ...payload,
                updated_at: new Date().toISOString(),
            };
            write(KEYS.ARTICLES, currentMap);
        }

        this.enqueue({
            type: "UPDATE_ARTICLE",
            id,
            payload,
            timestamp: Date.now(),
        });

        return currentMap[id] || { id, ...payload };
    }

    removeLocalArticle(id) {
        const currentMap = read(KEYS.ARTICLES, {});
        delete currentMap[id];
        write(KEYS.ARTICLES, currentMap);

        this.enqueue({
            type: "DELETE_ARTICLE",
            id,
            timestamp: Date.now(),
        });

        return true;
    }

    // ==================== BOOKMARK ====================
    getBookmarks() {
        return read(KEYS.BOOKMARKS, []);
    }

    saveBookmarks(list) {
        if (!Array.isArray(list)) return;
        write(KEYS.BOOKMARKS, list);
        // Pastikan artikel yang ada di bookmark juga tercatat di article store
        this.saveArticles(list);
    }

    addBookmark(article) {
        if (!article || !article.id) return;
        const current = this.getBookmarks();
        const exists = current.some((b) => b.id === article.id);
        if (!exists) {
            const updated = [article, ...current];
            this.saveBookmarks(updated);
            this.enqueue({
                type: "ADD_BOOKMARK",
                articleId: article.id,
                timestamp: Date.now(),
            });
        }
    }

    removeBookmark(articleId) {
        if (!articleId) return;
        const current = this.getBookmarks();
        const updated = current.filter((b) => b.id !== articleId);
        this.saveBookmarks(updated);
        this.enqueue({
            type: "REMOVE_BOOKMARK",
            articleId,
            timestamp: Date.now(),
        });
    }

    clearBookmarks() {
        this.saveBookmarks([]);
        this.enqueue({
            type: "CLEAR_BOOKMARKS",
            timestamp: Date.now(),
        });
    }

    // ==================== RIWAYAT BACA ====================
    getHistory() {
        return read(KEYS.HISTORY, []);
    }

    saveHistory(list) {
        if (!Array.isArray(list)) return;
        write(KEYS.HISTORY, list);
        this.saveArticles(list);
    }

    recordHistory(article) {
        if (!article || !article.id) return;
        const current = this.getHistory();
        const filtered = current.filter((h) => h.id !== article.id);
        const record = {
            ...article,
            read_at: new Date().toISOString(),
        };
        const updated = [record, ...filtered];
        this.saveHistory(updated);

        this.enqueue({
            type: "RECORD_HISTORY",
            articleId: article.id,
            timestamp: Date.now(),
        });
    }

    removeHistory(articleId) {
        if (!articleId) return;
        const current = this.getHistory();
        const updated = current.filter((h) => h.id !== articleId);
        this.saveHistory(updated);
        this.enqueue({
            type: "REMOVE_HISTORY",
            articleId,
            timestamp: Date.now(),
        });
    }

    clearHistory() {
        this.saveHistory([]);
        this.enqueue({
            type: "CLEAR_HISTORY",
            timestamp: Date.now(),
        });
    }

    // ==================== ANTREAN SINKRONISASI (QUEUE) ====================
    getQueue() {
        return read(KEYS.QUEUE, []);
    }

    enqueue(action) {
        const queue = this.getQueue();
        queue.push(action);
        write(KEYS.QUEUE, queue);
        console.log(`[offlineStore] 📥 Aksi offline dicatat ke antrean: ${action.type}`, action);
    }

    clearQueue() {
        write(KEYS.QUEUE, []);
    }

    async syncQueue(apiInstance, deviceId, onSyncProgress) {
        if (!navigator.onLine) return 0;
        const queue = this.getQueue();
        if (queue.length === 0) return 0;

        console.log(`[offlineStore] 🔄 Memulai sinkronisasi ${queue.length} aksi offline ke server...`);
        let syncedCount = 0;
        const remainingQueue = [];

        for (const item of queue) {
            try {
                switch (item.type) {
                    case "CREATE_ARTICLE": {
                        const res = await apiInstance.post("/articles", item.payload);
                        if (res?.data?.id || res?.id) {
                            const realArticle = res.data || res;
                            // Ganti ID lokal sementara dengan ID permanen dari Supabase
                            const currentMap = read(KEYS.ARTICLES, {});
                            delete currentMap[item.tempId];
                            currentMap[realArticle.id] = realArticle;
                            write(KEYS.ARTICLES, currentMap);
                        }
                        syncedCount++;
                        break;
                    }
                    case "UPDATE_ARTICLE": {
                        if (!String(item.id).startsWith("offline_")) {
                            await apiInstance.put(`/articles/${item.id}`, item.payload);
                        }
                        syncedCount++;
                        break;
                    }
                    case "DELETE_ARTICLE": {
                        if (!String(item.id).startsWith("offline_")) {
                            await apiInstance.delete(`/articles/${item.id}`);
                        }
                        syncedCount++;
                        break;
                    }
                    case "ADD_BOOKMARK": {
                        await apiInstance.post("/bookmarks", { device_id: deviceId, article_id: item.articleId });
                        syncedCount++;
                        break;
                    }
                    case "REMOVE_BOOKMARK": {
                        await apiInstance.delete(`/bookmarks/${item.articleId}`, { params: { device_id: deviceId } });
                        syncedCount++;
                        break;
                    }
                    case "CLEAR_BOOKMARKS": {
                        await apiInstance.delete("/bookmarks", { params: { device_id: deviceId } });
                        syncedCount++;
                        break;
                    }
                    case "RECORD_HISTORY": {
                        await apiInstance.post("/history", { device_id: deviceId, article_id: item.articleId });
                        syncedCount++;
                        break;
                    }
                    case "REMOVE_HISTORY": {
                        await apiInstance.delete(`/history/${item.articleId}`, { params: { device_id: deviceId } });
                        syncedCount++;
                        break;
                    }
                    case "CLEAR_HISTORY": {
                        await apiInstance.delete("/history", { params: { device_id: deviceId } });
                        syncedCount++;
                        break;
                    }
                    default:
                        break;
                }
            } catch (err) {
                console.warn(`[offlineStore] Gagal menyinkronkan ${item.type}:`, err.message);
                remainingQueue.push(item);
            }
        }

        write(KEYS.QUEUE, remainingQueue);
        if (syncedCount > 0 && typeof onSyncProgress === "function") {
            onSyncProgress(syncedCount);
        }
        return syncedCount;
    }
}

export const offlineStore = new OfflineStore();
