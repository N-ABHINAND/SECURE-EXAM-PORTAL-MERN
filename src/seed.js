import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDb } from './utils/connectDb.js';
import { User } from './models/User.js';

dotenv.config();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { name, email: email.toLowerCase(), passwordHash, role } },
    { upsert: true, new: true }
  );

  return user;
}

async function main() {
  await connectDb(requireEnv('MONGODB_URI'));

  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');
  const studentEmail = requireEnv('SEED_STUDENT_EMAIL');
  const studentPassword = requireEnv('SEED_STUDENT_PASSWORD');

  const admin = await upsertUser({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });

  const student = await upsertUser({
    name: 'Student',
    email: studentEmail,
    password: studentPassword,
    role: 'student'
  });

  console.log('Seed complete');
  console.log(`Admin: ${admin.email} (${admin._id.toString()})`);
  console.log(`Student: ${student.email} (${student._id.toString()})`);

  await User.db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
