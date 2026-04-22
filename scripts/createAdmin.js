import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Check if admin already exists
        const existing = await User.findOne({ email: 'admin@example.com' });
        if (existing) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        // Create admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            department: 'Administration',
            college: 'Admin College',
            xp: 0
        });

        console.log('✅ Admin created!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();
