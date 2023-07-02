import express from "express";
import {getPatientAllergies} from "./allergy.controllers";

const router = express.Router();

router.get("/:patientId", getPatientAllergies);

export default router;