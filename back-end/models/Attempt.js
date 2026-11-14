import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    selectedAnswer: {
        type: String,
        enum: ["A", "B", "C", "D"],
        required: true
    }
});

const attemptSchema = new mongoose.Schema({

    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    answers: {
        type: [answerSchema],
        required: true
    },

    score: {
        type: Number,
        default: 0
    },

    totalMarks: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["submitted"],
        default: "submitted"
    },

    submittedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

// One attempt per student per assessment
attemptSchema.index(
    { assessment: 1, student: 1 },
    { unique: true }
);

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;