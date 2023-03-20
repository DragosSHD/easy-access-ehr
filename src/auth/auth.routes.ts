import express from "express";
import { login, logout } from "./auth.controllers";
const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);

export default router;