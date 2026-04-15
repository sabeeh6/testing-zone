import mongoose from "mongoose";

const testExecutionSchema = new mongoose.Schema({
    testCaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testCase',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['passed', 'failed', 'blocked', 'notRun'],
        required: true
    },
    actualResult: {
        type: [String],
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Mirrored from TestCase for full independence
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feature'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    description: String,
    steps: {
        type: [String],
        default: []
    },
    expectedResult: {
        type: [String]
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
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster history retrieval
testExecutionSchema.index({ testCaseId: 1, createdAt: -1 });

export const testExecutionModel = mongoose.model('testExecution', testExecutionSchema);
