import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { testerRoutes } from "./testerRoutes.js";
import { evidenceRouter } from "./evidenceRoutes.js";

export const routes = Router()

routes.use('/auth' , authRoutes)
routes.use('/tester' , testerRoutes)
routes.use('/evidence' , evidenceRouter)
