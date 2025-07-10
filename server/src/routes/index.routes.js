const routesUser = require('../routes/users.routes');
const routesProduct = require('../routes/products.routes');
const routesCategory = require('../routes/category.routes');
const routesCart = require('../routes/cart.routes');
const routesPayments = require('../routes/payments.routes');
const routesCoupon = require('../routes/coupon.routes');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

function routes(app) {
    app.post('/api/register', routesUser);
    app.post('/api/login', routesUser);
    app.get('/api/auth', routesUser);
    app.get('/api/refresh-token', routesUser);
    app.get('/api/users', routesUser);
    app.get('/api/logout', routesUser);
    app.post('/api/login-google', routesUser);
    app.post('/api/update-user', routesUser);
    app.get('/api/product-sell', routesUser);
    app.get('/api/revenue', routesUser);
    app.get('/api/total-website', routesUser);
    app.get('/api/payments-admin2', routesPayments);
    app.post('/api/forgot-password', routesUser);
    app.post('/api/reset-password', routesUser);
    /// products
    app.post('/api/add-product', upload.array('images'), routesProduct);
    app.get('/api/get-all-product', routesProduct);
    app.get('/api/get-product-by-id', routesProduct);
    app.get('/api/search-product', routesProduct);
    app.get('/api/get-all-product-admin', routesProduct);
    app.post('/api/delete-product', routesProduct);
    app.post('/api/update-product', routesProduct);

    /// category
    app.post('/api/add-category', routesCategory);
    app.get('/api/get-category', routesCategory);
    app.get('/api/get-product-by-category', routesProduct);
    app.post('/api/update-category', routesCategory);
    app.post('/api/delete-category', routesCategory);
    //// cart
    app.post('/api/add-cart', routesCart);
    app.get('/api/get-cart', routesCart);
    app.delete('/api/delete-cart', routesCart);
    app.post('/api/update-cart', routesCart);
    app.post('/api/apply-coupon', routesCart);
    app.post('/api/update-quantity', routesCart);
    //// payments
    app.post('/api/create-payments', routesPayments);
    app.get('/api/checkdata-vnpay', routesPayments);
    app.get('/api/checkdata-momo', routesPayments);
    app.get('/api/get-payment', routesPayments);
    app.get('/api/get-payments-user', routesPayments);
    app.get('/api/payments-admin', routesPayments);
    app.put('/api/update-payment', routesPayments);
    app.post('/api/cancel-order', routesPayments);
    //// coupon
    app.post('/api/create-coupon', routesCoupon);
    app.get('/api/coupon', routesCoupon);
    app.get('/api/coupons', routesCoupon);
    app.delete('/api/delete-coupon', routesCoupon);
    app.post('/api/update-coupon', routesCoupon);

    app.get('/api/admin', routesUser);
}

module.exports = routes;
