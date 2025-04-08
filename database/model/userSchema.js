import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }
});

const userData = mongoose.model('user', userSchema);

export default userData;