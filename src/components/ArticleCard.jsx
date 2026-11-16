import { Link } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { compact, timeAgo } from "../utils/format";

const Img = ({ src, alt, className }) => (
    <img className={className} src={src} alt={alt} loading="lazy"
        onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
);

// Kartu utama (headline Beranda)
export const HeroCard = ({ a }) => (
    <Link to={`/berita/${a.id}`} className="hero">
        <Img src={a.image_url} alt="" className="hero-img" />
        <div className="hero-shade" />
        <div className="hero-body">
            <span className="chip chip-solid">{a.category}</span>
            <h2>{a.title}</h2>
            <p>{timeAgo(a.created_at)}</p>
        </div>
    </Link>
);

// Kartu trending (scroll horizontal)
export const TrendCard = ({ a, rank }) => (
    <Link to={`/berita/${a.id}`} className="trend">
        <Img src={a.image_url} alt="" className="trend-img" />
        <span className="trend-rank">{rank}</span>
        <h3>{a.title}</h3>
        <p className="meta"><Eye size={13} /> {compact(a.views)}</p>
    </Link>
);

// Kartu baris (daftar Berita, Bookmark, Terbaru)
export const RowCard = ({ a, onRemove }) => (
    <div className="row">
        <Link to={`/berita/${a.id}`} className="row-link">
            <div className="row-text">
                <span className="chip">{a.category}</span>
                <h3>{a.title}</h3>
                <p className="meta">{timeAgo(a.created_at)}</p>
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
