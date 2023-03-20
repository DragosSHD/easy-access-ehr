import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {Request, Response} from "express";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).send({ message: "Missing required fields" });
	}
	const user = await prisma.user.findUnique({
		where: {
			email
		}
	});
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}
	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return res.status(401).send({ message: "Invalid credentials" });
	}
	res.send({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		birthDate: user.birthDate
	});
};

export const logout = async (req: Request, res: Response) => {
	res.status(204).send();
};