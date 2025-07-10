const modelCategory = require('../models/category.model');
const modelProduct = require('../models/products.model');

const { Created, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class controllerCategory {
    async addCategory(req, res) {
        const { nameCategory } = req.body;
        const category = await modelCategory.findOne({ nameCategory });
        if (category) {
            throw new BadRequestError('Danh mục đã tồn tại');
        }
        const newCategory = new modelCategory({ nameCategory });
        await newCategory.save();
        new Created({ message: 'Thêm danh mục thành công !!!', metadata: newCategory }).send(res);
    }

    async getCategory(req, res) {
        const category = await modelCategory.find();
        const data = await Promise.all(
            category.map(async (item) => {
                const product = await modelProduct.find({ categoryId: item._id });
                return { ...item._doc, productCount: product.length, products: product };
            }),
        );
        new OK({ message: 'Lấy danh mục thành công', metadata: data }).send(res);
    }

    async updateCategory(req, res) {
        const { _id, nameCategory } = req.body;
        const category = await modelCategory.findByIdAndUpdate(_id, { nameCategory }, { new: true });
        new OK({ message: 'Cập nhật danh mục thành công', metadata: category }).send(res);
    }

    async deleteCategory(req, res) {
        const { categoryId } = req.body;
        await modelCategory.findByIdAndDelete(categoryId);
        const product = await modelProduct.find({ categoryId: categoryId });
        const data = await Promise.all(
            product.map(async (item) => {
                await modelProduct.findByIdAndDelete(item._id);
            }),
        );
        new OK({ message: 'Xóa danh mục thành công', metadata: data }).send(res);
    }
}

module.exports = new controllerCategory();
