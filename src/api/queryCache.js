/**
 * Query Cache System untuk Spotlight
 * Menyimpan hasil query API di memori agar navigasi instan tanpa request berulang.
 * Dilengkapi visual console log untuk inspeksi melalui F12 DevTools.
 */

const CACHE_TTL_DEFAULT = 3 * 60 * 1000; // 3 menit dalam milidetik

class QueryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Membuat cache key konsisten dari URL dan query parameters
     */
    generateKey(url, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .map((k) => `${k}=${params[k]}`)
            .join("&");
        return sortedParams ? `${url}?${sortedParams}` : url;
    }

    /**
     * Mengambil data dari cache jika masih valid
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const isExpired = Date.now() > entry.expiry;
        if (isExpired) {
            console.log(
                `%c[QueryCache] ⌛ EXPIRED: ${key} (waktu cache habis, memperbarui dari server...)`,
                "color: #9ca3af; font-weight: bold;"
            );
            this.cache.delete(key);
            return null;
        }

        const remainingSec = Math.round((entry.expiry - Date.now()) / 1000);
        console.log(
            `%c[QueryCache] ⚡ CACHE HIT: ${key} (diambil instan dari cache memori, sisa TTL: ${remainingSec}s)`,
            "color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;"
        );
        return entry.data;
    }

    /**
     * Menyimpan data ke dalam cache dengan TTL tertentu
     */
    set(key, data, ttl = CACHE_TTL_DEFAULT) {
        if (!data) return;
        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
        console.log(
            `%c[QueryCache] 💾 CACHED: ${key} (disimpan selama ${Math.round(ttl / 1000)} detik)`,
            "color: #f59e0b; font-weight: bold;"
        );
    }

    /**
     * Menghapus cache berdasarkan pola (misal saat create/update/delete artikel)
     */
    invalidate(pattern) {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (!pattern || key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            console.log(
                `%c[QueryCache] 🧹 INVALIDATE: ${count} entri cache '${pattern || "all"}' dibersihkan karena ada perubahan data`,
                "color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px;"
            );
        }
    }

    /**
     * Mengosongkan seluruh isi cache
     */
    clear() {
        this.cache.clear();
        console.log("%c[QueryCache] 🗑️ Seluruh cache dibersihkan", "color: #ef4444;");
    }
}

export const queryCache = new QueryCache();
