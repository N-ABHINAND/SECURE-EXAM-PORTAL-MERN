import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateXP = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ role: 'student' });

        for (const user of users) {
            // Random XP between 1000 and 50000
            user.xp = Math.floor(Math.random() * (50000 - 1000) + 1000);
            await user.save();
            console.log(`Updated ${user.email} with ${user.xp} XP`);
        }

        console.log('XP Update Complete');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateXP();
