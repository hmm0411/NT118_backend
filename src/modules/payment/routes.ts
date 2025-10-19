import { Router } from "express";
const r = Router();

r.post("/momo/create", (_req, res) => {
    res.json({ payUrl: "https://test.momo.vn/fake-pay" });
});

r.post("/momo/callback", (_req, res) => {
    res.status(200).end();
});

export default r;
