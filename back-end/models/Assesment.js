
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },

    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (value) {
                return value.length === 4 &&
                    value.every(option => option.trim().length > 0);
            },
            message: "Each MCQ must have exactly 4 non-empty options"
        }
    },

    correctAnswer: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"]
    },

    marks: {
        type: Number,
        required: true,
        min: 1
    }
});

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    subject: {
        type: String,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true,
        min: 1
    },

    duration: {
        type: Number,
        required: true,
        min: 1
    },

    questions: {
        type: [questionSchema],
        validate: {
            validator: value => value.length > 0,
            message: "Assessment must contain at least one question"
        }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    startTime: {
        type: Date,
        required: true
    },

    endTime: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["draft", "published", "closed"],
        default: "draft"
    }

}, { timestamps: true });

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
