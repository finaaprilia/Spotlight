import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { HistoryAPI } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { RowCard } from "../components/ArticleCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { Empty, ErrorBox, Loading } from "../components/States";
import { timeAgo } from "../utils/format";

export default function History() {
    const { deviceId, toast } = useApp();
    const navigate = useNavigate();
    const { data, loading, error, reload } = useAsync(() => HistoryAPI.list(deviceId), [deviceId]);

    const [removed, setRemoved] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);

    const items = (data || []).filter((a) => !removed.includes(a.id));

    const removeOne = async (a) => {
        try {
            await HistoryAPI.remove(deviceId, a.id);
            setRemoved((r) => [...r, a.id]);
            toast("Dihapus dari riwayat");
        } catch (e) {
            toast(e.message);
        }
    };

    const clearAll = async () => {
        setBusy(true);
        try {
            await HistoryAPI.clear(deviceId);
            setRemoved((data || []).map((a) => a.id));
            toast("Semua riwayat dihapus");
        } catch (e) {
            toast(e.message);
        } finally {
            setBusy(false);
            setConfirm(false);
        }
    };

    return (
        <main className="page">
            <header className="fhead">
                <button className="icon-btn solid" onClick={() => navigate("/profil")} aria-label="Kembali">
                    <ArrowLeft size={20} />
                </button>
                <div className="fhead-title">
                    <h1>Riwayat baca</h1>
                    {!loading && !error && <p className="muted">{items.length} berita</p>}
                </div>
                {items.length > 0 && (
                    <button className="btn sm" onClick={() => setConfirm(true)}>Hapus semua</button>
                )}
            </header>

            {loading && <Loading text="Memuat riwayat" />}
            {error && <ErrorBox message={error} onRetry={reload} />}
            {!loading && !error && items.length === 0 && (
                <Empty title="Belum ada riwayat" hint="Berita yang Anda buka akan muncul di sini.">
                    <Link to="/berita" className="btn primary">Jelajahi berita</Link>
                </Empty>
            )}

            {items.length > 0 && (
                <div className="list">
                    {items.map((a) => (
                        <RowCard key={a.id} a={a} meta={`Dibaca ${timeAgo(a.read_at)}`} onRemove={removeOne} />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={confirm}
                title="Hapus semua riwayat?"
                message="Seluruh catatan berita yang pernah Anda baca akan dihapus. Beritanya sendiri tidak ikut terhapus."
                confirmLabel="Hapus semua"
                loading={busy}
                onCancel={() => setConfirm(false)}
                onConfirm={clearAll}
            />
        </main>
    );
}
