import { Router } from "express";
import { createProject, deleteProject, getAllProjects, updateProject } from "../controllers/projectController.js";
import { createFeature, deleteFeature, getFeaturesByProjectId, updateFeature } from "../controllers/featureController.js";
import { createTestCase, delTestCase, getTestCasesByFeatureId, updateTestCase } from "../controllers/testController.js";

export const testerRoutes = Router();


//  Project Routes
testerRoutes.post('/create-project' , createProject)
testerRoutes.put('/update-project' , updateProject)
testerRoutes.get("/get-all-projects" , getAllProjects)
testerRoutes.delete("/delete-project" , deleteProject)

// Feature Routes
testerRoutes.post('/create-feature' , createFeature)
testerRoutes.put('/update-feature' , updateFeature)
testerRoutes.get("/get-feature-by-projectId/:id" ,getFeaturesByProjectId)
testerRoutes.delete("/delete-feature/:id" ,deleteFeature)


// Test Case Routes
testerRoutes.post('/create-testCase' , createTestCase)
testerRoutes.put('/update-testCase' , updateTestCase)
testerRoutes.get("/get-testCases-by-featureId/:id" , getTestCasesByFeatureId)
testerRoutes.delete("/delete-testcase/:id" , delTestCase)
