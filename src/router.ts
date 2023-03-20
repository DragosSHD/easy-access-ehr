import express from "express";
import usersRoutes from "./users/users.routes";
import authRoutes from "./auth/auth.routes";

const rootRouter = express.Router();

rootRouter.use("/users", usersRoutes);
rootRouter.use("/auth", authRoutes);

export default rootRouter;

