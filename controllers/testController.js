import { featureModel } from "../model/feature.js";
import { testCaseModel } from "../model/testCase.js";
import { userModel } from "../model/user.js";
import logger from "../config/logger.js";

// CREATE TEST CASE
export const createTestCase = async (req, res) => {
    try {
        const { featureId, title, description, steps, expectedResult, status, priority, createdBy } = req.body;

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
            createdBy,
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