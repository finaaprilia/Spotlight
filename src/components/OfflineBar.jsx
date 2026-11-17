import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBar() {
    const [offline, setOffline] = useState(!navigator.onLine);
    useEffect(() => {
        const off = () => setOffline(true);
        const on = () => setOffline(false);
        window.addEventListener("offline", off);
        window.addEventListener("online", on);
        return () => {
            window.removeEventListener("offline", off);
            window.removeEventListener("online", on);
        };
    }, []);
    if (!offline) return null;
    return (
        <div className="offline-bar" role="status">
            <WifiOff size={15} /> Anda sedang offline. Berita yang pernah dibuka tetap bisa dibaca.
        </div>
    );
}
