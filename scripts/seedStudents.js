import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const names = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun",
    "Sai", "Reyansh", "Ayan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Neel", "Siddharth", "Shivansh",
    "Dhruv", "Rudra", "Ansh", "Rohit", "Kabir",
    "Ananya", "Diya", "Saanvi", "Anya", "Pari",
    "Riya", "Myra", "Aadhya", "Kiara", "Ira"
];

const seedStudents = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const passwordHash = await bcrypt.hash('password123', 10);

        console.log('Creating 30 students...');

        for (let i = 0; i < 30; i++) {
            const num = (i + 1).toString().padStart(3, '0');
            const rollNo = `523BAM${num}`;
            const name = names[i];
            const email = `${rollNo.toLowerCase()}@school.com`;

            // Random stats for leaderboard
            const xp = Math.floor(Math.random() * (50000 - 10000) + 10000);

            await User.findOneAndUpdate(
                { email },
                {
                    name: `${name} (${rollNo})`,
                    email,
                    password: passwordHash,
                    role: 'student',
                    department: 'BAM',
                    college: 'Main Campus',
                    xp
                },
                { upsert: true, new: true }
            );
            console.log(`Created ${rollNo} - ${name}`);
        }

        console.log('Seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding students:', error);
        process.exit(1);
    }
};

seedStudents();
