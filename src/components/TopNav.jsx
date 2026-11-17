import { NavLink, Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext";
import InstallButton from "./InstallButton";

const ITEMS = [
    { to: "/", label: "Beranda", end: true },
    { to: "/berita", label: "Berita" },
    { to: "/bookmark", label: "Bookmark", badge: true },
    { to: "/profil", label: "Profil" },
];

// Navigasi atas untuk layar lebar. Di mobile digantikan BottomNav.
export default function TopNav() {
    const { bookmarks, dark, setDark } = useApp();
    return (
        <header className="topnav">
            <Link to="/" className="logo" aria-label="Spotlight, ke Beranda">
                <svg width="26" height="26" viewBox="0 0 512 512" aria-hidden="true">
                    <circle cx="256" cy="256" r="190" fill="none" stroke="currentColor" strokeWidth="44" />
                    <circle cx="256" cy="256" r="72" fill="var(--accent)" />
                </svg>
                Spotlight
            </Link>

            <nav className="pill-nav" aria-label="Navigasi utama">
                {ITEMS.map(({ to, label, end, badge }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => `pill${isActive ? " on" : ""}`}>
                        {label}
                        {badge && bookmarks.length > 0 && <i className="pill-badge">{bookmarks.length}</i>}
                    </NavLink>
                ))}
            </nav>

            <div className="topnav-end">
                <button className="icon-btn outline" onClick={() => setDark(!dark)} aria-label={dark ? "Mode terang" : "Mode gelap"}>
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <InstallButton className="btn primary" />
            </div>
        </header>
    );
}
