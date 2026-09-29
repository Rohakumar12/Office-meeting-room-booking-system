const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
      trim: true,
    },

    //     employeeId = EMP001 → indexed
    // employeeId = EMP002 → indexed

    // employeeId missing → not indexed
    // employeeId missing → not indexed
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
      maxlength: [2_100_000, "Profile photo is too large"],
    },
  },
  {
    timestamps: true, // mongodb automaticaly add createdAt , updatedAt
    toJSON: {
      //toJSON controls what happens when a Mongoose document is converted into JSON, usually when you send it in an API response
      transform: function (doc, ret) {
        // it run transform when we send res.json(their data)
        delete ret.password;
        return ret;
      },
    },
  },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next(); //this = the particular user document currently being saved //whole document
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes->  schema-level way to define indexes that Mongoose will create in MongoDB.
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });


const User = mongoose.model('User', userSchema);
module.exports = User;
