import { Link } from "react-router-dom";
import { Check, Eye, Trash2 } from "lucide-react";
import { compact, timeAgo } from "../utils/format";
import LazyImage from "./LazyImage";

// Kartu utama (headline Beranda)
export const HeroCard = ({ a }) => (
    <Link to={`/berita/${a.id}`} className="hero">
        <LazyImage src={a.image_url} alt={a.title} className="hero-img" />
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
        <LazyImage src={a.image_url} alt={a.title} className="trend-img" />
        <span className="trend-rank">{rank}</span>
        <h3>{a.title}</h3>
        <p className="meta"><Eye size={13} /> {compact(a.views)}</p>
    </Link>
);

// Kartu baris (daftar Berita, Folder Bookmark, Riwayat, Terbaru)
//  - onRemove   : tombol hapus kecil di pojok kanan bawah (dipakai Riwayat)
//  - selectable : mode pilih, kartu menjadi tombol dengan kotak centang
//  - meta       : teks pengganti waktu terbit
export const RowCard = ({ a, onRemove, selectable, checked, onToggle, meta }) => {
    const body = (
        <>
            <div className="row-text">
                <span className="chip">{a.category}</span>
                <h3>{a.title}</h3>
                <p className="meta">{meta ?? timeAgo(a.created_at)}</p>
            </div>
            <LazyImage src={a.image_url} alt={a.title} className="row-img" />
        </>
    );

    if (selectable) {
        return (
            <div className={`row${checked ? " row-selected" : ""}`}>
                <button
                    type="button"
                    className="row-link row-pick"
                    onClick={() => onToggle(a.id)}
                    aria-pressed={checked}
                >
                    <span className={`check-box${checked ? " on" : ""}`} aria-hidden="true">
                        {checked && <Check size={14} strokeWidth={3} />}
                    </span>
                    {body}
                </button>
            </div>
        );
    }

    return (
        <div className="row">
            <Link to={`/berita/${a.id}`} className="row-link">{body}</Link>
            {onRemove && (
                <button className="row-remove" aria-label={`Hapus ${a.title}`} onClick={() => onRemove(a)}>
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};
