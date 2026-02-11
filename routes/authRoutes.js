import { Router } from "express";
import { signInUser, signUpUser } from "../controllers/auth/authController.js";
// import { signInUser, signUpUser } from "../controllers/auth/authController.js";


export const authRoutes = Router()

authRoutes.post('/signUp' , signUpUser)
authRoutes.post('/signIn' , signInUser)
