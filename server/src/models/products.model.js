const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelProduct = new Schema(
    {
        nameProduct: { type: String, required: true },
        price: { type: Number, required: true },
        images: [{ type: String, required: true }],
        description: { type: String, required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'category' },
        size: [
            {
                size: { type: String, required: true },
                quantity: { type: Number, required: true },
            },
        ],
        status: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Product', modelProduct);
