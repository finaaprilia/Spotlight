import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ArticleAPI, BookmarkAPI, SyncAPI } from "../api/client";
import { offlineStore } from "../utils/offlineStore";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const read = (k, d) => {
    try {
        const v = localStorage.getItem(k);
        return v === null ? d : JSON.parse(v);
    } catch {
        return d;
    }
};
const write = (k, v) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch {
        /* penyimpanan penuh atau mode privat */
    }
};

const getDeviceId = () => {
    let id = read("sp_device", null);
    if (!id) {
        id = crypto.randomUUID();
        write("sp_device", id);
    }
    return id;
};

export function AppProvider({ children }) {
    const [deviceId] = useState(getDeviceId);
    const [dark, setDark] = useState(() => read("sp_dark", matchMedia("(prefers-color-scheme: dark)").matches));
    const [onboarded, setOnboardedState] = useState(() => read("sp_onboarded", false));
    const [bookmarks, setBookmarks] = useState(() => offlineStore.getBookmarks());
    const [bookmarksReady, setBookmarksReady] = useState(true);
    const [customFolders, setCustomFolders] = useState(() => read("sp_bookmark_folders", []));
    const [articleFolderMap, setArticleFolderMap] = useState(() => read("sp_article_folders", {}));
    const [toastMsg, setToastMsg] = useState("");

    useEffect(() => {
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", dark ? "#0C1118" : "#F2F4F7");
        write("sp_dark", dark);
    }, [dark]);

    useEffect(() => {
        if (!toastMsg) return;
        const t = setTimeout(() => setToastMsg(""), 2200);
        return () => clearTimeout(t);
    }, [toastMsg]);

    const toast = useCallback((msg) => setToastMsg(msg), []);

    const setOnboarded = (v) => {
        write("sp_onboarded", v);
        setOnboardedState(v);
    };

    const refreshBookmarks = useCallback(
        () =>
            BookmarkAPI.list(deviceId)
                .then((data) => {
                    if (Array.isArray(data)) {
                        setBookmarks(data);
                        offlineStore.saveBookmarks(data);
                    }
                })
                .catch(() => { })
                .finally(() => setBookmarksReady(true)),
        [deviceId]
    );

    // Sinkronisasi data offline saat online dan prefetch artikel
    useEffect(() => {
        const handleOnline = async () => {
            console.log("[AppProvider] 🌐 Terhubung kembali ke internet. Melakukan sinkronisasi data...");
            try {
                const count = await SyncAPI.sync(deviceId);
                if (count > 0) {
                    toast(`Sinkronisasi selesai: ${count} perubahan offline berhasil disimpan ke server`);
                }
                refreshBookmarks();
                // Prefetch artikel terbaru agar offline store selalu lengkap
                ArticleAPI.list({ limit: 100 }, { bypassCache: true }).catch(() => { });
            } catch (e) {
                console.warn("[AppProvider] Gagal sinkronisasi:", e);
            }
        };

        window.addEventListener("online", handleOnline);

        // Jika saat ini online, sinkronkan antrean dan prefetch artikel
        if (navigator.onLine) {
            handleOnline();
        }

        return () => window.removeEventListener("online", handleOnline);
    }, [deviceId, refreshBookmarks, toast]);

    const isBookmarked = (id) => bookmarks.some((b) => b.id === id);

    const createFolder = (name) => {
        const trimmed = (name || "").trim();
        if (!trimmed) throw new Error("Nama folder tidak boleh kosong");
        if (customFolders.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
            throw new Error(`Folder "${trimmed}" sudah ada`);
        }
        const updated = [...customFolders, trimmed];
        setCustomFolders(updated);
        write("sp_bookmark_folders", updated);
        toast(`Folder "${trimmed}" berhasil dibuat`);
        return trimmed;
    };

    const deleteFolder = (folderName) => {
        const updated = customFolders.filter((f) => f !== folderName);
        setCustomFolders(updated);
        write("sp_bookmark_folders", updated);

        // Hapus mapping artikel dari folder yang dihapus agar kembali ke kategori aslinya
        const nextMap = { ...articleFolderMap };
        let changed = false;
        for (const [id, f] of Object.entries(nextMap)) {
            if (f === folderName) {
                delete nextMap[id];
                changed = true;
            }
        }
        if (changed) {
            setArticleFolderMap(nextMap);
            write("sp_article_folders", nextMap);
        }
        toast(`Folder "${folderName}" dihapus`);
    };

    const setArticleFolder = (articleId, folderName) => {
        const nextMap = { ...articleFolderMap, [articleId]: folderName };
        setArticleFolderMap(nextMap);
        write("sp_article_folders", nextMap);
        toast(`Berita dipindahkan ke folder "${folderName}"`);
    };

    const getArticleFolder = useCallback(
        (article) => {
            if (!article) return "Umum";
            return articleFolderMap[article.id] || article.category || "Umum";
        },
        [articleFolderMap]
    );

    const toggleBookmark = async (article, targetFolder) => {
        if (!article || !article.id) return false;
        try {
            if (isBookmarked(article.id) && !targetFolder) {
                setBookmarks((l) => l.filter((b) => b.id !== article.id));
                offlineStore.removeBookmark(article.id);
                BookmarkAPI.remove(deviceId, article.id).catch(() => { });

                const nextMap = { ...articleFolderMap };
                delete nextMap[article.id];
                setArticleFolderMap(nextMap);
                write("sp_article_folders", nextMap);
                toast("Dihapus dari bookmark");
                return false;
            } else {
                if (!isBookmarked(article.id)) {
                    setBookmarks((l) => [article, ...l]);
                    offlineStore.addBookmark(article);
                    BookmarkAPI.add(deviceId, article.id).catch(() => { });
                }
                if (targetFolder) {
                    const nextMap = { ...articleFolderMap, [article.id]: targetFolder };
                    setArticleFolderMap(nextMap);
                    write("sp_article_folders", nextMap);
                    toast(`Disimpan ke folder "${targetFolder}"`);
                } else {
                    toast("Disimpan ke bookmark");
                }
                return true;
            }
        } catch (e) {
            toast(e.message || "Gagal mengubah bookmark");
            return false;
        }
    };

    // Menghapus beberapa bookmark sekaligus (mode pilih dan hapus semua di folder)
    const removeBookmarks = async (ids) => {
        if (!ids.length) return true;
        try {
            setBookmarks((l) => l.filter((b) => !ids.includes(b.id)));
            ids.forEach((id) => {
                offlineStore.removeBookmark(id);
                BookmarkAPI.remove(deviceId, id).catch(() => { });
            });
            const nextMap = { ...articleFolderMap };
            ids.forEach((id) => delete nextMap[id]);
            setArticleFolderMap(nextMap);
            write("sp_article_folders", nextMap);
            toast(`${ids.length} bookmark dihapus`);
            return true;
        } catch (e) {
            toast(e.message);
            refreshBookmarks();
            return false;
        }
    };

    const clearBookmarks = async () => {
        try {
            setBookmarks([]);
            offlineStore.clearBookmarks();
            BookmarkAPI.clear(deviceId).catch(() => { });
            setArticleFolderMap({});
            write("sp_article_folders", {});
            toast("Semua bookmark dihapus");
        } catch (e) {
            toast(e.message);
        }
    };

    return (
        <Ctx.Provider
            value={{
                deviceId, dark, setDark, onboarded, setOnboarded,
                bookmarks, bookmarksReady, isBookmarked, toggleBookmark,
                removeBookmarks, clearBookmarks, refreshBookmarks, toast,
                customFolders, createFolder, deleteFolder, setArticleFolder, getArticleFolder,
            }}
        >
            {children}
            {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
        </Ctx.Provider>
    );
}
