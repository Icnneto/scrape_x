import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    num_followers: { type: Number, required: true },
    num_following: { type: Number, required: true }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    }
});

const userData = mongoose.model('users', userSchema);

export default userData;