const modelUser = require('../models/users.model');
const modelPayments = require('../models/payments.model');
const modelProduct = require('../models/products.model');
const modelOtp = require('../models/otp.model');

const bcrypt = require('bcrypt');

const CryptoJS = require('crypto-js');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

const { createApiKey, createRefreshToken, createToken, verifyToken } = require('../services/tokenSevices');
const sendMailForgotPassword = require('../utils/sendMailForgotPassword');

const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');

const moment = require('moment');
const otpGenerator = require('otp-generator');

require('dotenv').config();

class controllerUser {
    async register(req, res) {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            throw new BadRequestError('Vui lòng nhập đày đủ thông tin');
        }
        const user = await modelUser.findOne({ email });
        if (user) {
            throw new BadRequestError('Người dùng đã tồn tại');
        } else {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const passwordHash = bcrypt.hashSync(password, salt);
            const newUser = await modelUser.create({
                fullName,
                email,
                password: passwordHash,
                typeLogin: 'email',
                phone,
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new Created({ message: 'Đăng ký thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: dataToken.email });
        if (user) {
            await createApiKey(user._id);
            const token = await createToken({ id: user._id });
            const refreshToken = await createRefreshToken({ id: user._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        const findUser = await modelUser.findOne({ email });

        if (!findUser.isActive) {
            throw new BadRequestError('Tài khoản của bạn đã bị khóa');
        }

        if (!findUser) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác !!!');
        }

        if (findUser.typeLogin === 'google') {
            throw new BadRequestError('Vui lòng đăng nhập bằng Google');
        }

        const result = await bcrypt.compare(password, findUser.password);

        if (!result) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác !!!');
        }
        if (result) {
            await createApiKey(findUser._id);
            const token = await createToken({ id: findUser._id });
            const refreshToken = await createRefreshToken({ id: findUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async authUser(req, res) {
        const user = req.user;
        const findUser = await modelUser.findOne({ _id: user.id });
        if (!findUser) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        new OK({ message: 'success', metadata: { auth } }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findById(decoded.id);
        const token = await createToken({ id: user._id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async getAllUser(req, res) {
        const data = await modelUser.find();
        new OK({ message: 'Lấy danh sách người dùng thành công', metadata: data }).send(res);
    }

    async logout(req, res) {
        res.setHeader('Set-Cookie', [
            `token=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
            `refreshToken=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
            `logged=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict`,
        ]);
        new OK({ message: 'Đăng xuất thành công !!!' }).send(res);
    }

    async updateUser(req, res) {
        const { id, fullName, email, phone, isActive, isAdmin } = req.body;

        const data = await modelUser.findByIdAndUpdate(
            id,
            { fullName, email, phone, isActive, isAdmin },
            { new: true },
        );
        new OK({ message: 'Cập nhật người dùng thành công', metadata: data }).send(res);
    }

    async getBestSellingProduct(req, res) {
        try {
            const result = await modelPayments.aggregate([
                { $match: { status: 'Đã giao hàng' } }, // Chỉ lấy đơn hàng thành công
                { $unwind: '$product' }, // Tách mảng sản phẩm thành từng document
                {
                    $group: {
                        _id: '$product.productId',
                        totalQuantity: { $sum: '$product.quantity' },
                    },
                },
                { $sort: { totalQuantity: -1 } }, // Sắp xếp giảm dần theo số lượng
                { $limit: 6 }, // Giới hạn số sản phẩm trả về
            ]);
            const data = await Promise.all(
                result.map(async (item) => {
                    const product = await modelProduct.findById(item._id);
                    return product;
                }),
            );
            return res.status(200).json(data);
        } catch (error) {
            console.error(error);
        }
    }

    async getrevenue(req, res) {
        try {
            const today = moment().startOf('day');
            const last7Days = [];

            // Tạo danh sách 7 ngày gần nhất
            for (let i = 6; i >= 0; i--) {
                last7Days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
            }

            // Lấy doanh thu từ MongoDB
            const revenueData = await modelPayments.aggregate([
                {
                    $match: {
                        status: 'Đã giao hàng',
                        createdAt: { $gte: moment().subtract(6, 'days').toDate() },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalRevenue: { $sum: '$totalCartBefore' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            // Chuyển dữ liệu thành object để dễ kiểm tra
            const revenueMap = revenueData.reduce((acc, item) => {
                acc[item._id] = item.totalRevenue;
                return acc;
            }, {});

            // Trả về danh sách đầy đủ 7 ngày (nếu không có dữ liệu thì gán 0)
            const finalRevenueData = last7Days.map((date) => ({
                _id: date,
                totalRevenue: revenueMap[date] || 0,
            }));

            res.json(finalRevenueData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async totalWebsite(req, res) {
        const dataPayments = await modelPayments.find({ status: 'Đã giao hàng' });
        const totalUser = await modelUser.find({});
        const totalProduct = await modelProduct.find({});

        const data = {
            totalUser: totalUser.length,
            totalProduct: totalProduct.length,
            totalPayments: dataPayments.reduce((acc, item) => acc + item.totalCartBefore, 0),
            totalOrder: dataPayments.length,
        };
        new OK({ message: 'OK', metadata: data }).send(res);
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Vui lòng nhập email');
            }

            const user = await modelUser.findOne({ email });
            if (!user) {
                throw new BadRequestError('Email không tồn tại');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, '12345', { expiresIn: '5m' });
            const otp = await otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });

            const saltRounds = 10;

            bcrypt.hash(otp, saltRounds, async function (err, hash) {
                if (err) {
                    console.error('Error hashing OTP:', err);
                } else {
                    await modelOtp.create({
                        email: user.email,
                        otp: hash,
                    });
                    await sendMailForgotPassword(email, otp);

                    return res
                        .setHeader('Set-Cookie', [
                            `tokenResetPassword=${token};  Secure; Max-Age=300; Path=/; SameSite=Strict`,
                        ])
                        .status(200)
                        .json({ message: 'Gửi thành công !!!' });
                }
            });
        } catch (error) {
            console.error('Error forgot password:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async resetPassword(req, res) {
        try {
            const token = req.cookies.tokenResetPassword;
            const { otp, newPassword } = req.body;

            if (!token) {
                throw new BadRequestError('Vui lòng gửi yêu cầu quên mật khẩu');
            }

            const decode = jwt.verify(token, '12345');
            if (!decode) {
                throw new BadRequestError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            const findOTP = await modelOtp
                .findOne({
                    email: decode.email,
                })
                .sort({ createdAt: -1 });
            if (!findOTP) {
                throw new BadRequestError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // So sánh OTP
            const isMatch = await bcrypt.compare(otp, findOTP.otp);
            if (!isMatch) {
                throw new BadRequestError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Tìm người dùng
            const findUser = await modelUser.findOne({ email: decode.email });
            if (!findUser) {
                throw new BadRequestError('Người dùng không tồn tại');
            }

            // Cập nhật mật khẩu mới
            findUser.password = hashedPassword;
            await findUser.save();

            // Xóa OTP sau khi đặt lại mật khẩu thành công
            await modelOtp.deleteOne({ email: decode.email });
            res.clearCookie('tokenResetPassword');
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng liên hệ ADMIN !!' });
        }
    }
}

module.exports = new controllerUser();
