import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from one level up (backend/.env)
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmins = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const admins = [
            { name: 'Principal Admin', email: 'admin1@school.com', password: 'password123' },
            { name: 'Vice Principal', email: 'admin2@school.com', password: 'password123' },
            { name: 'Senior Teacher', email: 'admin3@school.com', password: 'password123' },
            { name: 'Exam Controller', email: 'admin4@school.com', password: 'password123' },
            { name: 'IT Admin', email: 'admin5@school.com', password: 'password123' },
        ];

        console.log('Creating 5 new admins...');

        for (const admin of admins) {
            const exists = await User.findOne({ email: admin.email });
            if (exists) {
                console.log(`- ${admin.email} already exists. promoting if needed...`);
                if (exists.role !== 'admin') {
                    exists.role = 'admin';
                    await exists.save();
                    console.log(`  -> Promoted to admin.`);
                }
                continue;
            }

            const passwordHash = await bcrypt.hash(admin.password, 12);
            await User.create({
                name: admin.name,
                email: admin.email,
                passwordHash,
                role: 'admin', // Explicitly set admin role
                department: 'Administration',
                college: 'Exam Center'
            });
            console.log(`- Created ${admin.email} (Password: password123)`);
        }

        console.log('\nSuccess! All 5 admins are ready.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admins:', error);
        process.exit(1);
    }
};

createAdmins();
