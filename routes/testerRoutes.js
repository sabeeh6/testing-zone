import { Router } from "express";
import { createProject, deleteProject, getAllProjects, updateProject } from "../controllers/projectController.js";
import { createFeature, deleteFeature, getFeatureById, getFeaturesByProjectId, updateFeature } from "../controllers/featureController.js";
import { createTestCase, delTestCase, getTestCaseById, getTestCasesByFeatureId, updateTestCase } from "../controllers/testController.js";

export const testerRoutes = Router();


//  Project Routes
testerRoutes.post('/create-project', createProject)
testerRoutes.put('/update-project/:id', updateProject)
testerRoutes.get("/get-all-projects", getAllProjects)
testerRoutes.delete("/delete-project/:id", deleteProject)

// Feature Routes
testerRoutes.post('/create-feature', createFeature)
testerRoutes.put('/update-feature/:id', updateFeature)
testerRoutes.get("/get-feature-by-projectId/:id", getFeaturesByProjectId)
testerRoutes.get("/get-feature/:id", getFeatureById)
testerRoutes.delete("/delete-feature/:id", deleteFeature)


// Test Case Routes
testerRoutes.post('/create-testCase', createTestCase)
testerRoutes.put('/update-testCase/:id', updateTestCase)
testerRoutes.get("/get-testCases-by-featureId/:id", getTestCasesByFeatureId)
testerRoutes.get("/get-testcase/:id", getTestCaseById)
testerRoutes.delete("/delete-testcase/:id", delTestCase)


// evidence routes

