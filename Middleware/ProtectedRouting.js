import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import userModel from "../Schema/UserSchema.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
export const protectedRouting = async (req, res, next) => {
  try {
    const { AccessToken, RefreshToken } = req.cookies;
    if (!RefreshToken) {
      res.status(401).json({ message: "No Refresh Token found" });
      return;
    } else {
      if (!AccessToken) {
        jwt.verify(RefreshToken, process.env.JWTSECRET, (err, decoded) => {
          if (err) {
            res.status(401).json({ message: "Authorization failed" });
            return;
          }
          const newAccessToken = jwt.sign(
            {
              data1: decoded.data1,
              data2: decoded.data2,
              data3: decoded.data3,
            },
            process.env.JWTSECRET,
            { expiresIn: 30 * 1000 }
          );
          res.cookie("AccessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: "true",
            maxAge: 30 * 1000,
          });
          next();
        });
        next();
      } else {
        mm;
        jwt.verify(AccessToken, process.env.JWTSECRET, async (err, decoded) => {
          if (err) {
            res.status(401).json({ message: "Authorization failed" });
          }
          next();
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};