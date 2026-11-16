import express from "express";
import dotenv from "dotenv";
import articleRoutes from "./routes/articleRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/api", (_req, res) => res.json({ name: "Spotlight API", status: "ok" }));
app.use("/api/articles", articleRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

export default app;
