import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { ArticleAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { RowCard } from "../components/ArticleCard";
import ArticleForm from "../components/ArticleForm";
import { Empty, ErrorBox, Loading } from "../components/States";
import { CATEGORIES } from "../utils/format";

const PAGE_SIZE = 12;

export default function News() {
    const { toast } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const catFromUrl = searchParams.get("category");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState(catFromUrl || "Semua");
    const [sort, setSort] = useState("terbaru");
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        if (catFromUrl) setCategory(catFromUrl);
    }, [catFromUrl]);

    // Reset ke halaman 1 jika pencarian, kategori, atau urutan berubah
    useEffect(() => {
        setPage(1);
    }, [query, category, sort]);

    // Debounce pencarian agar tidak memanggil API di setiap ketikan
    useEffect(() => {
        const t = setTimeout(() => setQuery(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const { data, loading, error, reload } = useAsync(
        () => ArticleAPI.list({ search: query, category, sort }),
        [query, category, sort]
    );

    const totalItems = data ? data.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const paginated = data ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
                <span className="muted">{data ? `${totalItems} berita` : ""}</span>
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
            {!loading && paginated.length > 0 && (
                <div className="list">{paginated.map((a) => <RowCard key={a.id} a={a} />)}</div>
            )}

            {!loading && totalPages > 1 && (
                <nav className="pagination" aria-label="Navigasi halaman berita">
                    <button
                        type="button"
                        className="pagination-btn prev"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft size={16} /> Sebelumnya
                    </button>

                    <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={`pagination-num${p === page ? " on" : ""}`}
                                onClick={() => handlePageChange(p)}
                                aria-label={`Halaman ${p}`}
                                aria-current={p === page ? "page" : undefined}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="pagination-btn next"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        aria-label="Halaman berikutnya"
                    >
                        Selanjutnya <ChevronRight size={16} />
                    </button>
                </nav>
            )}

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
