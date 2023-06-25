import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {userRoles} from "../constants";

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
	await createUsers();
	await createManufacturers();


};

const createUsers = async () => {
	const { id: adminId } = await prisma.user.create({
		data: {
			email: "dragos@gmail.com",
			password: await hashPassword("Password@12"),
			firstName: "Dragos",
			lastName: "Dobre",
			accountAddress: process.env.ADMIN_ACCOUNT as string,
			accountPrivateKey: process.env.ADMIN_PRIVATE_KEY as string,
			birthDate: new Date(),
			role: "ADMIN"
		},
	});

	const { id: doctorId } = await prisma.user.create({
		data: {
			email: "dragos.doctor@gmail.com",
			password: await hashPassword("Password@12"),
			firstName: "Dragos",
			lastName: "Dobre",
			accountAddress: process.env.ADMIN_ACCOUNT as string,
			accountPrivateKey: process.env.ADMIN_PRIVATE_KEY as string,
			birthDate: new Date(),
			role: userRoles.DOCTOR
		},
	});

	const { id: patientId } = await prisma.user.create({
		data: {
			email: "dragos.patient@gmail.com",
			password: await hashPassword("Password@12"),
			firstName: "Dragos",
			lastName: "Dobre",
			accountAddress: process.env.ADMIN_ACCOUNT as string,
			accountPrivateKey: process.env.ADMIN_PRIVATE_KEY as string,
			birthDate: new Date(),
			role: userRoles.PATIENT,
		},
	});
};

const createManufacturers = async () => {

	await prisma.manufacturer.createMany({
		data: [
			{ name: "Johnson&Johnson" },
			{ name: "Pfizer" },
			{ name: "Novartis" },
			{ name: "GSK" },
			{ name: "Roche" },
		]
	});

};

const addMedicalDataToUser = async (profileId: number) => {

	// await prisma.immunization.createMany({
	// 	data: [
	// 		{
	// 			date: new Date(),
	// 			expirationDate: new Date(),
	// 			description: "This should prevent Covid19 virus from inflicting significant damage.",
	// 			patientProfileId: profileId,
	// 		}
	// 	]
	// });

};

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});