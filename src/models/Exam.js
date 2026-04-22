import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length >= 2 },
    correctIndex: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    questions: { type: [questionSchema], default: [] },
    resultsPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Exam = mongoose.model('Exam', examSchema);
