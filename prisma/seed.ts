import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {userRoles} from "../src/util/constants";
import {BodySite} from "@prisma/client";

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
	await createManufacturers();
	await createSubstances();
	await createUsers();


};

const createUsers = async () => {
	await prisma.user.create({
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

	const doctor = await prisma.doctorProfile.create({
		data: {
			user: {
				create: {
					email: "dragos.doctor@gmail.com",
					password: await hashPassword("Password@12"),
					firstName: "Dragos",
					lastName: "Dobre",
					accountAddress: process.env.ADMIN_ACCOUNT as string,
					accountPrivateKey: process.env.ADMIN_PRIVATE_KEY as string,
					birthDate: new Date(),
					role: userRoles.DOCTOR,
				}
			}
		}
	});

	const patient = await prisma.patientProfile.create({
		data: {
			user: {
				create: {
					email: "dragos.patient@gmail.com",
					password: await hashPassword("Password@12"),
					firstName: "Dragos",
					lastName: "Dobre",
					accountAddress: process.env.ADMIN_ACCOUNT as string,
					accountPrivateKey: process.env.ADMIN_PRIVATE_KEY as string,
					birthDate: new Date(),
					role: userRoles.PATIENT,
				}
			},
			doctors: {
				connect: {
					id: doctor.id
				}
			}
		}
	});

	await addMedicalDataToPatient(patient.id);
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

const createSubstances = async () => {

	await prisma.substance.createMany({
		data: [
			{ display: "Penicillin", description: "An antibiotic used to treat bacterial infections, but it can cause allergic reactions in some individuals." },
			{ display: "Aspirin", description: "A common pain reliever and fever reducer that can cause allergic reactions, particularly in individuals with asthma." },
			{ display: "Nonsteroidal anti-inflammatory drugs (NSAIDs)", description: "Medications like ibuprofen and naproxen, which can cause allergic reactions in some individuals." },
			{ display: "Codeine", description: "An opioid analgesic that can cause allergic reactions, including hives and difficulty breathing." },
			{ display: "Morphine", description: "A potent opioid used for pain relief, but it can cause allergic reactions in some individuals." },
			{ display: "Cephalosporins", description: "A group of antibiotics that can cause allergic reactions, particularly in individuals with penicillin allergy." },
			{ display: "Corticosteroids", description: "Medications used to reduce inflammation that can occasionally cause allergic reactions." },
			{ display: "Latex", description: "A natural rubber material used in some medical devices and gloves, which can cause allergic reactions in some people." },
		]
	});

};

const addMedicalDataToPatient = async (profileId: number) => {

	const pfizerManufacturer = await prisma.manufacturer.findFirst({
		where: {
			name: "Pfizer"
		}
	});

	const johnsonManufacturer = await prisma.manufacturer.findFirst({
		where: {
			name: "Johnson"
		}
	});

	const novartisManufacturer = await prisma.manufacturer.findFirst({
		where: {
			name: "Novartis"
		}
	});

	const penicillinSubstance = await prisma.substance.findFirst({
		where: {
			display: "Penicillin"
		}
	});

	const aspirinSubstance = await prisma.substance.findFirst({
		where: {
			display: "Penicillin"
		}
	});

	if (!pfizerManufacturer
		|| !johnsonManufacturer
		|| !novartisManufacturer
		|| !penicillinSubstance
		|| !aspirinSubstance) return;

	await prisma.immunization.createMany({
		data: [
			{
				date: new Date("2023-06-28T10:30:00"),
				expirationDate: new Date("2023-12-28T23:59:59"),
				description: "COVID-19 Vaccine",
				bodySite: BodySite.LEFT_ARM,
				note: "Protects against COVID-19",
				wasNotGiven: false,
				patientProfileId: profileId,
				manufacturerId: pfizerManufacturer.id
			},
			{
				date: new Date("2023-07-01T14:45:00"),
				expirationDate: new Date("2024-01-01T23:59:59"),
				description: "COVID-19 Vaccine (Johnson & Johnson)",
				bodySite: BodySite.RIGHT_ARM,
				note: "Single-dose vaccine for COVID-19",
				wasNotGiven: false,
				doses: 2,
				patientProfileId: profileId,
				manufacturerId: johnsonManufacturer.id
			},
			{
				date: new Date("2023-07-01T14:45:00"),
				expirationDate: new Date("2024-01-01T23:59:59"),
				description: "COVID-19 Vaccine (Novartis)",
				bodySite: BodySite.RIGHT_ARM,
				note: "Single-dose vaccine for COVID-19",
				wasNotGiven: false,
				patientProfileId: profileId,
				manufacturerId: novartisManufacturer.id
			}
		]
	});

	await prisma.condition.createMany({
		data: [
			{
				category: "Chronic",
				bodySite: BodySite.CHEST,
				severity: "LOW",
				text: "Asthma",
				patientProfileId: profileId,
				onsetDateTime: new Date()
			},
			{
				category: "Chronic",
				bodySite: BodySite.LUNGS,
				severity: "MODERATE",
				text: "Chronic Obstructive Pulmonary Disease (COPD)",
				patientProfileId: profileId,
				onsetDateTime: new Date("2020-05-15")
			},
			{
				category: "Infectious",
				bodySite: BodySite.LUNGS,
				severity: "HIGH",
				text: "Pneumonia",
				patientProfileId: profileId,
				onsetDateTime: new Date("2022-02-10")
			},
			{
				category: "Infectious",
				bodySite: BodySite.LUNGS,
				severity: "MODERATE",
				text: "Tuberculosis (TB)",
				patientProfileId: profileId,
				onsetDateTime: new Date("2019-09-01")
			},
			{
				category: "Chronic",
				bodySite: BodySite.CHEST,
				severity: "MODERATE",
				text: "Pulmonary Fibrosis",
				patientProfileId: profileId,
				onsetDateTime: new Date("2018-12-20")
			}
		]
	});

	await prisma.medication.createMany({
		data: [
			// Asthma
			{
				text: "Asthma Inhaler",
				display: "Albuterol Inhaler",
				start: new Date(),
				quantity: 2,
				patientProfileId: profileId,
				substanceId: penicillinSubstance.id
			},
			// Chronic Obstructive Pulmonary Disease (COPD)
			{
				text: "COPD Medication",
				display: "Tiotropium",
				start: new Date(),
				quantity: 2,
				patientProfileId: profileId,
				substanceId: aspirinSubstance.id
			},
			// Pneumonia
			{
				text: "Antibiotics",
				display: "Azithromycin",
				start: new Date(),
				quantity: 2,
				patientProfileId: profileId,
				substanceId: penicillinSubstance.id
			},
			// Tuberculosis (TB)
			{
				text: "TB Medication",
				display: "Isoniazid",
				start: new Date(),
				quantity: 2,
				patientProfileId: profileId,
				substanceId: aspirinSubstance.id
			},
			// Pulmonary Fibrosis
			{
				text: "Pulmonary Fibrosis Medication",
				display: "Pirfenidone",
				start: new Date(),
				quantity: 2,
				patientProfileId: profileId,
				substanceId: penicillinSubstance.id
			}
		]
	});

	await prisma.allergy.createMany({
		data: [
			{
				category: "Medicine",
				criticality: "LOW",
				patientProfileId: profileId,
				substanceId: penicillinSubstance.id,
				type: "Chronic"
			}
		]
	});

	const asthmaCondition = await prisma.condition.findFirst({
		where: {
			text: "Asthma"
		}
	});

	if (!asthmaCondition) return;

	await prisma.medicalTest.createMany({
		data: [
			{
				type: "Spirometry",
				conditionId: asthmaCondition.id,
				result: true,
				patientProfileId: profileId
			}
		]
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