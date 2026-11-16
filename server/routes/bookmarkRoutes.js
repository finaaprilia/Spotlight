import express from "express";
import { BookmarkController as C } from "../controllers/bookmarkController.js";

const router = express.Router();
router.get("/", C.list);
router.post("/", C.add);
router.delete("/", C.clear);
router.delete("/:articleId", C.remove);
export default router;
