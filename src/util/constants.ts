import {Role} from "@prisma/client";

export const userRoles: {ADMIN: Role, DOCTOR: Role, PATIENT: Role} = {
	ADMIN: "ADMIN",
	DOCTOR: "DOCTOR",
	PATIENT: "PATIENT",
};