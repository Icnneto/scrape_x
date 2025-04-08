import mongoose from "mongoose";

const platformAccountSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    platform: { type: String, enum: ['X', 'youtube'], required: true }
});

const platformAccountModel = mongoose.model('platform_account', platformAccountSchema);

export default platformAccountModel;