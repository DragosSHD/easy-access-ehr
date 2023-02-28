import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./router";

dotenv.config();
const app = express();
//
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1", router);

app.use((req, res) => {
	res.status(404).send(
		"<h1>404 - Not Found</h1>");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});