import { useState } from "react";
import { ArrowRight } from "lucide-react";

const SLIDES = [
    { title: "Berita pilihan, bukan banjir informasi", text: "Spotlight menyorot headline dan topik yang sedang ramai dibaca, sehingga Anda cepat tahu apa yang penting hari ini.", shape: "a" },
    { title: "Cari, saring, dan urutkan", text: "Temukan berita lewat pencarian, kategori, dan pengurutan berdasarkan terbaru, terpopuler, atau judul.", shape: "b" },
    { title: "Simpan untuk dibaca nanti", text: "Bookmark berita yang menarik. Koleksi Anda tersimpan dan tetap bisa dibuka meski koneksi sedang lemah.", shape: "c" },
];

export default function Onboarding({ onDone }) {
    const [i, setI] = useState(0);
    const last = i === SLIDES.length - 1;
    const s = SLIDES[i];

    return (
        <div className="onb">
            <button className="onb-skip" onClick={onDone}>Lewati</button>
            <div className={`onb-art shape-${s.shape}`} aria-hidden="true"><span /><span /><span /></div>
            <div className="onb-body">
                <h1>{s.title}</h1>
                <p>{s.text}</p>
            </div>
            <div className="onb-foot">
                <div className="dots">
                    {SLIDES.map((_, n) => <i key={n} className={n === i ? "on" : ""} />)}
                </div>
                <button className="btn primary" onClick={() => (last ? onDone() : setI(i + 1))}>
                    {last ? "Mulai membaca" : "Lanjut"} <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
