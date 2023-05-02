import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function hashPassword(password: string) {
	const saltRounds = parseInt(process.env.SALT_ROUNDS as string);
	const salt = await bcrypt.genSalt(saltRounds);
	return await bcrypt.hash(password, salt);
}

const main = async () => {
	await devSeed();
};

const devSeed = async () => {
	await prisma.user.create({
		data: {
			email: "dragos@gmail.com",
			password: await hashPassword("Password@12"),
			firstName: "Dragos",
			lastName: "Dobre",
			accountAddress: "",
			accountPrivateKey: "",
			birthDate: new Date(),
			role: "ADMIN"
		},
	});
};

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});