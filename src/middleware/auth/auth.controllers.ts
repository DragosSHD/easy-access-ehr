import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Web3 from "web3";
import {getContractABI} from "../../util/functions";

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
		id: user.id,
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
	const urlComponents = req.originalUrl.split("/");
	const patientId = urlComponents.pop();
	const category = urlComponents.pop();

	if (!patientId || !category) return res.status(500).json({ message: "Category or patientId not provided." });

	const user = await prisma.user.findUnique({
		where: {id: parsedUserID}
	});
	const patient = await prisma.user.findUnique({
		where: {id: parseInt(patientId)}
	});

	if (!user) return res.status(500).json({ message: "User not found at authorization." });
	if (!patient) return res.status(404).json({ message: "Patient not found at authorization." });

	const toPrint = {
		doctorAddress: user.accountAddress,
		patientAddress: patient.accountAddress,
		category: category
	};

	const hasAccess = await checkAccess(user.accountAddress, patient.accountAddress, category);
	if (!hasAccess) return res.status(401).json({ message: `Not Authorized to see ${category.toUpperCase()}` });

	next();
};

const checkAccess = async (doctorAddress: string, patientAddress: string, category: string)=> {
	const web3 = new Web3(
		process.env.HTTP_PROVIDER as string
	);

	const contractAbi = getContractABI();

	const contract = new web3.eth.Contract(contractAbi, process.env.CONTRACT_ADDRESS);
	const signer = web3.eth.accounts.privateKeyToAccount(
		process.env.ADMIN_PRIVATE_KEY as string
	);
	web3.eth.accounts.wallet.add(signer);
	return await contract.methods.checkAccess(doctorAddress, patientAddress, category).call();
};

const addAccess = async (doctorAddress: string, patientAddress: string, expiration: number, categories: [string]) => {
	const web3 = new Web3(
		process.env.HTTP_PROVIDER as string
	);

	const contractAbi = getContractABI();

	const contract = new web3.eth.Contract(contractAbi, process.env.CONTRACT_ADDRESS);
	const signer = web3.eth.accounts.privateKeyToAccount(
		process.env.ADMIN_PRIVATE_KEY as string
	);
	web3.eth.accounts.wallet.add(signer);
	try {
		await contract.methods
			.addAccess(doctorAddress, patientAddress, expiration, categories)
			.send({ from: process.env.ADMIN_ACCOUNT, gas: 100000 });
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
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
		{ expiresIn: "5m" }
	);

	res.status(200).json({ data: authorizationToken });
};

export const grantEHRAuthorization = async (req: Request, res: Response) => {
	const { authorizationToken } = req.body;
	const userId = req.headers["user-id"];
	const parsedUserID = parseInt(userId as string);
	try {
		const { healthRecords, userId: patientId, expirationDate } = jwt
			.verify(authorizationToken, process.env.JWT_SECRET as string) as {
			healthRecords: [string],
			userId: number,
			expirationDate: number
		};
		const user = await prisma.user.findUnique({
			where: {id: parsedUserID}
		});
		const patient = await prisma.user.findUnique({
			where: {id: patientId}
		});
		if (!user) return res.status(500).send("User not found at authorization.");
		if (!patient) return res.status(404).send("Patient not found at authorization.");

		const callResult = await addAccess(user.accountAddress, patient.accountAddress, expirationDate, healthRecords);
		if (!callResult) {
			return res.status(500).send({ message: "Transaction failed." });
		}


	} catch (err) {
		console.log(err);
		if (err instanceof jwt.TokenExpiredError) {
			return res.status(401).send({ message: "Token expired" });
		}
		return res.status(401).send({ message: "Invalid token" });
	}

	res.status(200).json({ data: "Access Granted" });
};