import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { RowCard } from "../components/ArticleCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { Empty } from "../components/States";

export default function Bookmarks() {
    const { bookmarks, toggleBookmark, clearBookmarks, refreshBookmarks } = useApp();
    const [confirm, setConfirm] = useState(false);

    useEffect(() => {
        refreshBookmarks(); // sinkronkan dengan server saat halaman dibuka
    }, [refreshBookmarks]);

    return (
        <main className="page">
            <header className="top">
                <h1 className="title">Bookmark</h1>
                {bookmarks.length > 0 && (
                    <button className="btn sm" onClick={() => setConfirm(true)}>Hapus semua</button>
                )}
            </header>

            {bookmarks.length === 0 ? (
                <Empty title="Belum ada bookmark" hint="Simpan berita dari halaman detail untuk membacanya nanti.">
                    <Link to="/berita" className="btn primary">Jelajahi berita</Link>
                </Empty>
            ) : (
                <div className="list">
                    {bookmarks.map((a) => <RowCard key={a.id} a={a} onRemove={toggleBookmark} />)}
                </div>
            )}

            <ConfirmDialog
                open={confirm}
                title="Hapus semua bookmark?"
                message={`${bookmarks.length} berita akan dihapus dari koleksi Anda.`}
                confirmLabel="Hapus semua"
                onCancel={() => setConfirm(false)}
                onConfirm={async () => { await clearBookmarks(); setConfirm(false); }}
            />
        </main>
    );
}
