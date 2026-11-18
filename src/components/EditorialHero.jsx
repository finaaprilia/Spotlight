import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { CATEGORIES } from "../utils/format";

const getCardStyle = (index, total, isHovered) => {
    if (isHovered) {
        return {
            transform: "translateY(-22px) rotate(0deg) scale(1.08)",
            zIndex: 30,
        };
    }
    if (total === 1) {
        return { transform: "rotate(0deg)", zIndex: 1 };
    }
    if (total === 2) {
        const rots = [-8, 8];
        const transX = [-36, 36];
        return {
            transform: `rotate(${rots[index]}deg) translateX(${transX[index]}px)`,
            zIndex: index + 1,
        };
    }
    if (total === 3) {
        const rots = [-14, 0, 14];
        const transX = [-60, 0, 60];
        const transY = [8, 0, 8];
        return {
            transform: `rotate(${rots[index]}deg) translateX(${transX[index]}px) translateY(${transY[index]}px)`,
            zIndex: index + 1,
        };
    }
    // 4 cards (default)
    const rots = [-18, -6, 6, 18];
    const transX = [-78, -26, 26, 78];
    const transY = [14, 3, 3, 14];
    return {
        transform: `rotate(${rots[index]}deg) translateX(${transX[index]}px) translateY(${transY[index]}px)`,
        zIndex: index + 1,
    };
};

export default function EditorialHero({ stories = [] }) {
    const navigate = useNavigate();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    if (!stories.length) return null;

    const deck = stories.slice(0, 4);

    return (
        <section className="editorial-hero" aria-label="Sorotan Utama">
            <div className="editorial-hero-inner">
                {/* Visual Header Tengah: Teks Besar + Card Fan */}
                <div className="editorial-hero-stage">
                    <span className="editorial-big-text left" aria-hidden="true">BROWS</span>

                    <div className="editorial-deck-wrap" role="region" aria-label="Pilihan berita utama">
                        <div className="editorial-deck">
                            {deck.map((item, idx) => {
                                const isHovered = hoveredIdx === idx;
                                const style = getCardStyle(idx, deck.length, isHovered);
                                return (
                                    <div
                                        key={item.id}
                                        className={`deck-card deck-card-${idx}${isHovered ? " is-hovered" : ""}`}
                                        style={style}
                                        onMouseEnter={() => setHoveredIdx(idx)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                        onClick={() => navigate(`/berita/${item.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && navigate(`/berita/${item.id}`)}
                                        aria-label={item.title}
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt=""
                                                className="deck-card-img"
                                                loading="lazy"
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        ) : (
                                            <div className="deck-card-placeholder">
                                                <Sparkles size={28} />
                                            </div>
                                        )}
                                        <div className="deck-card-shade" />
                                        <div className="deck-card-chip">{item.category}</div>
                                        <div className="deck-card-meta">
                                            <p className="deck-card-title">{item.title}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <span className="editorial-big-text right" aria-hidden="true">PDATES</span>
                </div>

                {/* Deskripsi & Tagline Bawah */}
                <div className="editorial-foot">
                    <p className="editorial-desc">
                        BACA BERBAGAI KISAH INSPIRATIF, LIPUTAN MENDALAM, DAN BERITA TERKINI YANG DIKEMAS RINGKAS UNTUK ANDA.
                    </p>
                    <p className="editorial-tagline">
                        EDISI TERKINI • SPOTLIGHT INDONESIA
                    </p>
                </div>

                {/* Ticker / Kategori Navigasi Cepat */}
                <div className="editorial-ticker">
                    {CATEGORIES.slice(1).map((cat) => (
                        <Link
                            key={cat}
                            to={`/berita?category=${encodeURIComponent(cat)}`}
                            className="editorial-ticker-link"
                        >
                            {cat.toUpperCase()}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
