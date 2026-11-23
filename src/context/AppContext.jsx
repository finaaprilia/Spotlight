import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BookmarkAPI } from "../api/client";

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
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarksReady, setBookmarksReady] = useState(false);
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
                .then(setBookmarks)
                .catch(() => { })
                .finally(() => setBookmarksReady(true)),
        [deviceId]
    );
    useEffect(() => {
        refreshBookmarks();
    }, [refreshBookmarks]);

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
        try {
            if (isBookmarked(article.id) && !targetFolder) {
                await BookmarkAPI.remove(deviceId, article.id);
                setBookmarks((l) => l.filter((b) => b.id !== article.id));
                const nextMap = { ...articleFolderMap };
                delete nextMap[article.id];
                setArticleFolderMap(nextMap);
                write("sp_article_folders", nextMap);
                toast("Dihapus dari bookmark");
                return false;
            } else {
                if (!isBookmarked(article.id)) {
                    await BookmarkAPI.add(deviceId, article.id);
                    setBookmarks((l) => [article, ...l]);
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
            toast(e.message);
            return false;
        }
    };

    // Menghapus beberapa bookmark sekaligus (mode pilih dan hapus semua di folder)
    const removeBookmarks = async (ids) => {
        if (!ids.length) return true;
        try {
            await Promise.all(ids.map((id) => BookmarkAPI.remove(deviceId, id)));
            setBookmarks((l) => l.filter((b) => !ids.includes(b.id)));
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
            await BookmarkAPI.clear(deviceId);
            setBookmarks([]);
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
