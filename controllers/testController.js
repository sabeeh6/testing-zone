import { featureModel } from "../model/feature.js";
import { testCaseModel } from "../model/testCase.js";
import { testExecutionModel } from "../model/testExecution.js";
import { userModel } from "../model/user.js";
import logger from "../config/logger.js";

// CREATE TEST CASE
export const createTestCase = async (req, res) => {
    try {
        const {
            featureId,
            title,
            description,
            steps,
            expectedResult,
            status,
            priority,
            severity,
            preconditions,
            actualResult,
            assignedTo,
            createdBy
        } = req.body;

        if (!featureId || !title) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: featureId and title are required."
            });
        }

        // Verify feature exists
        const feature = await featureModel.findById(featureId);
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found"
            });
        }

        const newTest = new testCaseModel({
            featureId,
            title,
            description,
            steps,
            expectedResult,
            status,
            priority,
            severity,
            preconditions,
            actualResult,
            assignedTo: assignedTo === "" ? null : assignedTo,
            createdBy: createdBy === "" ? null : createdBy,
            userId: req.user._id
        });

        await newTest.save();
        return res.status(201).json({
            success: true,
            message: "Test Case created successfully",
            data: newTest
        });

    } catch (error) {
        console.log("Error in createTestCase:", error);
        logger.error("Error in createTestCase:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE TEST CASE
export const updateTestCase = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent CastError when assignedTo is an empty string
        if (updateData.hasOwnProperty('assignedTo') && updateData.assignedTo === "") {
            updateData.assignedTo = null;
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test Case ID is required"
            });
        }

        const existingTest = await testCaseModel.findById(id);
        if (!existingTest) {
            return res.status(404).json({
                success: false,
                message: "Test Case not found"
            });
        }

        const updatedTestCase = await testCaseModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Test Case updated successfully",
            data: updatedTestCase
        });

    } catch (error) {
        console.log("Error in updateTestCase:", error);
        logger.error("Error in updateTestCase:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET TEST CASES BY FEATURE ID
export const getTestCasesByFeatureId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Feature ID is required"
            });
        }

        const testCases = await testCaseModel.find({ featureId: id }).populate('createdBy', 'name').sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Test cases retrieved successfully",
            data: {
                length: testCases.length,
                testCases: testCases
            }
        });

    } catch (error) {
        console.log("Error in getTestCasesByFeatureId:", error);
        logger.error("Error in getTestCasesByFeatureId:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET SINGLE TEST CASE BY ID
export const getTestCaseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test Case ID is required"
            });
        }

        const testCase = await testCaseModel.findById(id)
            .populate({
                path: 'featureId',
                select: 'name projectId',
                populate: {
                    path: 'projectId',
                    select: 'name'
                }
            })
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name');
        if (!testCase) {
            return res.status(404).json({
                success: false,
                message: "Test Case not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Test Case retrieved successfully",
            data: testCase
        });

    } catch (error) {
        console.log("Error in getTestCaseById:", error);
        logger.error("Error in getTestCaseById:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE TEST CASE
export const delTestCase = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test Case ID is required"
            });
        }

        const exist = await testCaseModel.findById(id);
        if (!exist) {
            return res.status(404).json({
                success: false,
                message: "Test case not found"
            });
        }

        await testCaseModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Test case deleted successfully",
        });

    } catch (error) {
        console.log("Error in delTestCase:", error);
        logger.error("Error in delTestCase:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// AGAIN TEST (Create Execution Record)
export const againTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualResult } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test Case ID is required"
            });
        }

        const parentTestCase = await testCaseModel.findById(id);
        if (!parentTestCase) {
            return res.status(404).json({
                success: false,
                message: "Main Test Case not found"
            });
        }

        const newExecution = new testExecutionModel({
            testCaseId: id,
            title: parentTestCase.title,
            status: status || 'notRun',
            actualResult: actualResult || [],
            userId: req.user._id,
            // Cloned properties from parent
            featureId: parentTestCase.featureId,
            projectId: parentTestCase.projectId,
            description: parentTestCase.description,
            steps: parentTestCase.steps,
            expectedResult: parentTestCase.expectedResult,
            priority: parentTestCase.priority,
            severity: parentTestCase.severity,
            preconditions: parentTestCase.preconditions,
            assignedTo: parentTestCase.assignedTo
        });

        await newExecution.save();

        return res.status(201).json({
            success: true,
            message: "Execution recorded successfully",
            data: newExecution
        });

    } catch (error) {
        console.log("Error in againTest:", error);
        logger.error("Error in againTest:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET EXECUTIONS BY TEST CASE ID
export const getExecutionsByTestCaseId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test Case ID is required"
            });
        }

        const executions = await testExecutionModel.find({ testCaseId: id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Executions retrieved successfully",
            data: executions
        });

    } catch (error) {
        console.log("Error in getExecutionsByTestCaseId:", error);
        logger.error("Error in getExecutionsByTestCaseId:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET EXECUTION BY ID
export const getExecutionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Execution ID is required"
            });
        }

        const execution = await testExecutionModel.findById(id)
            .populate('userId', 'name')
            .populate({
                path: 'testCaseId',
                populate: {
                    path: 'featureId',
                    populate: {
                        path: 'projectId'
                    }
                }
            });

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: "Execution record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Execution retrieved successfully",
            data: execution
        });

    } catch (error) {
        console.log("Error in getExecutionById:", error);
        logger.error("Error in getExecutionById:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE EXECUTION
export const updateExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const execution = await testExecutionModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: "Execution record not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Execution updated successfully",
            data: execution
        });

    } catch (error) {
        console.log("Error in updateExecution:", error);
        logger.error("Error in updateExecution:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// DELETE EXECUTION
export const deleteExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const execution = await testExecutionModel.findByIdAndDelete(id);
        if (!execution) return res.status(404).json({ success: false, message: 'Execution record not found' });
        return res.status(200).json({ success: true, message: 'Execution deleted successfully' });
    } catch (error) {
        console.log('Error in deleteExecution:', error);
        logger.error('Error in deleteExecution:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
