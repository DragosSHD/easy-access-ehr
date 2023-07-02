import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

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
	const authorizationToken = jwt.sign(
		{ email: user.email },
		process.env.JWT_SECRET as string,
		{ expiresIn: "1h" }
	);
	res.json({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		accessToken: authorizationToken,
		birthDate: user.birthDate,
		role: user.role
	});
};

export const logout = async (req: Request, res: Response) => {
	res.status(204).send();
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: "Missing authorization header" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
		const user = await prisma.user.findUnique({
			where: {
				email: (<{email: string}>decoded).email
			}
		});
		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}
		req.headers["user-email"] = user.email;
		req.headers["user-id"] = user.id.toString();
		next();
	} catch (err) {
		return res.status(401).send({ message: "Invalid auth token" });
	}
};

export const checkAuthorization = async (req: Request, res: Response, next: NextFunction) => {
	const userId = req.headers["user-id"];
	const parsedUserID = parseInt(userId as string);
	console.log(parsedUserID);

	next();
};

export const getEHRAuthorizationToken = async (req: Request, res: Response) => {
	const { healthRecords, expirationDate, types } = req.body;
	const userEmail = req.headers["user-email"];

	const user = await prisma.user.findUnique({
		where: {
			email: userEmail as string
		}
	});

	const authorizationToken = jwt.sign(
		{ healthRecords, expirationDate, types, userId: user?.id },
		process.env.JWT_SECRET as string,
		{ expiresIn: "1h" }
	);

	res.status(200).json({ data: authorizationToken });
};

export const grantEHRAuthorization = async (req: Request, res: Response) => {
	const { authorizationToken } = req.body;
	try {
		const decoded = jwt.verify(authorizationToken, process.env.JWT_SECRET as string);
		console.log(decoded);
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			return res.status(401).send({ message: "Token expired" });
		}
		return res.status(401).send({ message: "Invalid token" });
	}

	res.status(200).json({ data: "Access Granted" });
};