import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Router from "./Routes/router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const corsOption = {
  origin: ["http://localhost:8090", "https://movie-cube.vercel.app"],
  methods: "GET,POST",
  credentials: true,
};
dotenv.config();
const app = express();
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.use(Router);
const PORT = 5000;
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to Database");
    app.listen(PORT, () => {
      console.log(`Listening to port ${PORT} `);
    });
  })
  .catch((error) => {
    console.log(error);
  });
