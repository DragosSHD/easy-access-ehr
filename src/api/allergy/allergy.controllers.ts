import  {PrismaClient} from "@prisma/client";
import {Request, Response} from "express";

const prisma = new PrismaClient();

export const getPatientAllergies = async (req: Request, res: Response) => {
	const { patientId } = req.params;

	const queryResponse = await prisma.user.findUnique({
		where: {
			id: parseInt(patientId)
		},
		include: {
			patientProfile: {
				include: {
					allergies: true
				}
			}
		}
	});

	if (!queryResponse || !queryResponse.patientProfile) {
		return res.status(404).send("Patient not found");
	}

	res.send(queryResponse.patientProfile.allergies);
};