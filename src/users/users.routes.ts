import express from "express";
import { create } from "./users.controllers";

const router = express.Router();

router.post("/", create);

export default router;