import { supabase } from "../config/supabaseClient.js";

export const HistoryModel = {
    // Daftar artikel yang pernah dibaca perangkat ini, terbaru dibaca di atas
    async list(deviceId, limit = 100) {
        const { data, error } = await supabase
            .from("reading_history")
            .select("read_at, articles(*)")
            .eq("device_id", deviceId)
            .order("read_at", { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data.filter((h) => h.articles).map((h) => ({ ...h.articles, read_at: h.read_at }));
    },

    // Catat bacaan. Jika sudah pernah, hanya perbarui waktunya.
    async record(deviceId, articleId) {
        const { error } = await supabase
            .from("reading_history")
            .upsert(
                [{ device_id: deviceId, article_id: articleId, read_at: new Date().toISOString() }],
                { onConflict: "device_id,article_id" }
            );
        if (error) throw error;
        return { message: "Riwayat dicatat" };
    },

    async remove(deviceId, articleId) {
        const { error } = await supabase
            .from("reading_history")
            .delete()
            .eq("device_id", deviceId)
            .eq("article_id", articleId);
        if (error) throw error;
        return { message: "Riwayat dihapus" };
    },

    async clear(deviceId) {
        const { error } = await supabase.from("reading_history").delete().eq("device_id", deviceId);
        if (error) throw error;
        return { message: "Semua riwayat dihapus" };
    },
};
