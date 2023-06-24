import express from "express";
import usersRoutes from "./api/user/users.routes";
import authRoutes from "./middleware/auth/auth.routes";
import allergyRoutes from "./api/allergy/allergy.routes";

const rootRouter = express.Router();

rootRouter.use("/user", usersRoutes);
rootRouter.use("/auth", authRoutes);
rootRouter.use("/allergy", allergyRoutes);

export default rootRouter;

