import { useEffect, useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";

export default function OfflineBar() {
    const [offline, setOffline] = useState(!navigator.onLine);
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        const off = () => {
            setOffline(true);
            setJustReconnected(false);
        };
        const on = () => {
            setOffline(false);
            setJustReconnected(true);
            const timer = setTimeout(() => {
                setJustReconnected(false);
            }, 3000);
            return () => clearTimeout(timer);
        };

        window.addEventListener("offline", off);
        window.addEventListener("online", on);
        return () => {
            window.removeEventListener("offline", off);
            window.removeEventListener("online", on);
        };
    }, []);

    if (justReconnected) {
        return (
            <div className="offline-bar online-sync" role="status">
                <CheckCircle2 size={15} /> Kembali online — Menyinkronkan data dengan server...
            </div>
        );
    }

    if (!offline) return null;

    return (
        <div className="offline-bar" role="status">
            <WifiOff size={15} /> Mode Offline — Semua berita, bookmark, dan riwayat tetap dapat diakses & digunakan.
        </div>
    );
}
