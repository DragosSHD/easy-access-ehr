import express from "express";
import {create, getUser} from "./users.controllers";
import {auth} from "../auth/auth.controllers";

const router = express.Router();

router.post("/", create);
router.get("/:email", auth, getUser);

export default router;