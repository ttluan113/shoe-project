const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPayments = new Schema(
    {
        userId: { type: String, required: true },
        fullName: { type: String, default: '' },
        phone: { type: Number, default: '' },
        address: { type: String, default: '' },
        product: [
            {
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
                size: { type: String, required: true },
            },
        ],
        totalCartBefore: { type: Number, required: true },
        nameCoupon: { type: String, default: '' },
        typePayment: { type: String },
        status: {
            type: String,
            enum: ['Đang xử lý', 'Đang chuẩn bị hàng', 'Đang vận chuyển', 'Đã giao hàng', 'Đã hủy'],
            default: 'Đang xử lý',
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('payments', modelPayments);
