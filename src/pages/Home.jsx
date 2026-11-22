import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArticleAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import EditorialHero from "../components/EditorialHero";
import { RowCard, TrendCard } from "../components/ArticleCard";
import { Empty, ErrorBox, Loading } from "../components/States";
import InstallButton from "../components/InstallButton";

export default function Home() {
    const { data, loading, error, reload } = useAsync(() => ArticleAPI.list({ limit: 40 }), []);

    const { showcase, trending, latest } = useMemo(() => {
        const all = Array.isArray(data) ? data : [];
        const byDate = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const deck = byDate.slice(0, 4);

        return {
            showcase: deck,
            trending: [...all].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6),
            latest: byDate.slice(0, 8),
        };
    }, [data]);

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
                            <div className="hscroll">
                                {trending.map((a, i) => <TrendCard key={a.id} a={a} rank={i + 1} />)}
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
