const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCategory = new Schema(
    {
        nameCategory: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('category', modelCategory);
