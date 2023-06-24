import  {PrismaClient} from "@prisma/client";
import {Request, Response} from "express";


export const getPatientAllergies = async (req: Request, res: Response) => {
	console.log(req);
};