export const CATEGORIES = ["Semua", "Ekonomi", "Teknologi", "Olahraga", "Sains", "Hiburan", "Kesehatan", "Umum"];

export const fmtDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export const timeAgo = (d) => {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} menit lalu`;
    if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
    if (s < 604800) return `${Math.floor(s / 86400)} hari lalu`;
    return fmtDate(d);
};

export const readTime = (text = "") => Math.max(1, Math.round(text.split(/\s+/).length / 200));

export const compact = (n) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n || 0);
