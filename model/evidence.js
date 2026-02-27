import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
    testCaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testCase',
        required: true
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
