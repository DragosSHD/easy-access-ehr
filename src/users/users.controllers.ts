import {PrismaClient} from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {Request, Response} from "express";

dotenv.config();

const prisma = new PrismaClient();
const saltRounds = 7;

async function hashPassword(password: string) {
	const salt = await bcrypt.genSalt(saltRounds);
	return await bcrypt.hash(password, salt);
}

export const create = async (req: Request, res: Response) => {
	const { email, password, birthDate, firstName, lastName } = req.body;
	if (!email || !password || !birthDate || !firstName || !lastName) {
		return res.status(400).send({ message: "Missing required fields" });
	}
	const existingUser = await prisma.user.findUnique({
		where: {
			email
		}
	});
	if(existingUser) {
		return res.status(409).send({ message: "User already exists" });
	}
	const hashedPassword = await hashPassword(password);
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			firstName,
			lastName,
			birthDate: new Date(birthDate)
		},
	});

	res.send(user);
};