import { ArticleModel } from "../models/articleModel.js";
import { handle } from "../utils/handler.js";

const must = (cond, msg) => {
    if (!cond) throw Object.assign(new Error(msg), { status: 422 });
};

export const ArticleController = {
    getAll: handle((req) => ArticleModel.getAll(req.query)),
    getById: handle((req) => ArticleModel.getById(req.params.id)),
    create: handle((req) => {
        must(req.body.title?.trim().length >= 5, "Judul minimal 5 karakter");
        must(req.body.content?.trim(), "Isi berita wajib diisi");
        return ArticleModel.create(req.body);
    }, 201),
    update: handle((req) => ArticleModel.update(req.params.id, req.body)),
    addView: handle((req) => ArticleModel.addView(req.params.id)),
    remove: handle((req) => ArticleModel.remove(req.params.id)),
};
