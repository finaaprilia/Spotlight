import { useState } from "react";
import { Check, FolderPlus, Folder, X, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";

/**
 * Modal untuk:
 * 1. Mode "create": Membuat folder bookmark kustom baru secara langsung.
 * 2. Mode "select": Memilih/memindahkan folder penyimpanan suatu artikel setelah di-bookmark.
 */
export default function BookmarkFolderModal({
    open,
    onClose,
    mode = "select", // "select" | "create"
    article = null,
}) {
    const { customFolders, createFolder, setArticleFolder, getArticleFolder } = useApp();

    const [newFolderName, setNewFolderName] = useState("");
    const [creatingInline, setCreatingInline] = useState(mode === "create");
    const [errorMsg, setErrorMsg] = useState("");

    if (!open) return null;

    const currentFolder = article ? getArticleFolder(article) : "";
    const defaultCategory = article?.category || "Umum";

    // Daftar semua pilihan folder:
    // 1. Kategori default bawaan artikel
    // 2. Semua folder kustom yang dibuat pengguna
    const availableFolders = Array.from(
        new Set([defaultCategory, ...customFolders])
    ).filter(Boolean);

    const handleSelectFolder = (folderName) => {
        if (!article) return;
        setArticleFolder(article.id, folderName);
        onClose();
    };

    const handleCreateNewFolder = (e) => {
        e.preventDefault();
        setErrorMsg("");
        try {
            const created = createFolder(newFolderName);
            setNewFolderName("");
            if (mode === "select" && article) {
                // Langsung simpan artikel ke folder baru tersebut
                setArticleFolder(article.id, created);
                onClose();
            } else {
                onClose();
            }
        } catch (err) {
            setErrorMsg(err.message || "Gagal membuat folder");
        }
    };

    return (
        <div className="scrim center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="dialog folder-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="folder-dialog-head">
                    <div className="folder-dialog-title">
                        <FolderPlus size={22} className="accent-icon" />
                        <div>
                            <h3>
                                {mode === "create" || creatingInline
                                    ? "Buat Folder Bookmark"
                                    : "Pilih Folder Bookmark"}
                            </h3>
                            <p className="muted">
                                {mode === "create" || creatingInline
                                    ? "Tulis judul folder baru Anda"
                                    : `Disimpan ke "${currentFolder || defaultCategory}". Pindahkan ke folder lain?`}
                            </p>
                        </div>
                    </div>
                    <button className="icon-btn outline sm" onClick={onClose} aria-label="Tutup">
                        <X size={18} />
                    </button>
                </div>

                {/* Mode Form Input Buat Folder Baru */}
                {(mode === "create" || creatingInline) ? (
                    <form onSubmit={handleCreateNewFolder} className="folder-form">
                        <div className="field">
                            <label htmlFor="folder-input">Judul Folder</label>
                            <input
                                id="folder-input"
                                type="text"
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Contoh: Baca Nanti, Favorit..."
                                maxLength={30}
                            />
                            {errorMsg && <p className="err-text">{errorMsg}</p>}
                        </div>

                        <div className="dialog-actions">
                            {mode === "select" && (
                                <button
                                    type="button"
                                    className="btn outline"
                                    onClick={() => {
                                        setCreatingInline(false);
                                        setErrorMsg("");
                                    }}
                                >
                                    Kembali
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn outline"
                                onClick={onClose}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn primary"
                                disabled={!newFolderName.trim()}
                            >
                                Simpan Folder
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Mode Pemilihan Folder untuk Artikel */
                    <div className="folder-select-view">
                        <div className="folder-list" role="listbox">
                            {availableFolders.map((f) => {
                                const isSelected = f === currentFolder;
                                const isDefault = f === defaultCategory;
                                return (
                                    <button
                                        key={f}
                                        type="button"
                                        className={`folder-item${isSelected ? " active" : ""}`}
                                        onClick={() => handleSelectFolder(f)}
                                    >
                                        <div className="folder-item-left">
                                            <Folder size={18} />
                                            <span>{f}</span>
                                            {isDefault && <span className="folder-badge-sub">Kategori Berita</span>}
                                        </div>
                                        {isSelected && <Check size={18} className="folder-check" />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="btn outline add-folder-inline-btn"
                            onClick={() => {
                                setCreatingInline(true);
                                setNewFolderName("");
                            }}
                        >
                            <Plus size={16} /> Buat Folder Baru
                        </button>

                        <div className="dialog-actions">
                            <button type="button" className="btn primary" onClick={onClose}>
                                Selesai
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
