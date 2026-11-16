import express from "express";
import { ArticleController as C } from "../controllers/articleController.js";

const router = express.Router();
router.get("/", C.getAll);
router.get("/:id", C.getById);
router.post("/", C.create);
router.put("/:id", C.update);
router.patch("/:id/view", C.addView);
router.delete("/:id", C.remove);
export default router;
