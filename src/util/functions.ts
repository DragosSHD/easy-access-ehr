import fs from "fs";

export const getContractABI = () => {
	const rawData = fs.readFileSync("./smartContracts/EHRAuthorization.json", "utf8");
	const { abi } = JSON.parse(rawData);
	return abi;
};