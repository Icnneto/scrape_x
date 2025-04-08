import mongoose from "mongoose";

const platformAccountSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, enum: ['X', 'youtube'], required: true }
});

const platformAccount = mongoose.model('PlatformAccount', platformAccountSchema);

export default platformAccount;