import { supabase } from "../config/supabaseClient.js";

const FIELDS = ["title", "summary", "content", "category", "image_url", "author", "is_featured"];
const pick = (src) =>
    Object.fromEntries(FIELDS.filter((k) => src[k] !== undefined).map((k) => [k, src[k]]));

const SORTS = {
    terbaru: ["created_at", false],
    terpopuler: ["views", false],
    judul: ["title", true],
};

export const ArticleModel = {
    async getAll({ search, category, sort = "terbaru", featured, limit } = {}) {
        let q = supabase.from("articles").select("*");

        if (search) {
            const s = search.replace(/[,()%*]/g, " ").trim();
            if (s) q = q.or(`title.ilike.%${s}%,summary.ilike.%${s}%`);
        }
        if (category && category !== "Semua") q = q.eq("category", category);
        if (featured === "true") q = q.eq("is_featured", true);

        const [col, asc] = SORTS[sort] || SORTS.terbaru;
        q = q.order(col, { ascending: asc });
        if (limit) q = q.limit(Number(limit));

        const { data, error } = await q;

        // TAMBAHKAN INI UNTUK MENGECEK APAKAH ADA ERROR ATAU DATA KOSONG
        console.log("DATA DARI SUPABASE:", data);
        console.log("ERROR DARI SUPABASE:", error);

        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
    },

    async create(payload) {
        const { data, error } = await supabase
            .from("articles")
            .insert([pick(payload)])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, payload) {
        const { data, error } = await supabase
            .from("articles")
            .update({ ...pick(payload), updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async addView(id) {
        const current = await this.getById(id);
        const { data, error } = await supabase
            .from("articles")
            .update({ views: (current.views || 0) + 1 })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async remove(id) {
        const { error } = await supabase.from("articles").delete().eq("id", id);
        if (error) throw error;
        return { message: "Berita dihapus" };
    },
};
