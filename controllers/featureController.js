import mongoose from "mongoose";
import logger from "../config/logger.js";
import { featureModel } from "../model/feature.js";
import { testCaseModel } from "../model/testCase.js";

// CREATE FEATURE
export const createFeature = async (req, res) => {
    try {
        const { projectId, name, description, priority, type, status, createdBy } = req.body;

        if (!projectId || !name || !description) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: projectId, name, and description are required."
            });
        }

        const newFeature = new featureModel({
            projectId,
            name,
            description,
            priority,
            type,
            status,
            createdBy,
            userId: req.user._id
        });

        await newFeature.save();

        return res.status(201).json({
            success: true,
            message: "Feature created successfully",
            data: newFeature
        });

    } catch (error) {
        console.log("Error in createFeature:", error);
        logger.error("Error in createFeature:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating feature"
        });
    }
};

// UPDATE FEATURE
export const updateFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Feature ID is required for update."
            });
        }

        const existingFeature = await featureModel.findById(id);
        if (!existingFeature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found"
            });
        }

        const updatedFeature = await featureModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Feature updated successfully",
            data: updatedFeature
        });

    } catch (error) {
        console.log("Error in updateFeature:", error);
        logger.error("Error in updateFeature:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating feature"
        });
    }
};

// GET FEATURES BY PROJECT ID
export const getFeaturesByProjectId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
        }

        const features = await featureModel.find({ projectId: id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Features retrieved successfully",
            data: {
                length: features.length,
                Features: features
            }
        });

    } catch (error) {
        console.log("Error in getFeaturesByProjectId:", error);
        logger.error("Error in getFeaturesByProjectId:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while retrieving features"
        });
    }
};

// DELETE FEATURE
// GET FEATURE BY ID
export const getFeatureById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Feature ID is required"
            });
        }

        const feature = await featureModel.findById(id).populate('projectId', 'name');

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Feature retrieved successfully",
            data: feature
        });

    } catch (error) {
        console.log("Error in getFeatureById:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while retrieving feature"
        });
    }
};

export const deleteFeature = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        if (!id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Feature ID is required for deletion"
            });
        }

        const existingFeature = await featureModel.findById(id).session(session);
        if (!existingFeature) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Feature not found"
            });
        }

        // Delete related test cases first
        await testCaseModel.deleteMany({ featureId: id }).session(session);

        // Delete the feature
        await featureModel.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Feature and associated test cases deleted successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log("Error in deleteFeature:", error);
        logger.error("Error in deleteFeature:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while deleting feature"
        });
    }
};
