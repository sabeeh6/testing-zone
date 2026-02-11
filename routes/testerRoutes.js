import { Router } from "express";
import { createProject, updateProject } from "../controllers/projectController.js";
import { createFeature, getFeaturesByProjectId, updateFeature } from "../controllers/featureController.js";
import { createTestCase, getTestCasesByFeatureId, updateTestCase } from "../controllers/testController.js";

export const testerRoutes = Router();


//  Project Routes
testerRoutes.post('/create-project' , createProject)
testerRoutes.put('/update-project' , updateProject)
// testerRoutes.get("/get-projects" , )

// Feature Routes
testerRoutes.post('/create-feature' , createFeature)
testerRoutes.put('/update-feature' , updateFeature)
testerRoutes.get("/get-feature-by-projectId/:id" ,getFeaturesByProjectId)


// Test Case Routes
testerRoutes.post('/create-testCase' , createTestCase)
testerRoutes.put('/update-testCase' , updateTestCase)
testerRoutes.get("/get-testCases-by-featureId/:id" , getTestCasesByFeatureId)
