import express from "express";
import { HistoryController as C } from "../controllers/historyController.js";

const router = express.Router();
router.get("/", C.list);
router.get("/trending", C.trending);
router.post("/", C.record);
router.delete("/", C.clear);
router.delete("/:articleId", C.remove);
export default router;
