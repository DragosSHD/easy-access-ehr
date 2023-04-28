import express from "express";
import {
	auth,
	getEHRAuthorizationToken,
	grantEHRAuthorization,
	login,
	logout
} from "./auth.controllers";
const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.post("/get-authorization", auth, getEHRAuthorizationToken);
router.post("/create-authorization", auth, grantEHRAuthorization);

export default router;