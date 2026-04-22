import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Submission } from '../src/models/Submission.js';

dotenv.config();

async function clearSubmissions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const result = await Submission.deleteMany({});
        console.log(`Deleted ${result.deletedCount} submissions`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearSubmissions();
