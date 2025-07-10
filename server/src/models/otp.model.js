const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelOtp = new Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        index: { type: Date, default: Date.now, expires: 300 },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('otp', modelOtp);
