import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from '../models/User.js';
const { User } = pkg;

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      company: 'GLPL'
    });

    console.log('Admin user created successfully:', {
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

initializeAdmin(); 