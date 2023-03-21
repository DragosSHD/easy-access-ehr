import express, {Request, Response} from "express";


const router = express.Router();

router.get("/:id", (req: Request, res: Response) => res.send("Not implemented."));

export default router;