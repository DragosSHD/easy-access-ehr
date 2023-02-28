import express from "express";
import usersRoutes from "./users/users.routes";

const rootRouter = express.Router();

rootRouter.use("/users", usersRoutes);

export default rootRouter;

