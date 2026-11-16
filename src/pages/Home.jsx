import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArticleAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { HeroCard, RowCard, TrendCard } from "../components/ArticleCard";
import { Empty, ErrorBox, Loading } from "../components/States";

export default function Home() {
    const { data, loading, error, reload } = useAsync(() => ArticleAPI.list({ limit: 40 }), []);

    const { headline, trending, latest } = useMemo(() => {
        const all = data || [];
        const byDate = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const headline = all.find((a) => a.is_featured) || byDate[0];
        return {
            headline,
            trending: [...all].sort((a, b) => b.views - a.views).slice(0, 5),
            latest: byDate.filter((a) => a.id !== headline?.id).slice(0, 6),
        };
    }, [data]);

    const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

    return (
        <main className="page">
            <header className="top">
                <div>
                    <h1 className="brand">Spotlight</h1>
                    <p className="muted">{today}</p>
                </div>
            </header>

            {loading && <Loading />}
            {error && <ErrorBox message={error} onRetry={reload} />}
            {!loading && !error && !headline && (
                <Empty title="Belum ada berita" hint="Tambahkan berita pertama dari halaman Berita." />
            )}

            {headline && (
                <>
                    <section>
                        <h2 className="sec">Headline</h2>
                        <HeroCard a={headline} />
                    </section>

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
                </>
            )}
        </main>
    );
}
