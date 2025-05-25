const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const email = 'superadmin@example.com';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('SuperAdmin already exists');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash('superpassword', 10);

  const admin = new User({
    name: 'Super Admin',
    email,
    password: hashedPassword,
    role: 'SuperAdmin'
  });

  await admin.save();
  console.log('✅ SuperAdmin created:', email);
  process.exit();
};

createSuperAdmin();
