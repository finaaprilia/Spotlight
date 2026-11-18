import express from "express";
import dotenv from "dotenv";
import articleRoutes from "./routes/articleRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/api", (_req, res) => res.json({ name: "Spotlight API", status: "ok" }));
app.use("/api/articles", articleRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
