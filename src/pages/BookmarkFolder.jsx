import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckSquare, MoreVertical, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { RowCard } from "../components/ArticleCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { Loading } from "../components/States";

export default function BookmarkFolder() {
    const { kategori } = useParams();
    const navigate = useNavigate();
    const {
        bookmarks,
        bookmarksReady,
        removeBookmarks,
        clearBookmarks,
        getArticleFolder,
        customFolders,
        deleteFolder,
    } = useApp();

    const isAll = kategori === "semua";
    const title = isAll ? "Semua bookmark" : kategori;
    const isCustom = customFolders.includes(kategori);

    const [menuOpen, setMenuOpen] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState([]);
    const [confirm, setConfirm] = useState(null); // null | "selected" | "all" | "folder"
    const [busy, setBusy] = useState(false);

    const items = useMemo(
        () => (isAll ? bookmarks : bookmarks.filter((a) => getArticleFolder(a) === kategori)),
        [bookmarks, isAll, kategori, getArticleFolder]
    );

    // Folder non-kustom yang kosong kembali ke daftar folder
    useEffect(() => {
        if (bookmarksReady && items.length === 0 && !isCustom && !isAll) {
            navigate("/bookmark", { replace: true });
        }
    }, [bookmarksReady, items.length, isCustom, isAll, navigate]);

    const toggle = (id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const exitSelect = () => {
        setSelecting(false);
        setSelected([]);
    };

    const allSelected = items.length > 0 && selected.length === items.length;

    const doDelete = async () => {
        setBusy(true);
        if (confirm === "selected") {
            await removeBookmarks(selected);
        } else if (confirm === "folder") {
            deleteFolder(kategori);
            navigate("/bookmark", { replace: true });
        } else if (isAll) {
            await clearBookmarks();
        } else {
            await removeBookmarks(items.map((a) => a.id));
        }
        setBusy(false);
        setConfirm(null);
        exitSelect();
    };

    if (!bookmarksReady) return <main className="page"><Loading text="Memuat bookmark" /></main>;

    const confirmMessage =
        confirm === "selected"
            ? `${selected.length} berita akan dihapus dari bookmark. Beritanya sendiri tidak ikut terhapus.`
            : confirm === "folder"
                ? `Folder "${title}" akan dihapus. Berita yang ada di dalamnya akan otomatis kembali ke folder kategori aslinya.`
                : isAll
                    ? `Semua ${items.length} berita akan dihapus dari bookmark. Beritanya sendiri tidak ikut terhapus.`
                    : `${items.length} berita di folder ${title} akan dihapus dari bookmark. Beritanya sendiri tidak ikut terhapus.`;

    return (
        <main className="page">
            {selecting ? (
                <>
                    <header className="selbar">
                        <button className="btn sm" onClick={exitSelect}>Batal</button>
                        <strong>{selected.length} dipilih</strong>
                        <button
                            className="btn danger sm"
                            disabled={selected.length === 0}
                            onClick={() => setConfirm("selected")}
                        >
                            <Trash2 size={15} /> Hapus
                        </button>
                    </header>
                    <button
                        className="link selall"
                        onClick={() => setSelected(allSelected ? [] : items.map((a) => a.id))}
                    >
                        {allSelected ? "Kosongkan pilihan" : "Pilih semua"}
                    </button>
                </>
            ) : (
                <header className="fhead">
                    <button className="icon-btn solid" onClick={() => navigate("/bookmark")} aria-label="Kembali">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="fhead-title">
                        <h1>{title}</h1>
                        <p className="muted">{items.length} berita</p>
                    </div>
                    <div className="menu-wrap">
                        <button
                            className="icon-btn solid"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="Menu folder"
                            aria-expanded={menuOpen}
                        >
                            <MoreVertical size={20} />
                        </button>
                        {menuOpen && (
                            <>
                                <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
                                <div className="menu" role="menu">
                                    <button
                                        role="menuitem"
                                        onClick={() => { setMenuOpen(false); setSelecting(true); }}
                                    >
                                        <CheckSquare size={17} /> Pilih berita
                                    </button>
                                    <button
                                        role="menuitem"
                                        className="danger"
                                        onClick={() => { setMenuOpen(false); setConfirm("all"); }}
                                    >
                                        <Trash2 size={17} /> Hapus semua di folder ini
                                    </button>
                                    {isCustom && (
                                        <button
                                            role="menuitem"
                                            className="danger"
                                            onClick={() => { setMenuOpen(false); setConfirm("folder"); }}
                                        >
                                            <Trash2 size={17} /> Hapus folder ini
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </header>
            )}

            {items.length === 0 ? (
                <div className="state">
                    <p>Folder ini belum memiliki berita tersimpan.</p>
                    <p className="muted">Saat membaca berita, tekan tombol bookmark dan pilih folder "{title}".</p>
                </div>
            ) : (
                <div className="list">
                    {items.map((a) =>
                        selecting ? (
                            <RowCard key={a.id} a={a} selectable checked={selected.includes(a.id)} onToggle={toggle} />
                        ) : (
                            <RowCard key={a.id} a={a} />
                        )
                    )}
                </div>
            )}

            <ConfirmDialog
                open={Boolean(confirm)}
                title={
                    confirm === "selected"
                        ? "Hapus berita terpilih?"
                        : confirm === "folder"
                            ? "Hapus folder ini?"
                            : "Hapus semua di folder ini?"
                }
                message={confirmMessage}
                confirmLabel="Hapus"
                loading={busy}
                onCancel={() => setConfirm(null)}
                onConfirm={doDelete}
            />
        </main>
    );
}
