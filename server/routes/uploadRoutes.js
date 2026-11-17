import express from "express";
import { UploadController } from "../controllers/uploadController.js";

const router = express.Router();
router.post("/", UploadController.image);
export default router;
