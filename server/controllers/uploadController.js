import { supabase } from "../config/supabaseClient.js";
import { handle } from "../utils/handler.js";

const BUCKET = "article-images";
const MAX_BYTES = 3 * 1024 * 1024;
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const fail = (msg, status = 422) => {
    throw Object.assign(new Error(msg), { status });
};

export const UploadController = {
    image: handle(async (req) => {
        const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s.exec(req.body?.data || "");
        if (!m) fail("Format gambar harus JPG, PNG, atau WebP");

        const buffer = Buffer.from(m[2], "base64");
        if (buffer.length > MAX_BYTES) fail("Ukuran gambar maksimal 3 MB");

        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[m[1]]}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: m[1] });
        if (error) fail(`Gagal mengunggah: ${error.message}`, 400);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return { url: data.publicUrl };
    }, 201),
};
