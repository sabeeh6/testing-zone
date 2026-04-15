import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    testCaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testCase',
        required: false // Optional if testExecutionId is present
    },
    testExecutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testExecution',
        required: false // Optional if testCaseId is present
    },
    fileUrl: [{
        type: String,
        required: true
    }],
    filePublicId: [{
        type: String,
        required: true
    }],
    fileType: [{
        type: String,
        required: true
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

export const evidenceModel = mongoose.model('evidence', evidenceSchema)
