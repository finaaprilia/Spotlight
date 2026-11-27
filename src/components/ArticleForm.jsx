import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ArticleAPI, UploadAPI } from "../api/client";
import { CATEGORIES } from "../utils/format";
import { compressImage } from "../utils/image";

const EMPTY = { title: "", category: "Umum", author: "", image_url: "", summary: "", content: "" };

export default function ArticleForm({ open, article, onClose, onSaved }) {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        if (open) {
            setForm(article ? { ...EMPTY, ...article } : EMPTY);
            setError("");
        }
    }, [open, article]);

    if (!open) return null;
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

    const pickPhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError("");
        setUploading(true);
        try {
            const dataUrl = await compressImage(file);
            if (!navigator.onLine) {
                // Saat offline: gunakan langsung foto hasil kompresi data URL
                setForm((f) => ({ ...f, image_url: dataUrl }));
            } else {
                try {
                    const { url } = await UploadAPI.image(dataUrl);
                    setForm((f) => ({ ...f, image_url: url }));
                } catch {
                    // Fallback jika unggah server gagal
                    setForm((f) => ({ ...f, image_url: dataUrl }));
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (form.title.trim().length < 5) return setError("Judul minimal 5 karakter.");
        if (!form.author?.trim()) return setError("Nama penulis wajib diisi.");
        if (!form.content.trim()) return setError("Isi berita wajib diisi.");
        if (uploading) return setError("Tunggu hingga foto selesai diunggah.");
        setSaving(true);
        setError("");
        try {
            const payload = {
                title: form.title.trim(), category: form.category, author: form.author.trim(),
                image_url: form.image_url || null, summary: form.summary?.trim() || "",
                content: form.content.trim(), is_featured: false,
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

                <div className="photo-field">
                    <span className="field-label">Foto sampul</span>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickPhoto} />
                    {form.image_url ? (
                        <div className="photo-preview">
                            <img src={form.image_url} alt="Pratinjau foto sampul" />
                            <div className="photo-actions">
                                <button type="button" className="btn sm" onClick={() => fileRef.current.click()} disabled={uploading}>Ganti foto</button>
                                <button type="button" className="btn sm" onClick={() => setForm({ ...form, image_url: "" })} disabled={uploading}>Hapus</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" className="photo-drop" onClick={() => fileRef.current.click()} disabled={uploading}>
                            {uploading ? <Loader2 className="spin" size={22} /> : <ImagePlus size={22} />}
                            <strong>{uploading ? "Mengunggah foto" : "Pilih foto dari perangkat"}</strong>
                            <span>JPG, PNG, atau WebP. Otomatis diperkecil.</span>
                        </button>
                    )}
                    {uploading && form.image_url && <span className="muted">Mengunggah foto baru</span>}
                </div>

                <label>Judul<input value={form.title} onChange={set("title")} placeholder="Judul berita" /></label>
                <div className="two">
                    <label>Kategori
                        <select value={form.category} onChange={set("category")}>
                            {CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </label>
                    <label>Penulis<input value={form.author || ""} onChange={set("author")} placeholder="Nama penulis" /></label>
                </div>
                <label>Ringkasan<textarea rows="2" value={form.summary || ""} onChange={set("summary")} placeholder="Satu atau dua kalimat pembuka" /></label>
                <label>Isi berita<textarea rows="7" value={form.content} onChange={set("content")} placeholder="Pisahkan paragraf dengan baris kosong" /></label>

                {error && <p className="form-error">{error}</p>}
                <button className="btn primary block" disabled={saving || uploading}>{saving ? "Menyimpan" : "Simpan berita"}</button>
            </form>
        </div>
    );
}
