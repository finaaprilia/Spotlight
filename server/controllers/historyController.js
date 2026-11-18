import { HistoryModel } from "../models/historyModel.js";
import { handle } from "../utils/handler.js";

const need = (v, name) => {
    if (!v) throw Object.assign(new Error(`${name} wajib diisi`), { status: 422 });
    return v;
};

export const HistoryController = {
    list: handle((req) => HistoryModel.list(need(req.query.device_id, "device_id"))),
    record: handle(
        (req) =>
            HistoryModel.record(need(req.body.device_id, "device_id"), need(req.body.article_id, "article_id")),
        201
    ),
    remove: handle((req) =>
        HistoryModel.remove(need(req.query.device_id, "device_id"), req.params.articleId)
    ),
    clear: handle((req) => HistoryModel.clear(need(req.query.device_id, "device_id"))),
};
