import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Folder } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Empty } from "../components/States";
import BookmarkFolderModal from "../components/BookmarkFolderModal";

export default function Bookmarks() {
    const { bookmarks, refreshBookmarks, customFolders, getArticleFolder } = useApp();
    const [createModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        refreshBookmarks(); // sinkronkan dengan server saat halaman dibuka
    }, [refreshBookmarks]);

    // Kelompokkan per folder (kategori bawaan atau folder kustom pilihan pengguna)
    const folders = useMemo(() => {
        const map = new Map();

        // 1. Masukkan semua folder kustom yang dibuat pengguna
        customFolders.forEach((f) => {
            if (!map.has(f)) map.set(f, { items: [], isCustom: true });
        });

        // 2. Masukkan semua artikel yang di-bookmark ke folder masing-masing
        bookmarks.forEach((a) => {
            const folderName = getArticleFolder(a);
            if (!map.has(folderName)) {
                map.set(folderName, { items: [], isCustom: customFolders.includes(folderName) });
            }
            map.get(folderName).items.push(a);
        });

        return [...map.entries()]
            .map(([name, { items, isCustom }]) => ({
                name,
                isCustom,
                count: items.length,
                cover: items.find((i) => i.image_url)?.image_url,
            }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [bookmarks, customFolders, getArticleFolder]);

    const hasAny = bookmarks.length > 0 || customFolders.length > 0;

    return (
        <main className="page">
            <header className="top">
                <h1 className="title">Bookmark</h1>
                <button
                    className="btn primary sm"
                    onClick={() => setCreateModalOpen(true)}
                    aria-label="Buat folder bookmark baru"
                >
                    <FolderPlus size={16} /> Buat Folder
                </button>
            </header>

            {!hasAny ? (
                <Empty
                    title="Belum ada bookmark"
                    hint="Simpan berita dari halaman detail atau buat folder kustom Anda sendiri."
                >
                    <div className="empty-actions">
                        <Link to="/berita" className="btn primary">Jelajahi berita</Link>
                        <button className="btn outline" onClick={() => setCreateModalOpen(true)}>
                            <FolderPlus size={16} /> Buat Folder Baru
                        </button>
                    </div>
                </Empty>
            ) : (
                <div className="folders">
                    {bookmarks.length > 0 && (
                        <Link to="/bookmark/semua" className="fcard">
                            <div className="fcard-cover fcard-all">
                                <strong>{bookmarks.length}</strong>
                                <span>berita tersimpan</span>
                            </div>
                            <div className="fcard-meta">
                                <h3>Semua bookmark</h3>
                            </div>
                        </Link>
                    )}

                    {folders.map((f) => (
                        <Link key={f.name} to={`/bookmark/${encodeURIComponent(f.name)}`} className="fcard">
                            <div className={`fcard-cover${!f.cover && f.count === 0 ? " fcard-empty" : ""}`}>
                                {f.cover ? (
                                    <img
                                        src={f.cover}
                                        alt=""
                                        loading="lazy"
                                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                                    />
                                ) : (
                                    <span className="fcard-initial" aria-hidden="true">
                                        {f.isCustom ? <Folder size={32} /> : f.name[0]}
                                    </span>
                                )}
                            </div>
                            <div className="fcard-meta">
                                <h3>{f.name}</h3>
                                <span>{f.count} berita</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <BookmarkFolderModal
                open={createModalOpen}
                mode="create"
                onClose={() => setCreateModalOpen(false)}
            />
        </main>
    );
}
