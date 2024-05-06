import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Schema/UserSchema.js";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());

export const createUser = async (req, res) => {
  try {
    const user = await req.body;
    if (!user.email || !user.password) {
      res.status(401).json({ message: "Please fill all fields" });
    } else {
      const hashed = await bcrypt.hash(user.password, 12);
      user.password = hashed;
      const newUser = await userModel.create(user);
      res.status(200).json({ status: "success", data: newUser });
    }
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res
        .status(409)
        .json({ message: "Email address is already in use" });
    }
    res.status(500).json({ message: error });
  }
};
export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(401).json({ message: "Please fill all fields" });
    } else {
      const validUser = await userModel.findOne({ email }).exec();
      if (!validUser) {
        res.status(401).json({ message: "User not found" });
      } else {
        const validateUser = await bcrypt.compare(password, validUser.password);
        if (!validateUser) {
          res.status(401).json({ message: "Invalid Credentials" });
        } else {
          const refreshToken = jwt.sign(
            {
              data1: validUser.password,
              data2: validUser._id,
            },
            process.env.JWTSECRET,
            { expiresIn: 24 * 60 * 60 * 1000 }
          );
          const accessToken = jwt.sign(
            {
              data1: validUser.password,
              data2: validUser._id,
            },
            process.env.JWTSECRET,
            { expiresIn: 30 * 1000 }
          );
          res.cookie("RefreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: "true",
            maxAge: 24 * 60 * 60 * 1000,
          });
          res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: "true",
            maxAge: 30 * 1000,
          });
          const userVerified = validUser.verified;
          if (!userVerified) {
            res.status(400).json({ message: "Please verify your account" });
          } else {
            res.status(200).json({ message: "Logged in successfully" });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export const checkIfVerified = async (req, res) => {
  try {
    res.status(200).json({ message: "User is authorized" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export const fetchMovies = async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.APIKEY}`
    );
    if (!response.ok) {
      throw new Error("Could not fetch data");
    }
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    console.error();
  }
};
export const fetchMoviesByTitle = async (req, res) => {
  try {
    const query = req.url.split("?");
    const Id = Number(query[1]);
    console.log(Id);
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${Id}?api_key=${process.env.APIKEY}&append_to_response=credits,videos`
    );
    if (!response.ok) {
      throw new Error("Could not fetch data");
    }
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export const fetchByGenre = async (req, res) => {
  try {
    const query = req.url.split("?");
    const selectedGenre = query[1];
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.APIKEY}&with_genres=${selectedGenre}`
    );
    if (!response.ok) {
      throw new Error("Could not fetch data");
    }
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};
export const fetchByKeyword = async (req, res) => {
  try {
    const query = req.url.split("?");
    const input = query[1];
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.APIKEY
      }&query=${encodeURIComponent(input)}`
    );
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};
export const upcoming = async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.APIKEY}`
    );
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};
export const trending = async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`
    );
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};
