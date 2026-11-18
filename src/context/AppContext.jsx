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

    const toggleBookmark = async (article) => {
        try {
            if (isBookmarked(article.id)) {
                await BookmarkAPI.remove(deviceId, article.id);
                setBookmarks((l) => l.filter((b) => b.id !== article.id));
                toast("Dihapus dari bookmark");
            } else {
                await BookmarkAPI.add(deviceId, article.id);
                setBookmarks((l) => [article, ...l]);
                toast("Disimpan ke bookmark");
            }
        } catch (e) {
            toast(e.message);
        }
    };

    // Menghapus beberapa bookmark sekaligus (mode pilih dan hapus semua di folder)
    const removeBookmarks = async (ids) => {
        if (!ids.length) return true;
        try {
            await Promise.all(ids.map((id) => BookmarkAPI.remove(deviceId, id)));
            setBookmarks((l) => l.filter((b) => !ids.includes(b.id)));
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
            }}
        >
            {children}
            {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
        </Ctx.Provider>
    );
}
