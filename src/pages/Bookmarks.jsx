import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Empty } from "../components/States";

export default function Bookmarks() {
    const { bookmarks, refreshBookmarks } = useApp();

    useEffect(() => {
        refreshBookmarks(); // sinkronkan dengan server saat halaman dibuka
    }, [refreshBookmarks]);

    // Kelompokkan per kategori. Daftar bookmark sudah berurutan dari yang terbaru disimpan.
    const folders = useMemo(() => {
        const map = new Map();
        bookmarks.forEach((a) => {
            const key = a.category || "Umum";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(a);
        });
        return [...map.entries()]
            .map(([name, items]) => ({
                name,
                count: items.length,
                cover: items.find((i) => i.image_url)?.image_url,
            }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [bookmarks]);

    return (
        <main className="page">
            <header className="top">
                <h1 className="title">Bookmark</h1>
            </header>

            {bookmarks.length === 0 ? (
                <Empty title="Belum ada bookmark" hint="Simpan berita dari halaman detail untuk membacanya nanti.">
                    <Link to="/berita" className="btn primary">Jelajahi berita</Link>
                </Empty>
            ) : (
                <div className="folders">
                    <Link to="/bookmark/semua" className="fcard">
                        <div className="fcard-cover fcard-all">
                            <strong>{bookmarks.length}</strong>
                            <span>berita tersimpan</span>
                        </div>
                        <div className="fcard-meta">
                            <h3>Semua bookmark</h3>
                        </div>
                    </Link>

                    {folders.map((f) => (
                        <Link key={f.name} to={`/bookmark/${encodeURIComponent(f.name)}`} className="fcard">
                            <div className="fcard-cover">
                                <span className="fcard-initial" aria-hidden="true">{f.name[0]}</span>
                                {f.cover && (
                                    <img
                                        src={f.cover}
                                        alt=""
                                        loading="lazy"
                                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                                    />
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
        </main>
    );
}
