import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    submittedAt: { type: Date, required: true },
    violationCount: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

submissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
