const modelProduct = require('../models/products.model');
const modelCategory = require('../models/category.model');
const modelCoupon = require('../models/coupon.model');

const mongoose = require('mongoose');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

class controllerProduct {
    async addProduct(req, res) {
        if (req.files.length < 0) {
            throw new BadRequestError('Bạn đang thiếu thông tin');
        }
        const { nameProduct, price, description, categoryId, size } = req.body;
        if (!nameProduct || !price || !description || !size) {
            throw new BadRequestError('Bạn đang thiếu thông tin');
        }

        const images = req.files.map((item) => item.filename);

        const newProduct = new modelProduct({
            nameProduct,
            price,
            description,
            size: JSON.parse(size),
            images,
            categoryId,
            status: true,
        });

        await newProduct.save();
        new Created({ message: 'Thêm sản phẩm thành công !!!', metadata: newProduct }).send(res);
    }

    async getAllProduct(req, res) {
        const dataCategory = await modelCategory.find({});
        const data = await Promise.all(
            dataCategory.map(async (item) => {
                const data = await modelProduct.find({ categoryId: item._id, status: true });
                return {
                    ...item._doc,
                    products: data,
                };
            }),
        );
        new OK({ message: 'Lấy danh sách sản phẩm thành công !!!', metadata: data }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.query;
        const data = await modelProduct.findById(id);

        // Get current date
        const currentDate = new Date();

        // Find valid coupons
        const dataCoupon = await modelCoupon.find({
            minPrice: { $lte: data.price },
            quantity: { $gt: 0 },
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $or: [{ productUsed: 'all' }, { productUsed: data._id.toString() }],
        });

        const productSimilar = await modelProduct.find({ categoryId: data.categoryId }).limit(8);
        new OK({ message: 'Lấy sản phẩm thành công !!!', metadata: { data, productSimilar, dataCoupon } }).send(res);
    }

    async getProductByCategory(req, res) {
        const { id } = req.query;
        if (id === 'all') {
            const data = await modelProduct.find({});
            return new OK({ message: 'Lấy sản phẩm thành công !!!', metadata: data }).send(res);
        } else {
            const data = await modelProduct.find({ categoryId: id });
            return new OK({ message: 'Lấy sản phẩm thành công !!!', metadata: data }).send(res);
        }
    }

    async SearchProduct(req, res) {
        const { nameProduct } = req.query;
        if (!nameProduct || nameProduct.trim() === '' || nameProduct === 'undefined') {
            return new OK({ message: 'Không tìm thấy sản phẩm', metadata: [] }).send(res);
        }

        const dataProducts = await modelProduct.find({ nameProduct: { $regex: nameProduct, $options: 'i' } });
        if (!dataProducts) {
            return new OK({ message: 'Không tìm thấy sản phẩm', metadata: [] }).send(res);
        }
        const validProducts = dataProducts.filter((product) => mongoose.Types.ObjectId.isValid(product._id));

        if (validProducts.length === 0) {
            return new OK({ message: 'Không tìm thấy sản phẩm', metadata: [] }).send(res);
        }

        return new OK({ message: 'Tìm kiếm sản phẩm thành công', metadata: validProducts }).send(res);
    }

    async getAllProductAdmin(req, res) {
        const dataProduct = await modelProduct.find({});
        const data = await Promise.all(
            dataProduct.map(async (item) => {
                const dataCategory = await modelCategory.findById(item.categoryId);
                return {
                    ...item._doc,
                    categoryId: dataCategory._id,
                };
            }),
        );
        new OK({ message: 'ok', metadata: data }).send(res);
    }

    async deleteProduct(req, res) {
        const { idProduct } = req.body;
        const data = await modelProduct.deleteOne({ _id: idProduct });
        new OK({ message: 'Xóa sản phẩm thành công !!!', metadata: data }).send(res);
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.body;

            if (!id) {
                throw new BadRequestError('ID sản phẩm không hợp lệ');
            }

            // Tìm sản phẩm cần cập nhật
            const product = await modelProduct.findById(id);
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }

            // Lấy dữ liệu từ request body
            const { nameProduct, price, description, categoryId, status, size } = req.body;

            // Chuyển đổi size từ chuỗi JSON thành mảng (nếu là chuỗi)
            let parsedSize = size;
            if (typeof size === 'string') {
                try {
                    parsedSize = JSON.parse(size);
                } catch (e) {
                    throw new BadRequestError('Dữ liệu size không hợp lệ');
                }
            }

            // Cập nhật sản phẩm (giữ nguyên ảnh cũ)
            const updatedProduct = await modelProduct.findByIdAndUpdate(
                id,
                {
                    nameProduct,
                    price,
                    description,
                    categoryId,
                    status,
                    size: parsedSize,
                    // Không cập nhật trường images
                },
                { new: true }, // Trả về document sau khi cập nhật
            );

            new OK({ message: 'Cập nhật sản phẩm thành công !!!', metadata: updatedProduct }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async updateStautsProduct(req, res) {
        const { id, status } = req.body;
        const data = await modelProduct.findByIdAndUpdate(id, { status }, { new: true });
        new OK({ message: 'Cập nhật trạng thái sản phẩm thành công !!!', metadata: data }).send(res);
    }
}

module.exports = new controllerProduct();
