// Membungkus controller agar penanganan error seragam.
export const handle = (fn, okStatus = 200) => async (req, res) => {
    try {
        res.status(okStatus).json(await fn(req));
    } catch (err) {
        const status = err.code === "PGRST116" ? 404 : err.status || 400;
        res.status(status).json({ error: err.message });
    }
};
