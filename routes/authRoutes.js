import { Router } from "express";
import { signInUser, signUpUser } from "../controllers/authController.js";


export const authRoutes = Router()

authRoutes.post('/signUp' , signUpUser)
authRoutes.post('/signIn' , signInUser)
