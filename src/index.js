import express from "express";
import ip from "ip";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import database from "./config/mysql.config.js";
import logger from "./util/logger.js";
import bodyParser from "body-parser";
const jsonParser = bodyParser.json();

dotenv.config();
const PORT = process.env.SERVER_PORT || 3002;
const app = express();
const secret = process.env.SECRET;
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/",(res) => { res.send( {message: 'UP'}) })

app.listen(PORT, () =>
  logger.info(`Server running on : ${ip.address()}:${PORT}`)
);