import express from "express";

const router = express.Router();

router.post("/", (req, res) => res.send("Not implemented!"));
router.get("/", (req, res) => res.send("Not implemented!"));
router.get("/:id", (req, res) => res.send("Not implemented!"));
router.put("/:id", (req, res) => res.send("Not implemented!"));
router.delete("/:id", (req, res) => res.send("Not implemented!"));

export default router;