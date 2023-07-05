import express, {Request, Response} from "express";
import usersRoutes from "./api/user/users.routes";
import authRoutes from "./middleware/auth/auth.routes";
import {auth, checkAuthorization} from "./middleware/auth/auth.controllers";

const rootRouter = express.Router();

rootRouter.use("/user", usersRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/allergies/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));
rootRouter.use("/conditions/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));
rootRouter.get("/immunizations/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));
rootRouter.get("/medications/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));
rootRouter.get("/allergies/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));
rootRouter.get("/medicalTests/:patinetId", auth, checkAuthorization,
	(req: Request, res: Response) => res.status(200).json({ hasAccess: true }));

export default rootRouter;

