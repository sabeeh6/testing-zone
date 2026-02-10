import { Router } from "express";
import { authRoutes } from "./authRoutes.js";

export const routes = Router()

routes.use('/auth' , authRoutes)
