import { NavLink } from "react-router-dom";
import { Bookmark, Home, Newspaper, User } from "lucide-react";
import { useApp } from "../context/AppContext";

const ITEMS = [
    { to: "/", label: "Beranda", icon: Home, end: true },
    { to: "/berita", label: "Berita", icon: Newspaper },
    { to: "/bookmark", label: "Bookmark", icon: Bookmark, badge: true },
    { to: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
    const { bookmarks } = useApp();
    return (
        <nav className="bubble-nav" aria-label="Navigasi utama">
            {ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `bn-item${isActive ? " on" : ""}`}>
                    <span className="bn-icon">
                        <Icon size={20} strokeWidth={1.9} />
                        {badge && bookmarks.length > 0 && <i className="bn-badge">{bookmarks.length}</i>}
                    </span>
                    <span className="bn-label">{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
