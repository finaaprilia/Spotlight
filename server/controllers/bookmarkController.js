import { BookmarkModel } from "../models/bookmarkModel.js";
import { handle } from "../utils/handler.js";

const need = (v, name) => {
    if (!v) throw Object.assign(new Error(`${name} wajib diisi`), { status: 422 });
    return v;
};

export const BookmarkController = {
    list: handle((req) => BookmarkModel.list(need(req.query.device_id, "device_id"))),
    add: handle(
        (req) =>
            BookmarkModel.add(need(req.body.device_id, "device_id"), need(req.body.article_id, "article_id")),
        201
    ),
    remove: handle((req) =>
        BookmarkModel.remove(need(req.query.device_id, "device_id"), req.params.articleId)
    ),
    clear: handle((req) => BookmarkModel.clear(need(req.query.device_id, "device_id"))),
};
