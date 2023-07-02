import { promises as fs } from "fs";
import solc from "solc";
import Web3 from "web3";
import dotenv from "dotenv";

async function main() {
	// Load the contract source code
	const sourceCode = await fs.readFile("./smartContracts/EHRAuthorization.sol", "utf8");
	// Compile the source code and retrieve the ABI and Bytecode
	const { abi, bytecode } = compile(sourceCode, "EHRAuthorization");
	// Store the ABI and Bytecode into a JSON file
	const artifact = JSON.stringify({ abi, bytecode }, null, 2);
	await fs.writeFile("./smartContracts/EHRAuthorization.json", artifact);
}

function compile(sourceCode, contractName) {
	// Create the Solidity Compiler Standard Input and Output JSON
	const input = {
		language: "Solidity",
		sources: { main: { content: sourceCode } },
		settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
	};
	// Parse the compiler output to retrieve the ABI and Bytecode
	const output = solc.compile(JSON.stringify(input));
	const artifact = JSON.parse(output).contracts.main[contractName];
	return {
		abi: artifact.abi,
		bytecode: artifact.evm.bytecode.object,
	};
}

async function deploy() {
	const compiledJson = await fs.readFile("./smartContracts/EHRAuthorization.json");
	const { abi, bytecode } = JSON.parse(compiledJson);
	const web3 = new Web3(
		process.env.HTTP_PROVIDER
	);
	const signer = web3.eth.accounts.privateKeyToAccount(
		process.env.ADMIN_PRIVATE_KEY,
	);
	web3.eth.accounts.wallet.add(signer);
	// Using the signing account to deploy the contract
	const contract = new web3.eth.Contract(abi);
	contract.options.data = bytecode;
	const deployTx = contract.deploy();
	console.log("Gas price: " + await deployTx.estimateGas());
	const deployedContract = await deployTx
		.send({
			from: signer.address,
			gas: await deployTx.estimateGas(),
		})
		.once("transactionHash", (txhash) => {
			console.log(`Mining deployment transaction ...`);
			console.log(`https://${process.env.ETHEREUM_NETWORK}.etherscan.io/tx/${txhash}`);
		});
	// The contract is now deployed on chain!
	console.log(`Contract deployed at ${deployedContract.options.address}`);
}

dotenv.config();
main().then(() => {
	console.log("Smart contract was compiled!");
	console.log("Deploying smart contract...");
	deploy().then(() => {
		console.log("Smart contract was deployed!");
	});
});