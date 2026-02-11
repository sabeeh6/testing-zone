import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { testerRoutes } from "./testerRoutes.js";

export const routes = Router()

routes.use('/auth' , authRoutes)
routes.use('/tester' , testerRoutes)
