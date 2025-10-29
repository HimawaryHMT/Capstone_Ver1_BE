import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./src/routers/authRouter.js";
import Them_Ban_Ghi from "./src/routers/CanNangVaBMI/Them_Ban_Ghi.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/CanNangVaBMI" , Them_Ban_Ghi)

const PORT = process.env.PORT || 5060;

app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}`);
});
