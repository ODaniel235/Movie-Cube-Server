import express from "express";
import { sendOTPMail, CheckOtp } from "../Auth/OtpHandler.js";
import {
  checkIfVerified,
  createUser,
  fetchByGenre,
  fetchByKeyword,
  fetchMovies,
  fetchMoviesByTitle,
  LoginUser,
  trending,
  upcoming,
} from "../Controller/controller.js";
import { protectedRouting } from "../Middleware/ProtectedRouting.js";
import cookieParser from "cookie-parser";
const Router = express.Router();
const app = express();
app.use(express.json());
app.use(cookieParser());

Router.post("/signup", createUser);
Router.post("/login", LoginUser);
Router.get("/authorize", protectedRouting, checkIfVerified);
Router.get("/allmovies", fetchMovies);
Router.get("/title", fetchMoviesByTitle);
Router.get("/genre", fetchByGenre);
Router.get("/search", fetchByKeyword);
Router.get("/upcoming", upcoming);
Router.get("/trending", trending);
Router.post("/otp", sendOTPMail);
Router.post("/otpv", CheckOtp);
/* Router.post("/logout", logout); */
export default Router;
