export default function ConfirmDialog({ open, title, message, confirmLabel = "Hapus", loading, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="scrim center" onClick={onCancel}>
            <div className="dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="dialog-actions">
                    <button className="btn" onClick={onCancel} disabled={loading}>Batal</button>
                    <button className="btn danger" onClick={onConfirm} disabled={loading}>
                        {loading ? "Memproses" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
