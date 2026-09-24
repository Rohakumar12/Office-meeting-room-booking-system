/**
 * Database Seed Script
 * 
 * ⚠️  IMPORTANT: Change the admin password before deploying to production!
 * 
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');
const BookingSlot = require('../src/models/BookingSlot');

const ROOMS = [
  {
    name: 'Conference Room A',
    location: 'Building A, North Wing',
    floor: '2nd Floor',
    capacity: 10,
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'WiFi', 'Air Conditioning'],
    description: 'A spacious conference room ideal for team meetings and presentations.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  },
  {
    name: 'Conference Room B',
    location: 'Building A, South Wing',
    floor: '2nd Floor',
    capacity: 6,
    amenities: ['TV', 'Whiteboard', 'WiFi', 'Air Conditioning'],
    description: 'A cozy conference room for small team discussions.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800',
  },
  {
    name: 'Board Room',
    location: 'Building B, Executive Floor',
    floor: '5th Floor',
    capacity: 20,
    amenities: [
      'Projector',
      'TV',
      'Video Conferencing',
      'WiFi',
      'Air Conditioning',
      'Conference Phone',
    ],
    description:
      'Premium board room for executive meetings and important presentations.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  },
  {
    name: 'Meeting Room 1',
    location: 'Building A, East Wing',
    floor: '1st Floor',
    capacity: 4,
    amenities: ['TV', 'Whiteboard', 'WiFi'],
    description: 'Small meeting room perfect for quick huddles and 1-on-1s.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
  },
  {
    name: 'Meeting Room 2',
    location: 'Building A, West Wing',
    floor: '1st Floor',
    capacity: 4,
    amenities: ['TV', 'Whiteboard', 'WiFi', 'Air Conditioning'],
    description: 'Compact meeting room with modern amenities.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
  },
  {
    name: 'Training Room',
    location: 'Building C, Learning Center',
    floor: 'Ground Floor',
    capacity: 30,
    amenities: [
      'Projector',
      'Whiteboard',
      'WiFi',
      'Air Conditioning',
      'Flip Chart',
    ],
    description: 'Large training room equipped for workshops, onboarding sessions, and seminars.',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  },
];

const EMPLOYEES = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@office.com',
    password: 'Employee@123',
    department: 'Engineering',
    employeeId: 'EMP001',
    role: 'employee',
  },
  {
    name: 'Priya Patel',
    email: 'priya@office.com',
    password: 'Employee@123',
    department: 'Design',
    employeeId: 'EMP002',
    role: 'employee',
  },
  {
    name: 'Arjun Singh',
    email: 'arjun@office.com',
    password: 'Employee@123',
    department: 'Marketing',
    employeeId: 'EMP003',
    role: 'employee',
  },
  {
    name: 'Neha Gupta',
    email: 'neha@office.com',
    password: 'Employee@123',
    department: 'HR',
    employeeId: 'EMP004',
    role: 'employee',
  },
  {
    name: 'Vikram Mehta',
    email: 'vikram@office.com',
    password: 'Employee@123',
    department: 'Finance',
    employeeId: 'EMP005',
    role: 'employee',
  },
];

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      BookingSlot.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // Create admin
    console.log('👑 Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@office.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      employeeId: 'ADM001',
    });
    console.log(`✅ Admin created: ${admin.email}\n`);

    // Create employees
    console.log('👥 Creating employees...');
    const employees = await User.create(EMPLOYEES);
    console.log(`✅ Created ${employees.length} employees\n`);

    // Create rooms
    console.log('🏢 Creating rooms...');
    const rooms = await Room.create(ROOMS);
    console.log(`✅ Created ${rooms.length} rooms\n`);

    // Create sample bookings
    console.log('📅 Creating sample bookings...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const bookings = [
      // Today's bookings
      {
        roomId: rooms[0]._id,
        userId: employees[0]._id,
        title: 'Sprint Planning',
        description: 'Q4 Sprint planning meeting with the engineering team',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        attendees: 8,
      },
      {
        roomId: rooms[1]._id,
        userId: employees[1]._id,
        title: 'Design Review',
        description: 'Weekly design review and feedback session',
        date: today,
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed',
        attendees: 5,
      },
      {
        roomId: rooms[2]._id,
        userId: employees[2]._id,
        title: 'Marketing Strategy',
        description: 'Q4 marketing strategy presentation to leadership',
        date: today,
        startTime: '09:00',
        endTime: '10:30',
        status: 'confirmed',
        attendees: 15,
      },
      // Tomorrow's bookings
      {
        roomId: rooms[0]._id,
        userId: employees[3]._id,
        title: 'HR All-Hands',
        description: 'Monthly HR all-hands meeting',
        date: tomorrow,
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed',
        attendees: 10,
      },
      {
        roomId: rooms[5]._id,
        userId: employees[4]._id,
        title: 'Finance Training',
        description: 'Annual compliance training for finance team',
        date: tomorrow,
        startTime: '09:00',
        endTime: '17:00',
        status: 'confirmed',
        attendees: 25,
      },
      // Yesterday's (completed)
      {
        roomId: rooms[3]._id,
        userId: employees[0]._id,
        title: '1-on-1 Meeting',
        description: 'Weekly 1-on-1 with manager',
        date: yesterday,
        startTime: '11:00',
        endTime: '11:30',
        status: 'completed',
        attendees: 2,
      },
      {
        roomId: rooms[1]._id,
        userId: employees[2]._id,
        title: 'Product Demo',
        description: 'Product demo for potential client',
        date: yesterday,
        startTime: '14:00',
        endTime: '15:30',
        status: 'completed',
        attendees: 6,
      },
      // Cancelled booking
      {
        roomId: rooms[4]._id,
        userId: employees[1]._id,
        title: 'Design Workshop',
        description: 'UX design workshop (cancelled due to trainer unavailability)',
        date: yesterday,
        startTime: '13:00',
        endTime: '16:00',
        status: 'cancelled',
        attendees: 4,
        cancelledAt: new Date(),
        cancelledBy: employees[1]._id,
      },
    ];

    const createdBookings = await Booking.create(bookings);
    const slots = createdBookings
      .filter((booking) => booking.status === 'confirmed')
      .flatMap((booking) => {
        const [startHour, startMinute] = booking.startTime.split(':').map(Number);
        const [endHour, endMinute] = booking.endTime.split(':').map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        return Array.from({ length: end - start }, (_, offset) => ({
          roomId: booking.roomId,
          bookingId: booking._id,
          date: booking.date,
          minute: start + offset,
        }));
      });
    await BookingSlot.insertMany(slots);
    console.log(`✅ Created ${createdBookings.length} sample bookings\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 Demo Credentials:');
    console.log('─────────────────────────────────────────────────────');
    console.log('👑 Admin:');
    console.log('   Email:    admin@office.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('👤 Employee (multiple accounts available):');
    console.log('   Email:    rahul@office.com');
    console.log('   Password: Employee@123');
    console.log('─────────────────────────────────────────────────────');
    console.log('⚠️  IMPORTANT: Change admin password before production!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
