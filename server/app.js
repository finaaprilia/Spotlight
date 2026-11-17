import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import articleRoutes from "./routes/articleRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
// Foto dikompres di browser (sekitar 300 KB), batas 4 MB masih di bawah limit Vercel (4,5 MB)
app.use(express.json({ limit: "4mb" }));

app.get("/api", (_req, res) => res.json({ name: "Spotlight API", status: "ok" }));
app.use("/api/articles", articleRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
