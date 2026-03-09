import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feature',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    steps: {
        type: [String],
        default: []
    },
    expectedResult: {
        type: [String]
    },
    status: {
        type: String,
        enum: ['notRun', 'passed', 'failed', 'blocked'],
        default: 'notRun'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    preconditions: {
        type: [String]
    },
    actualResult: {
        type: [String],
        default: []
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Adding index on featureId for performance
testCaseSchema.index({ featureId: 1 });

export const testCaseModel = mongoose.model('testCase', testCaseSchema);
