import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // RBAC (Role Based Access Control)
    role: {
        type: String,
        enum: ['RANGER', 'ENGINEER'],
        default: 'RANGER'
    },

    // Assignment Logic
    department: {
        type: String,
        enum: ['TECH_OPS', 'WEAPONS', 'ZORDS', 'MEDICAL', 'None'],
        default: 'None'
    },
    // Availability for Auto-Assignment
    isOnline: { type: Boolean, default: false },
    workloadScore: { type: Number, default: 0 }, // Current active tickets count

    refreshToken: { type: String } // For session management
}, { timestamps: true });

export default mongoose.model('User', UserSchema);