const modelCart = require('../models/cart.model');
const modelProduct = require('../models/products.model');
const modelCoupon = require('../models/coupon.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class controllerCart {
    async addCart(req, res) {
        const { productId, size, quantity } = req.body;
        const { id } = req.user;

        if (!productId || !size || !quantity) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findProduct = await modelProduct.findById(productId);
        if (!findProduct) {
            throw new BadRequestError('Sản phẩm không tồn tại');
        }

        const quantityProduct = findProduct.size.find((item) => item.size === size);
        if (quantityProduct.quantity < quantity) {
            throw new BadRequestError('Số lượng sản phẩm không đủ');
        } else {
            quantityProduct.quantity -= quantity;
            await findProduct.save();
        }

        const totalProduct = findProduct.price * quantity;
        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            const newCart = new modelCart({
                userId: id,
                product: [
                    {
                        productId,
                        quantity,
                        size,
                    },
                ],
                totalCartBefore: totalProduct,
                totalAfterDiscount: totalProduct,
            });
            await newCart.save();
            new OK({ message: 'Thêm giỏ hàng thành công', metadata: newCart }).send(res);
        } else {
            findCart.product.push({
                productId,
                quantity,
                size,
            });

            findCart.totalCartBefore += totalProduct;
            findCart.totalAfterDiscount += totalProduct;
            await findCart.save();
            new OK({ message: 'Thêm giỏ hàng thành công', metadata: findCart }).send(res);
        }
    }

    async getCart(req, res) {
        const { id } = req.user;
        const findCart = await modelCart.findOne({ userId: id });

        if (!findCart) {
            return new OK({ message: 'Giỏ hàng không tồn tại', metadata: [] }).send(res);
        }
        const data = await Promise.all(
            findCart.product.map(async (item) => {
                const findProduct = await modelProduct.findById(item.productId);
                const findCoupon = await modelCoupon.findOne({ nameCoupon: findCart.nameCoupon });
                return {
                    ...findProduct._doc,
                    quantity: item.quantity,
                    size: item.size,
                    sizeProduct: findProduct.size,
                    totalPrice: findCart.totalCartBefore,
                    nameCoupon: findCart.nameCoupon,
                    discount: findCoupon?.discount,
                };
            }),
        );

        new OK({ message: 'success', metadata: data }).send(res);
    }

    async deleteProductCart(req, res) {
        const { idProduct, size } = req.body;
        const { id } = req.user;

        if (!idProduct || !size) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        // Tìm giỏ hàng của user
        const findCart = await modelCart.findOne({ userId: id });

        if (!findCart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        // Kiểm tra sản phẩm có trong giỏ hàng không
        const productIndex = findCart.product.findIndex((item) => item.productId === idProduct && item.size === size);

        if (productIndex === -1) {
            throw new BadRequestError('Sản phẩm không tồn tại trong giỏ hàng');
        }

        // Lấy sản phẩm cần xóa
        const removedProduct = findCart.product[productIndex];

        // Xóa sản phẩm khỏi giỏ hàng
        findCart.product.splice(productIndex, 1);

        // Cập nhật tổng tiền trước khi giảm giá
        const productData = await modelProduct.findById(removedProduct.productId);
        if (productData) {
            findCart.totalCartBefore -= productData.price * removedProduct.quantity;
        }

        // Đảm bảo tổng tiền không âm
        if (findCart.totalCartBefore < 0) {
            findCart.totalCartBefore = 0;
        }

        // Nếu giỏ hàng trống, đặt tổng tiền về 0
        if (findCart.product.length === 0) {
            findCart.totalCartBefore = 0;
            findCart.nameCoupon = null;
            findCart.totalAfterDiscount = 0;
        }

        // Cập nhật số lượng đúng size của sản phẩm
        await modelProduct.updateOne(
            { _id: removedProduct.productId, 'size.size': size },
            { $inc: { 'size.$.quantity': removedProduct.quantity } },
        );

        // Lưu giỏ hàng sau khi cập nhật
        await findCart.save();

        new OK({ message: 'Xóa sản phẩm thành công', metadata: findCart }).send(res);
    }

    async updateCart(req, res) {
        const { name, phone, address, nameCoupon } = req.body;
        const { id } = req.user;
        if (!name || !phone || !address) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        findCart.fullName = name;
        findCart.phone = phone;
        findCart.address = address;
        findCart.nameCoupon = nameCoupon || null;
        await findCart.save();

        new OK({ message: 'Cập nhật giỏ hàng thành công', metadata: findCart }).send(res);
    }

    async applyCoupon(req, res) {
        const { nameCoupon } = req.body;
        const { id } = req.user;
        const dataCart = await modelCart.findOne({ userId: id });
        const findCoupon = await modelCoupon.findOne({ nameCoupon });
        const productUser = dataCart.product.map((item) => item.productId);
        if (!findCoupon.productUsed.some((product) => productUser.includes(product))) {
            throw new BadRequestError('Mã giảm giá không hợp lệ');
        }

        if (!dataCart.nameCoupon) {
            const dataCoupon = await modelCoupon.findOne({ nameCoupon });
            if (dataCoupon) {
                dataCart.totalCartBefore -= dataCoupon.discount;
            } else {
                throw new BadRequestError('Mã giảm giá không tồn tại');
            }
            await dataCart.save();
        }

        if (dataCart) {
            const updatedCart = await modelCart.findOneAndUpdate({ userId: id }, { nameCoupon });

            new OK({ message: 'Áp dụng mã giảm giá thành công', metadata: updatedCart }).send(res);
        }
    }

    async updateQuantity(req, res) {
        const { idProduct, size, quantity } = req.body;
        const { id } = req.user;

        if (!idProduct || !size || quantity === undefined) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const findProduct = await modelProduct.findById(idProduct);
        if (!findProduct) {
            throw new BadRequestError('Sản phẩm không tồn tại');
        }

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        // Find product in cart
        const cartItem = findCart.product.find((item) => item.productId === idProduct && item.size === size);

        if (!cartItem) {
            throw new BadRequestError('Sản phẩm không tồn tại trong giỏ hàng');
        }

        // Find product size information
        const productSize = findProduct.size.find((item) => item.size === size);
        if (!productSize) {
            throw new BadRequestError('Kích thước sản phẩm không hợp lệ');
        }

        // Calculate available quantity (original product quantity + current cart quantity)
        const availableQuantity = productSize.quantity + cartItem.quantity;

        if (quantity > availableQuantity) {
            throw new BadRequestError('Số lượng sản phẩm không đủ');
        }

        // Calculate price difference for updating totals
        const priceDifference = findProduct.price * (quantity - cartItem.quantity);

        // Update product quantity in stock
        productSize.quantity = availableQuantity - quantity;
        await findProduct.save();

        // Update cart item quantity
        cartItem.quantity = quantity;

        // Update cart totals
        findCart.totalCartBefore += priceDifference;
        findCart.totalAfterDiscount += priceDifference;

        await findCart.save();

        new OK({ message: 'Cập nhật số lượng thành công', metadata: findCart }).send(res);
    }
}

module.exports = new controllerCart();
