import dotenv from 'dotenv';
import { connectDb } from './utils/connectDb.js';
import { Exam } from './models/Exam.js';
import { Submission } from './models/Submission.js';

dotenv.config();

async function cleanup() {
    try {
        await connectDb(process.env.MONGODB_URI);

        console.log('🗑️  Deleting all exams...');
        const examResult = await Exam.deleteMany({});
        console.log(`✅ Deleted ${examResult.deletedCount} exams`);

        console.log('🗑️  Deleting all submissions...');
        const submissionResult = await Submission.deleteMany({});
        console.log(`✅ Deleted ${submissionResult.deletedCount} submissions`);

        console.log('\n✨ Database cleaned! All exam history has been deleted.');
        console.log('📝 User accounts remain intact.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
}

cleanup();
