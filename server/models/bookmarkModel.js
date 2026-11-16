import { supabase } from "../config/supabaseClient.js";

export const BookmarkModel = {
    // Mengembalikan daftar artikel yang di-bookmark perangkat ini
    async list(deviceId) {
        const { data, error } = await supabase
            .from("bookmarks")
            .select("created_at, articles(*)")
            .eq("device_id", deviceId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data.map((b) => b.articles).filter(Boolean);
    },

    async add(deviceId, articleId) {
        const { error } = await supabase
            .from("bookmarks")
            .upsert([{ device_id: deviceId, article_id: articleId }], {
                onConflict: "device_id,article_id",
            });
        if (error) throw error;
        return { message: "Bookmark disimpan" };
    },

    async remove(deviceId, articleId) {
        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("device_id", deviceId)
            .eq("article_id", articleId);
        if (error) throw error;
        return { message: "Bookmark dihapus" };
    },

    async clear(deviceId) {
        const { error } = await supabase.from("bookmarks").delete().eq("device_id", deviceId);
        if (error) throw error;
        return { message: "Semua bookmark dihapus" };
    },
};
