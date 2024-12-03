const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Define User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    company: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

async function initializeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
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

// Run the function
initializeAdmin(); 