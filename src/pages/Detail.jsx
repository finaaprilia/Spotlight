import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Clock, Eye, Pencil, Share2, Trash2 } from "lucide-react";
import { ArticleAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import ArticleForm from "../components/ArticleForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { ErrorBox, Loading } from "../components/States";
import { compact, fmtDate, readTime } from "../utils/format";

export default function Detail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isBookmarked, toggleBookmark, refreshBookmarks, toast } = useApp();
    const [editing, setEditing] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data: article, loading, error, reload } = useAsync(async () => {
        const a = await ArticleAPI.get(id);
        // Views bertambah otomatis, satu kali per sesi untuk tiap berita
        const key = `viewed:${id}`;
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            ArticleAPI.view(id).catch(() => { });
            return { ...a, views: (a.views || 0) + 1 };
        }
        return a;
    }, [id]);

    const share = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) await navigator.share({ title: article.title, text: article.summary || "", url });
            else {
                await navigator.clipboard.writeText(url);
                toast("Tautan disalin");
            }
        } catch {
            /* dibatalkan pengguna */
        }
    };

    const remove = async () => {
        setDeleting(true);
        try {
            await ArticleAPI.remove(id);
            await refreshBookmarks();
            toast("Berita dihapus");
            navigate("/berita", { replace: true });
        } catch (e) {
            toast(e.message);
            setDeleting(false);
        }
    };

    if (loading) return <div className="page"><Loading /></div>;
    if (error)
        return (
            <div className="page">
                <button className="icon-btn solid" onClick={() => navigate(-1)} aria-label="Kembali"><ArrowLeft size={20} /></button>
                <ErrorBox message={error} onRetry={reload} />
            </div>
        );

    const saved = isBookmarked(article.id);

    return (
        <article className="detail">
            <div className="cover">
                {article.image_url && <img src={article.image_url} alt="" />}
                <div className="cover-shade" />
                <div className="cover-bar">
                    <button className="icon-btn glass" onClick={() => navigate(-1)} aria-label="Kembali"><ArrowLeft size={20} /></button>
                    <div className="cover-actions">
                        <button className="icon-btn glass" onClick={share} aria-label="Bagikan"><Share2 size={19} /></button>
                        <button className={`icon-btn glass${saved ? " active" : ""}`} onClick={() => toggleBookmark(article)}
                            aria-label={saved ? "Hapus bookmark" : "Simpan bookmark"} aria-pressed={saved}>
                            <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="sheet-body">
                <span className="chip chip-solid">{article.category}</span>
                <h1>{article.title}</h1>

                <div className="byline">
                    <div className="avatar">{(article.author || "S")[0]}</div>
                    <div>
                        <strong>{article.author || "Redaksi Spotlight"}</strong>
                        <span>{fmtDate(article.created_at)}</span>
                    </div>
                </div>
                <div className="stats">
                    <span><Eye size={14} /> {compact(article.views)} dibaca</span>
                    <span><Clock size={14} /> {readTime(article.content)} menit baca</span>
                </div>

                {article.summary && <p className="lede">{article.summary}</p>}
                <div className="prose">
                    {article.content.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="actions">
                    <button className="btn" onClick={() => setEditing(true)}><Pencil size={16} /> Edit</button>
                    <button className="btn danger" onClick={() => setConfirm(true)}><Trash2 size={16} /> Hapus</button>
                </div>
            </div>

            <ArticleForm
                open={editing}
                article={article}
                onClose={() => setEditing(false)}
                onSaved={() => { setEditing(false); toast("Berita diperbarui"); reload(); refreshBookmarks(); }}
            />
            <ConfirmDialog
                open={confirm}
                title="Hapus berita ini?"
                message="Berita dan bookmark terkait akan dihapus permanen."
                loading={deleting}
                onCancel={() => setConfirm(false)}
                onConfirm={remove}
            />
        </article>
    );
}
