const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['Admin', 'Manager', 'Member'],
            message: 'Role must be either: Admin, Manager, or Member'
        },
        default: 'Member'
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create virtual for assigned tasks
UserSchema.virtual('assignedTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'assignee',
    justOne: false
});

// Create virtual for reported tasks
UserSchema.virtual('reportedTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'reporter',
    justOne: false
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Update last login
UserSchema.methods.updateLastLogin = async function () {
    this.lastLogin = Date.now();
    await this.save({ validateBeforeSave: false });
};

// Prevent duplicate projects
UserSchema.pre('save', async function (next) {
    if (this.isModified('projects')) {
        this.projects = [...new Set(this.projects.map(id => id.toString()))];
    }
    next();
});

// Static method to get user stats
UserSchema.statics.getUserStats = async function () {
    return await this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema); 