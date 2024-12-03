import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, company } = await request.json();

    // Validate input
    if (!name || !email || !password || !company) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Determine role - admin email gets admin role
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      company,
      role
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { 
        message: 'User registered successfully', 
        user: userWithoutPassword,
        isAdmin: role === 'admin'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 