import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ArticleAPI } from "../api/client";
import { CATEGORIES } from "../utils/format";

const EMPTY = { title: "", category: "Umum", author: "", image_url: "", summary: "", content: "", is_featured: false };

export default function ArticleForm({ open, article, onClose, onSaved }) {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setForm(article ? { ...EMPTY, ...article } : EMPTY);
            setError("");
        }
    }, [open, article]);

    if (!open) return null;
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (form.title.trim().length < 5) return setError("Judul minimal 5 karakter.");
        if (!form.content.trim()) return setError("Isi berita wajib diisi.");
        setSaving(true);
        setError("");
        try {
            const payload = {
                title: form.title.trim(), category: form.category, author: form.author?.trim() || undefined,
                image_url: form.image_url?.trim() || null, summary: form.summary?.trim() || "",
                content: form.content.trim(), is_featured: form.is_featured,
            };
            const saved = article ? await ArticleAPI.update(article.id, payload) : await ArticleAPI.create(payload);
            onSaved(saved, Boolean(article));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="scrim" onClick={onClose}>
            <form className="sheet" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
                <div className="sheet-grip" />
                <header className="sheet-head">
                    <h2>{article ? "Edit berita" : "Tambah berita"}</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
                </header>

                <label>Judul<input value={form.title} onChange={set("title")} placeholder="Judul berita" /></label>
                <div className="two">
                    <label>Kategori
                        <select value={form.category} onChange={set("category")}>
                            {CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </label>
                    <label>Penulis<input value={form.author || ""} onChange={set("author")} placeholder="Nama penulis" /></label>
                </div>
                <label>URL gambar sampul<input value={form.image_url || ""} onChange={set("image_url")} placeholder="https://..." /></label>
                <label>Ringkasan<textarea rows="2" value={form.summary || ""} onChange={set("summary")} /></label>
                <label>Isi berita<textarea rows="6" value={form.content} onChange={set("content")} /></label>
                <label className="check">
                    <input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} />
                    Jadikan headline di Beranda
                </label>

                {error && <p className="form-error">{error}</p>}
                <button className="btn primary block" disabled={saving}>{saving ? "Menyimpan" : "Simpan berita"}</button>
            </form>
        </div>
    );
}
