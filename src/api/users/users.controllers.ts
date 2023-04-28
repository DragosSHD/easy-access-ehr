import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {Request, Response} from "express";
import Web3 from "web3";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
	const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS as unknown as number);
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
	const web3 = new Web3(new Web3.providers
		.HttpProvider("https://mainnet.infura.io/v3/0bd205144f654832b7c816e7aefdc20a"));
	const account = web3.eth.accounts.create();
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			firstName,
			lastName,
			accountAddress: account.address,
			accountPrivateKey: account.privateKey,
			birthDate: new Date(birthDate)
		},
	});

	res.status(201).send({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		birthDate: user.birthDate
	});
};

export const getUser = async (req: Request, res: Response) => {
	const { email } = req.params;
	const userEmail = req.headers["user-email"];
	if (email !== userEmail) {
		return res.status(403).send({ message: "Forbidden" });
	}
	const user = await prisma.user.findUnique({
		where: {
			email
		}
	});
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}
	res.send({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		birthDate: user.birthDate
	});
};