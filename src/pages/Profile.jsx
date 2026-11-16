import { Bookmark, Moon, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";

const Switch = ({ on, onChange, label }) => (
    <button role="switch" aria-checked={on} aria-label={label} className={`switch${on ? " on" : ""}`} onClick={() => onChange(!on)}>
        <i />
    </button>
);

export default function Profile({ onReplayIntro }) {
    const { dark, setDark, bookmarks, deviceId } = useApp();

    return (
        <main className="page">
            <header className="top"><h1 className="title">Profil</h1></header>

            <section className="maker">
                <div className="maker-mark">FA</div>
                <div>
                    <p className="muted">Dibuat oleh</p>
                    <h2>Fina Aprilia</h2>
                    <p className="nim">NIM 21120124140125</p>
                </div>
            </section>

            <section className="panel">
                <h3>Pengaturan</h3>
                <div className="setting">
                    <Moon size={18} />
                    <div><strong>Mode gelap</strong><span>Tampilan lebih nyaman di tempat redup</span></div>
                    <Switch on={dark} onChange={setDark} label="Mode gelap" />
                </div>
                <div className="setting">
                    <Bookmark size={18} />
                    <div><strong>Bookmark tersimpan</strong><span>{bookmarks.length} berita</span></div>
                </div>
                <button className="setting" onClick={onReplayIntro}>
                    <RotateCcw size={18} />
                    <div><strong>Ulangi pengenalan</strong><span>Lihat kembali panduan awal</span></div>
                </button>
            </section>

            <section className="panel">
                <h3>Tentang aplikasi</h3>
                <p className="about">
                    Spotlight adalah aplikasi berita berbasis Progressive Web App yang dibuat sebagai Tugas Akhir
                    Praktikum Pemrograman Perangkat Bergerak 2026. Data disimpan di Supabase dan dilayani melalui
                    API Express buatan sendiri.
                </p>
                <dl className="facts">
                    <dt>Versi</dt><dd>1.0.0</dd>
                    <dt>Teknologi</dt><dd>React, Vite, Express, Supabase</dd>
                    <dt>ID perangkat</dt><dd className="mono">{deviceId.slice(0, 8)}</dd>
                </dl>
            </section>
        </main>
    );
}
