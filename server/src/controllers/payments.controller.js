const modelCart = require('../models/cart.model');
const modelPayments = require('../models/payments.model');
const modelProduct = require('../models/products.model');
const modelUser = require('../models/users.model');
const modelCoupon = require('../models/coupon.model');

const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const axios = require('axios');
const crypto = require('crypto');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

class controllerPayments {
    async createPayments(req, res) {
        const { id } = req.user;
        const { typePayment } = req.body;

        const findCart = await modelCart.findOne({ userId: id });

        const { fullName, phone, address } = findCart;

        if (!fullName || !phone || !address) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        if (!findCart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }
        if (typePayment === 'COD') {
            const newPayments = new modelPayments({
                userId: id,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                product: findCart.product,
                totalCartBefore: findCart.totalCartBefore,
                typePayment,
                status: 'Đang xử lý',
                nameCoupon: findCart.nameCoupon,
                totalPriceAfter: findCart.totalPriceAfter,
            });

            await modelCoupon.findOneAndUpdate({ nameCoupon: findCart.nameCoupon }, { $inc: { quantity: -1 } });
            await newPayments.save();

            await findCart.deleteOne();

            new Created({ message: 'Tạo đơn hàng thành công', metadata: newPayments }).send(res);
        }

        if (typePayment === 'VNPAY') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: 'NXZM3DWFR0LC4R5VBK85OJZS1UE9KI6F',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: findCart.totalCartBefore, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: findCart._id,
                vnp_OrderInfo: `${findCart._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/checkdata-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            new Created({ message: 'Tạo đơn hàng thành công', metadata: vnpayResponse }).send(res);
        }
        if (typePayment === 'Momo') {
            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            const requestId = partnerCode + new Date().getTime();
            const orderId = requestId;
            const orderInfo = `${findCart._id}`;
            const redirectUrl = `http://localhost:3000/api/checkdata-momo`;
            const ipnUrl = `http://localhost:3000/api/checkdata-momo`;
            const amount = findCart.totalCartBefore;
            const requestType = 'captureWallet';
            const extraData = `${findCart.address}`; // Include address in extraData

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: 'en',
            };

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            res.status(200).json(response.data);
        }
    }

    async checkDataVNPay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo;
            const findCart = await modelCart.findOne({ _id: idCart });

            const newPayment = new modelPayments({
                userId: findCart.userId,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                product: findCart.product,
                totalCartBefore: findCart.totalCartBefore,
                typePayment: 'VNPAY',
                status: 'Đang xử lý',
                nameCoupon: findCart.nameCoupon,
                totalPriceAfter: findCart.totalPriceAfter,
            });
            // await sendMailOrder(findCart.user);
            await modelCoupon.findOneAndUpdate({ nameCoupon: findCart.nameCoupon }, { $inc: { quantity: -1 } });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`http://localhost:5173/paymentsuccess/${newPayment._id}`);
        }
    }

    async checkDataMomo(req, res) {
        const { orderInfo } = req.query;
        const findCart = await modelCart.findOne({ _id: orderInfo });

        const newPayment = new modelPayments({
            userId: findCart.userId,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            product: findCart.product,
            totalCartBefore: findCart.totalCartBefore,
            typePayment: 'MOMO',
            status: 'Đang xử lý',
            nameCoupon: findCart.nameCoupon,
            totalPriceAfter: findCart.totalPriceAfter,
        });
        await modelCoupon.findOneAndUpdate({ nameCoupon: findCart.nameCoupon }, { $inc: { quantity: -1 } });
        await newPayment.save();
        await findCart.deleteOne();
        return res.redirect(`http://localhost:5173/paymentsuccess/${newPayment._id}`);
    }

    async getPayment(req, res) {
        const { id } = req.query;
        const findPayment = await modelPayments.findOne({ _id: id });
        new OK({ message: 'Lấy đơn hàng thành công', metadata: findPayment }).send(res);
    }

    async getPaymentsUser(req, res) {
        const { id } = req.user;
        const findPayments = await modelPayments.find({ userId: id });
        const data = await Promise.all(
            findPayments.map(async (item) => {
                const productsWithDetails = await Promise.all(
                    item.product.map(async (productItem) => {
                        const productDetail = await modelProduct.findOne({ _id: productItem.productId });
                        return {
                            ...productItem._doc,
                            productDetail,
                            size: productItem.size,
                            quantity: productItem.quantity,
                        };
                    }),
                );

                return {
                    ...item._doc,
                    products: productsWithDetails,
                };
            }),
        );

        new OK({ message: 'Lấy đơn hàng thành công', metadata: data }).send(res);
    }

    async getPaymentAdmin(req, res) {
        const dataPayments = await modelPayments.find({}).sort({ createdAt: -1 }).limit(5);
        const data = await Promise.all(
            dataPayments.map(async (item) => {
                const user = await modelUser.findOne({ _id: item.userId });
                return {
                    ...item._doc,
                    user,
                };
            }),
        );
        new OK({ message: 'OK', metadata: data }).send(res);
    }

    async cancelOrder(req, res) {
        const { idOrder } = req.body;
        const data = await modelPayments.findByIdAndUpdate(idOrder, { status: 'Đã hủy' }, { new: true });
        new OK({ message: 'Đã hủy đơn hàng thành công', metadata: data }).send(res);
    }

    async getPaymentAdmin2(req, res) {
        const dataPayments = await modelPayments.find({});
        const data = await Promise.all(
            dataPayments.map(async (item) => {
                const user = await modelUser.findOne({ _id: item.userId });

                // Fetch details for all products in the order
                const products = await Promise.all(
                    item.product.map(async (productItem) => {
                        const productDetail = await modelProduct.findOne({ _id: productItem.productId });
                        return {
                            ...productItem._doc,
                            productDetail,
                        };
                    }),
                );

                return {
                    ...item._doc,
                    user,
                    products,
                };
            }),
        );
        new OK({ message: 'OK', metadata: data }).send(res);
    }

    async updatePayment(req, res) {
        const { id, status } = req.body;
        const updatePayment = await modelPayments.findByIdAndUpdate(id, { status }, { new: true });
        new OK({ message: 'Cập nhật trạng thái đơn hàng thành công', metadata: updatePayment }).send(res);
    }
}

module.exports = new controllerPayments();
