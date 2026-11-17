import { Link } from "react-router-dom";
import { ArrowDown, Eye, Trash2 } from "lucide-react";
import { compact, timeAgo } from "../utils/format";

const Img = ({ src, alt, className }) => (
    <img className={className} src={src} alt={alt} loading="lazy"
        onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
);

// Headline Beranda: foto penuh, judul besar, statistik dan tombol turun
export const HeroCard = ({ a, onScroll }) => (
    <section className="hero">
        <Img src={a.image_url} alt="" className="hero-img" />
        <div className="hero-shade" />
        <div className="hero-body">
            <span className="chip chip-solid">{a.category}</span>
            <Link to={`/berita/${a.id}`} className="hero-link"><h2>{a.title}</h2></Link>
            {a.summary && <p className="hero-sum">{a.summary}</p>}
            <div className="hero-foot">
                <div className="hero-stat"><strong>{compact(a.views)}</strong><span>pembaca</span></div>
                <button className="hero-down" onClick={onScroll} aria-label="Lihat berita lainnya"><ArrowDown size={20} /></button>
            </div>
        </div>
    </section>
);

export const TrendCard = ({ a, rank }) => (
    <Link to={`/berita/${a.id}`} className="trend">
        <Img src={a.image_url} alt="" className="trend-img" />
        <span className="trend-rank">{rank}</span>
        <h3>{a.title}</h3>
        <p className="meta"><Eye size={13} /> {compact(a.views)}</p>
    </Link>
);

// Kartu berita: baris di mobile, kartu bergambar di desktop (diatur CSS)
export const RowCard = ({ a, onRemove }) => (
    <div className="row">
        <Link to={`/berita/${a.id}`} className="row-link">
            <div className="row-text">
                <span className="chip">{a.category}</span>
                <h3>{a.title}</h3>
                <p className="meta">{a.author || "Redaksi Spotlight"} &middot; {timeAgo(a.created_at)}</p>
            </div>
            <Img src={a.image_url} alt="" className="row-img" />
        </Link>
        {onRemove && (
            <button className="row-remove" aria-label={`Hapus bookmark ${a.title}`} onClick={() => onRemove(a)}>
                <Trash2 size={16} />
            </button>
        )}
    </div>
);
