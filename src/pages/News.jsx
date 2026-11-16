import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { ArticleAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { RowCard } from "../components/ArticleCard";
import ArticleForm from "../components/ArticleForm";
import { Empty, ErrorBox, Loading } from "../components/States";
import { CATEGORIES } from "../utils/format";

export default function News() {
    const { toast } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Semua");
    const [sort, setSort] = useState("terbaru");
    const [formOpen, setFormOpen] = useState(false);

    // Debounce pencarian agar tidak memanggil API di setiap ketikan
    useEffect(() => {
        const t = setTimeout(() => setQuery(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const { data, loading, error, reload } = useAsync(
        () => ArticleAPI.list({ search: query, category, sort }),
        [query, category, sort]
    );

    return (
        <main className="page">
            <header className="top">
                <h1 className="title">Berita</h1>
                <button className="btn primary sm" onClick={() => setFormOpen(true)}>
                    <Plus size={16} /> Tambah
                </button>
            </header>

            <div className="search">
                <Search size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau ringkasan" aria-label="Cari berita" />
                {search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian"><X size={16} /></button>}
            </div>

            <div className="chips">
                {CATEGORIES.map((c) => (
                    <button key={c} className={`chip-btn${c === category ? " on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
            </div>

            <div className="sort">
                <span className="muted">{data ? `${data.length} berita` : ""}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan">
                    <option value="terbaru">Terbaru</option>
                    <option value="terpopuler">Terpopuler</option>
                    <option value="judul">Judul A sampai Z</option>
                </select>
            </div>

            {loading && <Loading />}
            {error && <ErrorBox message={error} onRetry={reload} />}
            {!loading && !error && data?.length === 0 && (
                <Empty title="Tidak ada hasil" hint="Ubah kata kunci atau pilih kategori lain." />
            )}
            {!loading && data && <div className="list">{data.map((a) => <RowCard key={a.id} a={a} />)}</div>}

            <ArticleForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={(a) => {
                    setFormOpen(false);
                    toast("Berita ditambahkan");
                    navigate(`/berita/${a.id}`);
                }}
            />
        </main>
    );
}
