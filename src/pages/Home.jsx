import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArticleAPI, HistoryAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import EditorialHero from "../components/EditorialHero";
import { RowCard, TrendCard } from "../components/ArticleCard";
import { Empty, ErrorBox, Loading } from "../components/States";
import InstallButton from "../components/InstallButton";

export default function Home() {
    const { deviceId } = useApp();

    const { data, loading, error, reload } = useAsync(() => ArticleAPI.list({ limit: 40 }), []);

    // Fetch personal trending — diurutkan dari yang paling sering dibaca user
    const { data: trendingData } = useAsync(
        () => HistoryAPI.trending(deviceId, 10),
        [deviceId]
    );

    const { showcase, trending, latest } = useMemo(() => {
        const all = Array.isArray(data) ? data : [];
        const byDate = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const deck = byDate.slice(0, 4);

        // Trending: gunakan data personal (read_count) jika ada.
        // Jika user belum pernah membaca apapun (trendingData kosong), tampilkan artikel terbaru sebagai fallback.
        let trendingList;
        if (Array.isArray(trendingData) && trendingData.length > 0) {
            // Sudah ada riwayat baca — urutkan dari yang paling sering dibaca
            trendingList = [...trendingData]
                .sort((a, b) => (b.read_count || 0) - (a.read_count || 0))
                .slice(0, 6);
        } else {
            // Fallback: belum ada riwayat, tampilkan berita terbaru
            trendingList = byDate.slice(0, 6);
        }

        return {
            showcase: deck,
            trending: trendingList,
            latest: byDate.slice(0, 8),
        };
    }, [data, trendingData]);

    const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

    return (
        <main className="page">
            <header className="top top-home">
                <div>
                    <h1 className="brand">Spotlight</h1>
                    <p className="muted">{today}</p>
                </div>
                <InstallButton className="btn primary sm" />
            </header>

            {loading && <Loading />}
            {error && <ErrorBox message={error} onRetry={reload} />}
            {!loading && !error && showcase.length === 0 && (
                <Empty title="Belum ada berita" hint="Tambahkan berita pertama dari halaman Berita." />
            )}

            {showcase.length > 0 && (
                <>
                    <EditorialHero stories={showcase} />

                    <div id="konten" className="stack">
                        <section>
                            <h2 className="sec">Trending</h2>
                            <p className="muted" style={{ fontSize: "0.78rem", marginBottom: "8px", marginTop: "-4px" }}>
                                {Array.isArray(trendingData) && trendingData.length > 0
                                    ? "Berdasarkan berita yang paling sering kamu baca"
                                    : "Berita terbaru untuk kamu mulai"}
                            </p>
                            <div className="hscroll">
                                {trending.map((a, i) => (
                                    <TrendCard key={a.id} a={a} rank={i + 1} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="sec-row">
                                <h2 className="sec">Terbaru</h2>
                                <Link to="/berita" className="link">Lihat semua</Link>
                            </div>
                            <div className="list">{latest.map((a) => <RowCard key={a.id} a={a} />)}</div>
                        </section>
                    </div>
                </>
            )}
        </main>
    );
}
