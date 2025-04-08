import mongoose from "mongoose";

const scrapedDataSchema = new mongoose.Schema({
    platformAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformAccount', required: true },
    num_followers: { type: Number, required: true },
    num_following: { type: Number, required: true }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    }
});

const scrapedData = mongoose.model('scraped_data', scrapedDataSchema);

export default scrapedData;