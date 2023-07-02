import express from "express";
import usersRoutes from "./api/user/users.routes";
import authRoutes from "./middleware/auth/auth.routes";
import allergyRoutes from "./api/allergy/allergy.routes";
import {auth, checkAuthorization} from "./middleware/auth/auth.controllers";

const rootRouter = express.Router();

rootRouter.use("/user", usersRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/allergy", auth, checkAuthorization,allergyRoutes);

export default rootRouter;

